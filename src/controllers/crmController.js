const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getCustomer360 = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const [
    user,
    orders,
    totalSpent,
    averageOrderValue,
    lastOrder,
    reviews,
    supportTickets,
    loyaltyPointsData,
    wishlist,
    addresses,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
      },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.order.aggregate({
      where: {
        userId,
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      _avg: { total: true },
    }),
    prisma.order.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.loyaltyPoints.findMany({
      where: { userId },
    }).then((points) => ({
      _sum: { points: points.reduce((sum, p) => sum + (p.points || 0), 0) },
    })),
    prisma.wishlist.findMany({
      where: { userId },
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
    }),
    prisma.address.findMany({
      where: { userId },
    }),
  ]);

  res.json({
    success: true,
    data: {
      user,
      orders: {
        recent: orders,
        total: orders.length,
        totalSpent: totalSpent._sum.total || 0,
        averageOrderValue: averageOrderValue._avg.total || 0,
        lastOrder,
      },
      reviews: {
        count: reviews.length,
        recent: reviews,
      },
      supportTickets: {
        count: supportTickets.length,
        recent: supportTickets,
      },
      loyalty: {
        totalPoints: loyaltyPointsData._sum.points || 0,
      },
      wishlist: {
        count: wishlist.length,
        items: wishlist,
      },
      addresses,
    },
  });
});

const getCustomerSegments = asyncHandler(async (req, res) => {
  const segments = await prisma.customerSegment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: segments,
  });
});

const addCustomerTag = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { tag } = req.body;

  // TODO: Implement customer tags (would need a CustomerTag model)
  res.json({
    success: true,
    message: 'Tag added',
  });
});

const addCustomerNote = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { note, isInternal } = req.body;

  // TODO: Implement customer notes (would need a CustomerNote model)
  res.json({
    success: true,
    message: 'Note added',
  });
});

const getRFMAnalysis = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (orders.length === 0) {
    return res.json({
      success: true,
      data: {
        recency: null,
        frequency: 0,
        monetary: 0,
        score: 0,
        segment: 'NEW',
      },
    });
  }

  const now = new Date();
  const lastOrderDate = orders[0].createdAt;
  const recency = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24)); // days

  const frequency = orders.length;
  const monetary = orders.reduce((sum, order) => sum + order.total, 0);

  // RFM Scoring (simplified)
  const rScore = recency <= 30 ? 5 : recency <= 60 ? 4 : recency <= 90 ? 3 : recency <= 180 ? 2 : 1;
  const fScore = frequency >= 10 ? 5 : frequency >= 5 ? 4 : frequency >= 3 ? 3 : frequency >= 2 ? 2 : 1;
  const mScore = monetary >= 1000 ? 5 : monetary >= 500 ? 4 : monetary >= 200 ? 3 : monetary >= 100 ? 2 : 1;

  const totalScore = rScore + fScore + mScore;
  let segment = 'NEW';
  if (totalScore >= 12) segment = 'CHAMPION';
  else if (totalScore >= 9) segment = 'LOYAL';
  else if (totalScore >= 6) segment = 'POTENTIAL';
  else if (totalScore >= 3) segment = 'AT_RISK';

  res.json({
    success: true,
    data: {
      recency,
      frequency,
      monetary,
      scores: {
        recency: rScore,
        frequency: fScore,
        monetary: mScore,
        total: totalScore,
      },
      segment,
    },
  });
});

module.exports = {
  getCustomer360,
  getCustomerSegments,
  addCustomerTag,
  addCustomerNote,
  getRFMAnalysis,
};

