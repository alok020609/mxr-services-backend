const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    isActive,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {
    isActive: isActive !== undefined ? isActive === 'true' : true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(category && { categoryId: category }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
        },
        inventory: true,
        _count: {
          select: { reviews: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Ensure total is always a number
  const totalCount = total || 0;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const totalPages = Math.ceil(totalCount / limitNum);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalCount,
      pages: totalPages,
      totalPages: totalPages, // Alias for backward compatibility
    },
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      variants: {
        where: { isActive: true },
      },
      inventory: true,
      reviews: {
        where: { status: 'APPROVED' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found',
    });
  }

  // Track recently viewed
  if (req.user) {
    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: product.id,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        productId: product.id,
        viewedAt: new Date(),
      },
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    slug,
    price,
    compareAtPrice,
    originalPrice,
    sku,
    stock,
    images,
    categoryId,
    badges,
    specifications,
    certifications,
    warrantyInfo,
    returnPolicy,
    refundPolicy,
    shippingPolicy,
    exchangePolicy,
    cancellationPolicy,
    careInstructions,
    countryOfOrigin,
    manufacturerInfo,
    brand,
    modelNumber,
    weightDimensions,
    minOrderQuantity,
    maxOrderQuantity,
  } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      price,
      compareAtPrice,
      originalPrice,
      sku,
      stock: stock !== undefined ? stock : 0,
      images: images || [],
      categoryId,
      badges: badges || [],
      specifications: specifications || {},
      certifications: certifications || [],
      warrantyInfo,
      returnPolicy: returnPolicy ? (typeof returnPolicy === 'string' ? JSON.parse(returnPolicy) : returnPolicy) : null,
      refundPolicy: refundPolicy ? (typeof refundPolicy === 'string' ? JSON.parse(refundPolicy) : refundPolicy) : null,
      shippingPolicy: shippingPolicy ? (typeof shippingPolicy === 'string' ? JSON.parse(shippingPolicy) : shippingPolicy) : null,
      exchangePolicy: exchangePolicy ? (typeof exchangePolicy === 'string' ? JSON.parse(exchangePolicy) : exchangePolicy) : null,
      cancellationPolicy: cancellationPolicy ? (typeof cancellationPolicy === 'string' ? JSON.parse(cancellationPolicy) : cancellationPolicy) : null,
      careInstructions,
      countryOfOrigin,
      manufacturerInfo: manufacturerInfo ? (typeof manufacturerInfo === 'string' ? JSON.parse(manufacturerInfo) : manufacturerInfo) : null,
      brand,
      modelNumber,
      weightDimensions: weightDimensions ? (typeof weightDimensions === 'string' ? JSON.parse(weightDimensions) : weightDimensions) : null,
      minOrderQuantity: minOrderQuantity || 1,
      maxOrderQuantity,
      isActive: true,
    },
    include: {
      category: true,
    },
  });

  // Create inventory record (sync with product stock)
  const initialStock = stock !== undefined ? stock : 0;
  await prisma.inventory.create({
    data: {
      productId: product.id,
      stock: initialStock,
      reserved: 0,
      lowStockThreshold: 10,
    },
  });

  // Fetch product with inventory for response
  const productWithInventory = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      category: true,
      inventory: true,
    },
  });

  res.status(201).json({
    success: true,
    data: productWithInventory,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { stock, ...otherData } = req.body;
  
  // Update product
  const updateData = { ...otherData };
  if (stock !== undefined) {
    updateData.stock = stock;
  }
  
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
    include: {
      category: true,
      variants: true,
      inventory: true,
    },
  });

  // Sync stock with Inventory table if stock was updated
  if (stock !== undefined) {
    const inventory = await prisma.inventory.findUnique({
      where: { productId: req.params.id },
    });

    if (inventory) {
      await prisma.inventory.update({
        where: { productId: req.params.id },
        data: { stock },
      });
    } else {
      // Create inventory record if it doesn't exist
      await prisma.inventory.create({
        data: {
          productId: req.params.id,
          stock,
          reserved: 0,
          lowStockThreshold: 10,
        },
      });
    }
  }

  // Fetch updated product with inventory
  const updatedProduct = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      variants: true,
      inventory: true,
    },
  });

  res.json({
    success: true,
    data: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Product deleted',
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  res.json({
    success: true,
    data: categories,
  });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: {
      products: {
        where: { isActive: true },
        take: 20,
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found',
    });
  }

  res.json({
    success: true,
    data: category,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, image, parentId, order } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      image,
      parentId,
      order: order || 0,
      isActive: true,
    },
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({
    success: true,
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Category deleted',
  });
});

const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.json({
      success: true,
      data: [],
    });
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: parseInt(limit),
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: products,
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  searchProducts,
};


