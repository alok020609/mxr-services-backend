const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const advancedSearch = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isActive: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(category && { categoryId: category }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    ...(inStock === 'true' && {
      inventory: {
        stock: { gt: 0 },
      },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        inventory: true,
        variants: {
          where: { isActive: true },
        },
        _count: {
          select: {
            reviews: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Filter by rating if provided
  let filteredProducts = products;
  if (rating) {
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const avgRating = await prisma.review.aggregate({
          where: {
            productId: product.id,
            status: 'APPROVED',
          },
          _avg: { rating: true },
        });
        return {
          ...product,
          averageRating: avgRating._avg.rating || 0,
        };
      })
    );
    filteredProducts = productsWithRatings.filter((p) => p.averageRating >= parseFloat(rating));
  }

  res.json({
    success: true,
    data: filteredProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const { productId, type = 'cross-sell' } = req.query;

  // Get product recommendations
  const recommendations = await prisma.productRecommendation.findMany({
    where: {
      productId,
      type,
    },
    include: {
      recommended: {
        include: {
          category: true,
          inventory: true,
        },
      },
    },
    orderBy: { score: 'desc' },
    take: 10,
  });

  // If no recommendations, get recently viewed or similar category products
  if (recommendations.length === 0 && req.user) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (product) {
      const similarProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: productId },
          isActive: true,
        },
        take: 10,
        include: {
          category: true,
          inventory: true,
        },
      });

      return res.json({
        success: true,
        data: similarProducts.map((p) => ({
          product: p,
          score: 0.5,
        })),
      });
    }
  }

  res.json({
    success: true,
    data: recommendations,
  });
});

const getRecentlyViewed = asyncHandler(async (req, res) => {
  const recentlyViewed = await prisma.recentlyViewed.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          category: true,
          inventory: true,
        },
      },
    },
    orderBy: { viewedAt: 'desc' },
    take: 20,
  });

  res.json({
    success: true,
    data: recentlyViewed,
  });
});

const saveSearch = asyncHandler(async (req, res) => {
  const { query, filters } = req.body;

  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: req.user.id,
      query,
      filters: filters || {},
    },
  });

  res.status(201).json({
    success: true,
    data: savedSearch,
  });
});

const getSavedSearches = asyncHandler(async (req, res) => {
  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: savedSearches,
  });
});

const deleteSavedSearch = asyncHandler(async (req, res) => {
  await prisma.savedSearch.deleteMany({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  res.json({
    success: true,
    message: 'Saved search deleted',
  });
});

module.exports = {
  advancedSearch,
  getRecommendations,
  getRecentlyViewed,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
};


