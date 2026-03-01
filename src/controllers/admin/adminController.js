const prisma = require('../../config/database');
const { asyncHandler } = require('../../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    totalProducts,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
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
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
      },
      recentOrders,
      topProducts,
    },
  });
});

const getStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [sales, users, orders] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      _sum: { total: true },
      _count: { id: true },
      where: { createdAt: { gte: startDate } },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      where: { createdAt: { gte: startDate } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        total: true,
        createdAt: true,
        status: true,
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      sales,
      users,
      orders,
    },
  });
});

module.exports = {
  getDashboard,
  getStats,
};


