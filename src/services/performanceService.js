const prisma = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

class PerformanceService {
  // Query optimization - Get products with optimized query
  static async getProductsOptimized(filters = {}) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...filters,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        inventory: {
          select: {
            stock: true,
            reserved: true,
          },
        },
      },
      take: 50,
    });

    await cache.set(cacheKey, products, 300); // Cache for 5 minutes

    return products;
  }

  // Database connection pooling configuration
  static getConnectionPoolConfig() {
    return {
      max: 20, // Maximum pool size
      min: 5, // Minimum pool size
      idle: 10000, // Idle timeout
      acquire: 30000, // Max time to wait for connection
      evict: 1000, // Eviction run interval
    };
  }

  // Query result pagination optimization
  static async paginateQuery(model, where, options = {}) {
    const { page = 1, limit = 20, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma[model].findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma[model].count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // Batch operations to reduce database round trips
  static async batchUpdate(updates) {
    const results = await Promise.all(
      updates.map((update) =>
        prisma.product.update({
          where: { id: update.id },
          data: update.data,
        })
      )
    );

    return results;
  }

  // Materialized view refresh (for analytics)
  static async refreshMaterializedView(viewName) {
    // TODO: Implement materialized view refresh
    // This would be database-specific (PostgreSQL)
    logger.info(`Refreshing materialized view: ${viewName}`);
  }
}

module.exports = { PerformanceService };


