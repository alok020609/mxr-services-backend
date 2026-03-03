const prisma = require('../config/database');
const logger = require('../utils/logger');

class AdvancedAnalyticsService {
  // Real-time analytics dashboard
  static async getRealTimeDashboard() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [ordersLastHour, ordersLast24Hours, revenueLastHour, revenueLast24Hours, activeUserSessions] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: lastHour },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: last24Hours },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: lastHour },
          status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: last24Hours },
          status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
        },
        _sum: { total: true },
      }),
      prisma.session.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: lastHour },
          expiresAt: { gt: now },
        },
      }),
    ]);

    const activeUsers = activeUserSessions.length;

    return {
      lastHour: {
        orders: ordersLastHour,
        revenue: revenueLastHour._sum.total || 0,
        activeUsers,
      },
      last24Hours: {
        orders: ordersLast24Hours,
        revenue: revenueLast24Hours._sum.total || 0,
      },
      timestamp: now,
    };
  }

  // Live order tracking
  static async getLiveOrders() {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PACKED', 'SHIPPED'] },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    // Format user name from firstName and lastName
    return orders.map((order) => ({
      ...order,
      user: {
        ...order.user,
        name: order.user.firstName && order.user.lastName
          ? `${order.user.firstName} ${order.user.lastName}`
          : order.user.firstName || order.user.lastName || null,
      },
    }));
  }

  // Predictive analytics - Churn prediction
  static async predictChurn(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const lastOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const daysSinceLastOrder = lastOrder
      ? Math.floor((new Date() - lastOrder.createdAt) / (1000 * 60 * 60 * 24))
      : 999;

    const totalOrders = await prisma.order.count({
      where: {
        userId,
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
    });

    // Simple churn prediction algorithm
    let churnProbability = 0;
    if (daysSinceLastOrder > 90) churnProbability = 0.9;
    else if (daysSinceLastOrder > 60) churnProbability = 0.7;
    else if (daysSinceLastOrder > 30) churnProbability = 0.5;
    else if (daysSinceLastOrder > 14) churnProbability = 0.3;

    if (totalOrders === 0) churnProbability = 0.8;
    else if (totalOrders === 1) churnProbability = Math.min(churnProbability + 0.2, 1);

    return {
      userId,
      churnProbability,
      daysSinceLastOrder,
      totalOrders,
      riskLevel: churnProbability > 0.7 ? 'HIGH' : churnProbability > 0.4 ? 'MEDIUM' : 'LOW',
    };
  }

  // Product affinity prediction
  static async predictProductAffinity(userId, productId) {
    const userOrders = await prisma.order.findMany({
      where: {
        userId,
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const targetProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!targetProduct) {
      throw new Error('Product not found');
    }

    // Simple affinity calculation based on category overlap
    let affinityScore = 0;
    const userCategories = new Set();

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product.categoryId) {
          userCategories.add(item.product.categoryId);
        }
      });
    });

    if (targetProduct.categoryId && userCategories.has(targetProduct.categoryId)) {
      affinityScore = 0.7;
    }

    // Increase score if user has viewed similar products
    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: {
        userId,
        product: {
          categoryId: targetProduct.categoryId,
        },
      },
      take: 5,
    });

    if (recentlyViewed.length > 0) {
      affinityScore = Math.min(affinityScore + 0.2, 1);
    }

    return {
      userId,
      productId,
      affinityScore,
      recommendation: affinityScore > 0.5 ? 'STRONG' : affinityScore > 0.3 ? 'MODERATE' : 'WEAK',
    };
  }

  // Next best product prediction
  static async getNextBestProduct(userId) {
    const userOrders = await prisma.order.findMany({
      where: {
        userId,
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    const userCategories = new Set();
    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product.categoryId) {
          userCategories.add(item.product.categoryId);
        }
      });
    });

    // Find products in user's preferred categories
    const recommendedProducts = await prisma.product.findMany({
      where: {
        categoryId: { in: Array.from(userCategories) },
        isActive: true,
        id: {
          notIn: userOrders.flatMap((o) => o.items.map((i) => i.productId)),
        },
      },
      include: {
        category: true,
        inventory: {
          where: { stock: { gt: 0 } },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return recommendedProducts;
  }

  // UTM parameter tracking
  static async trackUTMParameters(orderId, utmParams) {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'ORDER_PLACED',
        entityType: 'ORDER',
        entityId: orderId,
        metadata: {
          utmSource: utmParams.utm_source,
          utmMedium: utmParams.utm_medium,
          utmCampaign: utmParams.utm_campaign,
          utmTerm: utmParams.utm_term,
          utmContent: utmParams.utm_content,
        },
      },
    });
  }

  // Multi-touch attribution
  static async getMultiTouchAttribution(userId, startDate, endDate) {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        eventType: {
          in: ['PAGE_VIEW', 'PRODUCT_VIEW', 'CART_ADD', 'ORDER_PLACED'],
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const attribution = {
      firstTouch: events[0]?.metadata || {},
      lastTouch: events[events.length - 1]?.metadata || {},
      touchpoints: events.map((e) => ({
        eventType: e.eventType,
        timestamp: e.createdAt,
        metadata: e.metadata,
      })),
    };

    return attribution;
  }

  // Conversion funnel tracking
  static async getConversionFunnel(startDate, endDate) {
    const [visitors, productViews, cartAdds, checkouts, orders] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          eventType: 'PAGE_VIEW',
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          eventType: 'PRODUCT_VIEW',
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          eventType: 'CART_ADD',
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          eventType: 'CHECKOUT_STARTED',
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
          status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
        },
      }),
    ]);

    return {
      visitors,
      productViews,
      cartAdds,
      checkouts,
      orders,
      conversionRates: {
        visitorToView: visitors > 0 ? (productViews / visitors) * 100 : 0,
        viewToCart: productViews > 0 ? (cartAdds / productViews) * 100 : 0,
        cartToCheckout: cartAdds > 0 ? (checkouts / cartAdds) * 100 : 0,
        checkoutToOrder: checkouts > 0 ? (orders / checkouts) * 100 : 0,
        overall: visitors > 0 ? (orders / visitors) * 100 : 0,
      },
    };
  }
}

module.exports = { AdvancedAnalyticsService };


