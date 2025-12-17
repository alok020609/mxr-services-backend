const prisma = require('../config/database');
const { logger } = require('../utils/logger');

class APIGatewayService {
  // Get user's API tier
  static async getUserTier(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { apiTier: true },
    });

    return user?.apiTier || 'free';
  }

  // Set user's API tier
  static async setUserTier(userId, tier) {
    await prisma.user.update({
      where: { id: userId },
      data: { apiTier: tier },
    });
  }

  // Get API usage statistics
  static async getAPIUsage(userId, startDate, endDate) {
    const usage = await prisma.apiUsage.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      groupBy: {
        endpoint: true,
      },
      _count: {
        id: true,
      },
    });

    return usage;
  }

  // Record API usage
  static async recordAPIUsage(userId, endpoint, method, responseTime, statusCode) {
    await prisma.apiUsage.create({
      data: {
        userId,
        endpoint,
        method,
        responseTime,
        statusCode,
      },
    });
  }

  // Get API version info
  static async getAPIVersionInfo(version) {
    const versionInfo = await prisma.apiVersion.findFirst({
      where: { version },
    });

    return versionInfo || {
      version,
      status: 'CURRENT',
      releaseDate: new Date(),
      deprecationDate: null,
      sunsetDate: null,
    };
  }

  // Deprecate API version
  static async deprecateAPIVersion(version, deprecationDate, sunsetDate) {
    await prisma.apiVersion.upsert({
      where: { version },
      update: {
        status: 'DEPRECATED',
        deprecationDate: new Date(deprecationDate),
        sunsetDate: new Date(sunsetDate),
      },
      create: {
        version,
        status: 'DEPRECATED',
        deprecationDate: new Date(deprecationDate),
        sunsetDate: new Date(sunsetDate),
      },
    });
  }
}

module.exports = { APIGatewayService };


