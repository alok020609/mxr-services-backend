const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getFlashSales = asyncHandler(async (req, res) => {
  const flashSales = await prisma.flashSale.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: 'desc' },
  });

  res.json({
    success: true,
    data: flashSales,
  });
});

const getDeals = asyncHandler(async (req, res) => {
  const deals = await prisma.deal.findMany({
    where: {
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
    },
    orderBy: { validFrom: 'desc' },
  });

  res.json({
    success: true,
    data: deals,
  });
});

const getBundles = asyncHandler(async (req, res) => {
  const bundles = await prisma.productBundle.findMany({
    where: { isActive: true },
    include: {
      bundleProducts: {
        include: {
          category: true,
          inventory: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: bundles,
  });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const { productId, type = 'cross-sell' } = req.query;

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

  res.json({
    success: true,
    data: recommendations,
  });
});

const getAbandonedCarts = asyncHandler(async (req, res) => {
  // Get carts that haven't been updated in 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const abandonedCarts = await prisma.cart.findMany({
    where: {
      updatedAt: { lt: oneDayAgo },
      items: {
        some: {},
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      items: {
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
    data: abandonedCarts,
  });
});

module.exports = {
  getFlashSales,
  getDeals,
  getBundles,
  getRecommendations,
  getAbandonedCarts,
};


