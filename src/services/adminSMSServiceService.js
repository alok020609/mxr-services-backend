const prisma = require('../config/database');
const logger = require('../utils/logger');

class AdminSMSServiceService {
  // Configuration validation templates for each SMS provider
  static getConfigTemplate(serviceType) {
    const templates = {
      TWILIO: {
        accountSid: 'string',
        authToken: 'string',
        phoneNumber: 'string',
      },
      AWS_SNS: {
        accessKeyId: 'string',
        secretAccessKey: 'string',
        region: 'string',
      },
      MESSAGEBIRD: {
        apiKey: 'string',
        originator: 'string',
      },
    };

    return templates[serviceType] || {};
  }

  // Validate configuration based on service type
  static validateConfig(serviceType, config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration must be an object');
    }

    const template = this.getConfigTemplate(serviceType);
    const requiredFields = Object.keys(template);

    if (requiredFields.length === 0) {
      throw new Error(`Unsupported SMS service type: ${serviceType}`);
    }

    // Check for required fields
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }

    return true;
  }

  // Mask sensitive fields in configuration
  static maskSensitiveFields(config) {
    if (!config || typeof config !== 'object') {
      return config;
    }

    const sensitiveFields = [
      'authToken',
      'apiKey',
      'secretAccessKey',
    ];

    const masked = { ...config };
    for (const field of sensitiveFields) {
      if (masked[field]) {
        const value = masked[field];
        if (typeof value === 'string' && value.length > 8) {
          masked[field] = `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
        } else {
          masked[field] = '****';
        }
      }
    }

    return masked;
  }

  // Create SMS service
  static async createSMSService(data) {
    const { name, type, config, isActive, isDefault } = data;

    // Validate required fields
    if (!name || !type) {
      throw new Error('Name and type are required');
    }

    // Check if service type already exists
    const existing = await prisma.sMSService.findUnique({
      where: { type },
    });

    if (existing) {
      throw new Error(`SMS service with type ${type} already exists`);
    }

    // Validate configuration
    this.validateConfig(type, config);

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.sMSService.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create service
    const service = await prisma.sMSService.create({
      data: {
        name,
        type,
        config: config || {},
        isActive: isActive !== undefined ? isActive : false,
        isDefault: isDefault !== undefined ? isDefault : false,
      },
    });

    logger.info(`SMS service created: ${service.id} (${type})`);

    return service;
  }

  // Get all SMS services with filters
  static async getSMSServices(filters = {}) {
    const { isActive, type, page = 1, limit = 20 } = filters;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }
    if (type) {
      where.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [services, total] = await Promise.all([
      prisma.sMSService.findMany({
        where,
        skip,
        take,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.sMSService.count({ where }),
    ]);

    // Mask sensitive fields in config
    const maskedServices = services.map((service) => ({
      ...service,
      config: this.maskSensitiveFields(service.config),
    }));

    return {
      services: maskedServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Get single SMS service
  static async getSMSService(id) {
    const service = await prisma.sMSService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('SMS service not found');
    }

    // Mask sensitive fields
    return {
      ...service,
      config: this.maskSensitiveFields(service.config),
    };
  }

  // Update SMS service
  static async updateSMSService(id, data) {
    const service = await prisma.sMSService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('SMS service not found');
    }

    const { name, config, isActive, isDefault } = data;

    // Validate configuration if provided
    if (config) {
      this.validateConfig(service.type, config);
    }

    // If setting as default, unset other defaults
    if (isDefault === true) {
      await prisma.sMSService.updateMany({
        where: {
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (config !== undefined) updateData.config = config;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updated = await prisma.sMSService.update({
      where: { id },
      data: updateData,
    });

    logger.info(`SMS service updated: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Toggle SMS service active status
  static async toggleSMSService(id, isActive) {
    const service = await prisma.sMSService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('SMS service not found');
    }

    const updated = await prisma.sMSService.update({
      where: { id },
      data: { isActive },
    });

    logger.info(`SMS service ${isActive ? 'activated' : 'deactivated'}: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Set default SMS service
  static async setDefaultSMSService(id) {
    const service = await prisma.sMSService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('SMS service not found');
    }

    if (!service.isActive) {
      throw new Error('Cannot set inactive service as default');
    }

    // Unset other defaults
    await prisma.sMSService.updateMany({
      where: {
        isDefault: true,
        id: { not: id },
      },
      data: { isDefault: false },
    });

    // Set this as default
    const updated = await prisma.sMSService.update({
      where: { id },
      data: { isDefault: true },
    });

    logger.info(`SMS service set as default: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Delete SMS service
  static async deleteSMSService(id) {
    const service = await prisma.sMSService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('SMS service not found');
    }

    if (service.isDefault) {
      throw new Error('Cannot delete default SMS service');
    }

    await prisma.sMSService.delete({
      where: { id },
    });

    logger.info(`SMS service deleted: ${id}`);

    return { message: 'SMS service deleted successfully' };
  }

  // Get active/default SMS service for sending SMS
  static async getActiveSMSService() {
    // Try to get default service first
    let service = await prisma.sMSService.findFirst({
      where: {
        isDefault: true,
        isActive: true,
      },
    });

    // If no default, get any active service
    if (!service) {
      service = await prisma.sMSService.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return service;
  }
}

module.exports = { AdminSMSServiceService };
