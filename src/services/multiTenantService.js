const prisma = require('../config/database');
const logger = require('../utils/logger');

class MultiTenantService {
  // Create tenant
  static async createTenant(tenantData) {
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantData.name,
        domain: tenantData.domain,
        subdomain: tenantData.subdomain,
        isActive: tenantData.isActive !== undefined ? tenantData.isActive : true,
        settings: tenantData.settings || {},
      },
    });

    logger.info(`Tenant created: ${tenant.id}`);
    return tenant;
  }

  // Get tenant
  static async getTenant(tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        settings: true,
      },
    });

    return tenant;
  }

  // Update tenant
  static async updateTenant(tenantId, updateData) {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return tenant;
  }

  // List tenants (admin only)
  static async listTenants(filters = {}) {
    const { page = 1, limit = 20, isActive } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      tenants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Tenant isolation check
  static async verifyTenantAccess(userId, tenantId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, role: true },
    });

    if (!user) {
      return false;
    }

    // Admins can access all tenants
    if (user.role === 'ADMIN') {
      return true;
    }

    // Regular users can only access their own tenant
    return user.tenantId === tenantId;
  }

  // Get tenant statistics
  static async getTenantStats(tenantId) {
    const [users, products, orders, revenue] = await Promise.all([
      prisma.user.count({
        where: { tenantId },
      }),
      prisma.product.count({
        where: { tenantId },
      }),
      prisma.order.count({
        where: { tenantId },
      }),
      prisma.order.aggregate({
        where: {
          tenantId,
          status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      tenantId,
      users,
      products,
      orders,
      revenue: revenue._sum.total || 0,
    };
  }
}

module.exports = { MultiTenantService };


