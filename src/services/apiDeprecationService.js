const prisma = require('../config/database');
const logger = require('../utils/logger');

class APIDeprecationService {
  // API Versioning Strategy
  static getVersioningStrategy() {
    return {
      urlVersioning: true, // /api/v1/..., /api/v2/...
      headerVersioning: true, // X-API-Version header
      defaultVersion: 'v1',
      supportedVersions: ['v1', 'v2'],
    };
  }

  // Deprecation Policy
  static getDeprecationPolicy() {
    return {
      noticePeriod: 90, // 90 days notice before deprecation
      sunsetPeriod: 180, // 180 days before sunset
      communicationChannels: ['email', 'api-docs', 'changelog', 'deprecation-headers'],
    };
  }

  // Create deprecation notice
  static async createDeprecationNotice(endpoint, version, replacement, deprecationDate, sunsetDate) {
    const notice = await prisma.apiDeprecation.create({
      data: {
        endpoint,
        version,
        replacement,
        deprecationDate: new Date(deprecationDate),
        sunsetDate: new Date(sunsetDate),
        status: 'ANNOUNCED',
        noticePeriod: 90,
      },
    });

    // Log deprecation
    logger.warn(`API Deprecation Notice: ${endpoint} in ${version} will be deprecated on ${deprecationDate}`);

    return notice;
  }

  // Get deprecation notices
  static async getDeprecationNotices(version) {
    const where = {
      status: { in: ['ANNOUNCED', 'DEPRECATED'] },
    };

    if (version) {
      where.version = version;
    }

    const notices = await prisma.apiDeprecation.findMany({
      where,
      orderBy: { deprecationDate: 'asc' },
    });

    return notices;
  }

  // Check if endpoint is deprecated
  static async isDeprecated(endpoint, version) {
    const deprecation = await prisma.apiDeprecation.findFirst({
      where: {
        endpoint,
        version,
        status: { in: ['ANNOUNCED', 'DEPRECATED'] },
      },
    });

    return !!deprecation;
  }

  // Get deprecation headers for response
  static async getDeprecationHeaders(endpoint, version) {
    const deprecation = await prisma.apiDeprecation.findFirst({
      where: {
        endpoint,
        version,
        status: { in: ['ANNOUNCED', 'DEPRECATED'] },
      },
    });

    if (!deprecation) {
      return {};
    }

    const headers = {
      'Deprecation': 'true',
      'Sunset': deprecation.sunsetDate.toISOString(),
    };

    if (deprecation.replacement) {
      headers['Link'] = `<${deprecation.replacement}>; rel="successor-version"`;
    }

    return headers;
  }

  // Version lifecycle management
  static async getVersionLifecycle(version) {
    const versionInfo = await prisma.apiVersion.findFirst({
      where: { version },
    });

    if (!versionInfo) {
      return {
        version,
        status: 'UNKNOWN',
        lifecycle: 'UNKNOWN',
      };
    }

    const lifecycle = {
      version: versionInfo.version,
      status: versionInfo.status,
      releaseDate: versionInfo.releaseDate,
      deprecationDate: versionInfo.deprecationDate,
      sunsetDate: versionInfo.sunsetDate,
      lifecycle: this.calculateLifecycleStage(versionInfo),
    };

    return lifecycle;
  }

  static calculateLifecycleStage(versionInfo) {
    const now = new Date();
    if (versionInfo.status === 'CURRENT') {
      return 'ACTIVE';
    }
    if (versionInfo.status === 'DEPRECATED') {
      if (versionInfo.sunsetDate && now < versionInfo.sunsetDate) {
        return 'DEPRECATED';
      }
      return 'SUNSET';
    }
    return 'UNKNOWN';
  }

  // Client compatibility guarantees
  static getCompatibilityGuarantees() {
    return {
      backwardCompatibility: true,
      breakingChanges: {
        requireNewVersion: true,
        noticePeriod: 90,
      },
      responseFormat: {
        maintainStructure: true,
        addFields: true,
        removeFields: false, // Only in new versions
      },
    };
  }
}

module.exports = { APIDeprecationService };


