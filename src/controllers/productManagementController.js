const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getProductSpecifications = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      specifications: true,
    },
  });

  res.json({
    success: true,
    data: product?.specifications || {},
  });
});

const updateProductSpecifications = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { specifications } = req.body;

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      specifications: specifications || {},
    },
  });

  res.json({
    success: true,
    data: product,
  });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: {
      category: true,
      inventory: true,
    },
    orderBy: { featuredOrder: 'asc' },
  });

  res.json({
    success: true,
    data: featuredProducts,
  });
});

const setFeaturedProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  // Remove all featured flags
  await prisma.product.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false, featuredOrder: null },
  });

  // Set new featured products
  for (let i = 0; i < productIds.length; i++) {
    await prisma.product.update({
      where: { id: productIds[i] },
      data: {
        isFeatured: true,
        featuredOrder: i + 1,
      },
    });
  }

  res.json({
    success: true,
    message: 'Featured products updated',
  });
});

const getProductCollections = asyncHandler(async (req, res) => {
  const collections = await prisma.productCollection.findMany({
    where: { isActive: true },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: collections,
  });
});

module.exports = {
  getProductSpecifications,
  updateProductSpecifications,
  getFeaturedProducts,
  setFeaturedProducts,
  getProductCollections,
};


