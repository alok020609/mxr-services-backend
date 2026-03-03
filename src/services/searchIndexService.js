const prisma = require('../config/database');
const { addIndexJob } = require('./jobQueueService');
const logger = require('../utils/logger');

class SearchIndexService {
  static async indexProduct(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Build searchable content
    const searchableContent = {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      category: product.category?.name || '',
      tags: product.tags || [],
      specifications: product.specifications || {},
      // Add to search index (could be Elasticsearch, Algolia, etc.)
      // For now, we'll update a searchable field in the database
    };

    // Update product with searchable content
    await prisma.product.update({
      where: { id: productId },
      data: {
        searchableContent: JSON.stringify(searchableContent),
        indexedAt: new Date(),
      },
    });

    logger.info(`Product indexed: ${productId}`);
    return searchableContent;
  }

  static async batchIndexProducts(productIds) {
    const results = [];
    for (const productId of productIds) {
      try {
        const indexed = await this.indexProduct(productId);
        results.push({ productId, success: true, data: indexed });
      } catch (error) {
        results.push({ productId, success: false, error: error.message });
      }
    }
    return results;
  }

  static async reindexAllProducts() {
    // Queue reindex job
    const job = await addIndexJob(
      { type: 'FULL_REINDEX', entity: 'PRODUCT' },
      { priority: 10 }
    );

    logger.info(`Full reindex job queued: ${job.id}`);
    return job;
  }

  static async reindexCategory(categoryId) {
    const products = await prisma.product.findMany({
      where: { categoryId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);
    return this.batchIndexProducts(productIds);
  }

  static async search(query, filters = {}) {
    const { category, minPrice, maxPrice, inStock, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(category && { categoryId: category }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(inStock && {
        inventory: {
          some: {
            stock: { gt: 0 },
          },
        },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          inventory: {
            where: { stock: { gt: 0 } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = { SearchIndexService };


