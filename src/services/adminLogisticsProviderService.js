const prisma = require('../config/database');
const logger = require('../utils/logger');

class AdminLogisticsProviderService {
  // Configuration validation templates for each provider type
  static getConfigTemplate(providerType) {
    const templates = {
      SHIPROCKET: {
        email: 'string',
        password: 'string',
        apiKey: 'string',
        environment: 'production|sandbox',
      },
      DELHIVERY: {
        clientId: 'string',
        clientSecret: 'string',
        apiKey: 'string',
        environment: 'production|sandbox',
      },
      CLICKPOST: {
        apiKey: 'string',
        secretKey: 'string',
        environment: 'production|sandbox',
      },
      VAMASHIP: {
        apiKey: 'string',
        apiSecret: 'string',
        environment: 'production|sandbox',
      },
      SHIPJEE: {
        apiKey: 'string',
        apiSecret: 'string',
        environment: 'production|sandbox',
      },
      INDISPEED: {
        apiKey: 'string',
        apiSecret: 'string',
        environment: 'production|sandbox',
      },
      ULIP: {
        apiKey: 'string',
        apiSecret: 'string',
        environment: 'production|sandbox',
      },
    };

    return templates[providerType] || {};
  }

  // Validate configuration based on provider type
  static validateConfig(providerType, config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration must be an object');
    }

    const template = this.getConfigTemplate(providerType);
    if (!template || Object.keys(template).length === 0) {
      throw new Error(`No configuration template found for provider type: ${providerType}`);
    }

    // Check required fields
    const requiredFields = Object.keys(template);
    const missingFields = requiredFields.filter(field => !config[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }

    // Validate environment field if present
    if (config.environment && !['production', 'sandbox'].includes(config.environment)) {
      throw new Error('Environment must be either "production" or "sandbox"');
    }

    return true;
  }

  // Mask sensitive fields in configuration
  static maskSensitiveFields(config) {
    if (!config || typeof config !== 'object') {
      return config;
    }

    const sensitiveFields = [
      'password',
      'apiKey',
      'apiSecret',
      'secretKey',
      'clientSecret',
      'token',
      'accessToken',
      'refreshToken',
    ];

    const masked = { ...config };
    sensitiveFields.forEach(field => {
      if (masked[field]) {
        masked[field] = '***' + masked[field].slice(-4);
      }
    });

    return masked;
  }

  /**
   * Return the incoming webhook URL for the given provider type (for pasting in provider dashboard).
   * Only SHIPROCKET has a backend webhook endpoint; others return null.
   */
  static getIncomingWebhookUrlForType(providerType, baseUrl) {
    if (!baseUrl || typeof baseUrl !== 'string') return null;
    const base = baseUrl.replace(/\/+$/, '');
    if (providerType === 'SHIPROCKET') {
      return `${base}/api/v1/webhooks/logistics/shiprocket`;
    }
    return null;
  }

  // Create logistics provider
  static async createLogisticsProvider(data) {
    const {
      name,
      type,
      config,
      webhookUrl,
      webhookSecret,
      supportedRegions,
      supportedServices,
      isActive,
      priority,
    } = data;

    // Validate required fields
    if (!name || !type) {
      throw new Error('Name and type are required');
    }

    // Check if provider type already exists
    const existing = await prisma.logisticsProvider.findUnique({
      where: { type },
    });

    if (existing) {
      throw new Error(`Logistics provider with type ${type} already exists`);
    }

    // Validate configuration
    this.validateConfig(type, config);

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.logisticsProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create provider
    const provider = await prisma.logisticsProvider.create({
      data: {
        name,
        type,
        config: config || {},
        webhookUrl: webhookUrl || null,
        webhookSecret: webhookSecret || null,
        supportedRegions: supportedRegions || [],
        supportedServices: supportedServices || [],
        isActive: isActive !== undefined ? isActive : false,
        isDefault: data.isDefault || false,
        priority: priority || 0,
      },
    });

    logger.info(`Logistics provider created: ${provider.id} (${type})`);

    return provider;
  }

  // Get all logistics providers with filters
  static async getLogisticsProviders(filters = {}, baseUrl = null) {
    const { isActive, type, page = 1, limit = 20 } = filters;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    const [providers, total] = await Promise.all([
      prisma.logisticsProvider.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isDefault: 'desc' }, { priority: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.logisticsProvider.count({ where }),
    ]);

    // Mask sensitive fields and add incoming webhook URL when supported
    const maskedProviders = providers.map(provider => ({
      ...provider,
      config: this.maskSensitiveFields(provider.config),
      incomingWebhookUrl: this.getIncomingWebhookUrlForType(provider.type, baseUrl),
    }));

    return {
      providers: maskedProviders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single logistics provider
  static async getLogisticsProvider(id, baseUrl = null) {
    const provider = await prisma.logisticsProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new Error('Logistics provider not found');
    }

    // Mask sensitive fields and add incoming webhook URL when supported
    return {
      ...provider,
      config: this.maskSensitiveFields(provider.config),
      incomingWebhookUrl: this.getIncomingWebhookUrlForType(provider.type, baseUrl),
    };
  }

  // Update logistics provider
  static async updateLogisticsProvider(id, data) {
    const provider = await prisma.logisticsProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new Error('Logistics provider not found');
    }

    // Validate config if provided
    if (data.config) {
      this.validateConfig(provider.type, data.config);
    }

    // If setting as default, unset other defaults
    if (data.isDefault === true) {
      await prisma.logisticsProvider.updateMany({
        where: {
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Update provider
    const updated = await prisma.logisticsProvider.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.config && { config: data.config }),
        ...(data.webhookUrl !== undefined && { webhookUrl: data.webhookUrl }),
        ...(data.webhookSecret !== undefined && { webhookSecret: data.webhookSecret }),
        ...(data.supportedRegions !== undefined && { supportedRegions: data.supportedRegions }),
        ...(data.supportedServices !== undefined && { supportedServices: data.supportedServices }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
    });

    logger.info(`Logistics provider updated: ${id}`);

    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Toggle logistics provider active status
  static async toggleLogisticsProvider(id) {
    const provider = await prisma.logisticsProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new Error('Logistics provider not found');
    }

    const updated = await prisma.logisticsProvider.update({
      where: { id },
      data: { isActive: !provider.isActive },
    });

    logger.info(`Logistics provider ${id} toggled to ${updated.isActive ? 'active' : 'inactive'}`);

    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Set default logistics provider
  static async setDefaultLogisticsProvider(id) {
    const provider = await prisma.logisticsProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new Error('Logistics provider not found');
    }

    if (!provider.isActive) {
      throw new Error('Cannot set inactive provider as default');
    }

    // Unset other defaults
    await prisma.logisticsProvider.updateMany({
      where: {
        isDefault: true,
        id: { not: id },
      },
      data: { isDefault: false },
    });

    // Set as default
    const updated = await prisma.logisticsProvider.update({
      where: { id },
      data: { isDefault: true },
    });

    logger.info(`Logistics provider ${id} set as default`);

    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Delete logistics provider
  static async deleteLogisticsProvider(id) {
    const provider = await prisma.logisticsProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new Error('Logistics provider not found');
    }

    // Check if provider has active shipments
    const activeShipments = await prisma.logisticsShipment.count({
      where: {
        providerId: id,
        status: { notIn: ['delivered', 'cancelled', 'failed'] },
      },
    });

    if (activeShipments > 0) {
      throw new Error(
        `Cannot delete provider with ${activeShipments} active shipments. Please cancel or complete shipments first.`
      );
    }

    await prisma.logisticsProvider.delete({
      where: { id },
    });

    logger.info(`Logistics provider deleted: ${id}`);

    return { message: 'Logistics provider deleted successfully' };
  }
}

module.exports = AdminLogisticsProviderService;
