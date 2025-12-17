const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    averageOrderValue,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startDate },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        role: 'USER',
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      _avg: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalCustomers,
      averageOrderValue: averageOrderValue._avg.total || 0,
      topProducts,
      recentOrders,
    },
  });
});

const calculateCLV = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Get user's order history
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
    },
  });

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

  // Calculate CLV (simplified: average order value * average orders per year * average customer lifespan)
  // This is a simplified calculation
  const clv = averageOrderValue * 12; // Assuming 12 orders per year, 1 year lifespan

  res.json({
    success: true,
    data: {
      userId,
      totalSpent,
      orderCount,
      averageOrderValue,
      clv,
    },
  });
});

const getCohortAnalysis = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  // Get users grouped by registration period
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      orders: {
        where: {
          status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
        },
      },
    },
  });

  // Group by cohort
  const cohorts = {};
  users.forEach((user) => {
    const cohortKey = period === 'month'
      ? `${user.createdAt.getFullYear()}-${user.createdAt.getMonth() + 1}`
      : `${user.createdAt.getFullYear()}-W${Math.ceil(user.createdAt.getDate() / 7)}`;

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = {
        period: cohortKey,
        users: [],
        totalRevenue: 0,
        totalOrders: 0,
      };
    }

    cohorts[cohortKey].users.push(user);
    cohorts[cohortKey].totalRevenue += user.orders.reduce((sum, order) => sum + order.total, 0);
    cohorts[cohortKey].totalOrders += user.orders.length;
  });

  res.json({
    success: true,
    data: Object.values(cohorts),
  });
});

const getFunnelAnalysis = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const [
    visitors,
    cartAdds,
    checkoutStarts,
    orders,
    completedOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { ...where, role: 'USER' } }),
    prisma.cartItem.count({ where }),
    prisma.order.count({ where: { ...where, status: { in: ['CREATED', 'PAYMENT_PENDING', 'PAID'] } } }),
    prisma.order.count({ where }),
    prisma.order.count({ where: { ...where, status: 'COMPLETED' } }),
  ]);

  res.json({
    success: true,
    data: {
      visitors,
      cartAdds,
      checkoutStarts,
      orders,
      completedOrders,
      conversionRates: {
        cartToCheckout: checkoutStarts > 0 ? (checkoutStarts / cartAdds) * 100 : 0,
        checkoutToOrder: orders > 0 ? (orders / checkoutStarts) * 100 : 0,
        orderToCompleted: completedOrders > 0 ? (completedOrders / orders) * 100 : 0,
      },
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

module.exports = {
  getDashboardStats,
  calculateCLV,
  getCohortAnalysis,
  getFunnelAnalysis,
  getCustomerSegments,
};


