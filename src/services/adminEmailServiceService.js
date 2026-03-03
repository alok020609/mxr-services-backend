const prisma = require('../config/database');
const logger = require('../utils/logger');

class AdminEmailServiceService {
  // Configuration validation templates for each email provider
  static getConfigTemplate(serviceType) {
    const templates = {
      SMTP: {
        host: 'string',
        port: 'number',
        secure: 'boolean',
        user: 'string',
        password: 'string',
        from: 'string',
      },
      SENDGRID: {
        apiKey: 'string',
        from: 'string',
      },
      MAILGUN: {
        apiKey: 'string',
        domain: 'string',
        from: 'string',
      },
      AWS_SES: {
        accessKeyId: 'string',
        secretAccessKey: 'string',
        region: 'string',
        from: 'string',
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
      throw new Error(`Unsupported email service type: ${serviceType}`);
    }

    // Check for required fields
    for (const field of requiredFields) {
      if (template[field] === 'boolean') {
        // Boolean fields are optional
        continue;
      }
      if (!config[field]) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }

    // Validate port if present
    if (config.port && (typeof config.port !== 'number' || config.port < 1 || config.port > 65535)) {
      throw new Error('Port must be a number between 1 and 65535');
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
      'secretAccessKey',
      'authToken',
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

  // Create email service
  static async createEmailService(data) {
    const { name, type, config, isActive, isDefault } = data;

    // Validate required fields
    if (!name || !type) {
      throw new Error('Name and type are required');
    }

    // Check if service type already exists
    const existing = await prisma.emailService.findUnique({
      where: { type },
    });

    if (existing) {
      throw new Error(`Email service with type ${type} already exists`);
    }

    // Validate configuration
    this.validateConfig(type, config);

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.emailService.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create service
    const service = await prisma.emailService.create({
      data: {
        name,
        type,
        config: config || {},
        isActive: isActive !== undefined ? isActive : false,
        isDefault: isDefault !== undefined ? isDefault : false,
      },
    });

    logger.info(`Email service created: ${service.id} (${type})`);

    return service;
  }

  // Get all email services with filters
  static async getEmailServices(filters = {}) {
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
      prisma.emailService.findMany({
        where,
        skip,
        take,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.emailService.count({ where }),
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

  // Get single email service
  static async getEmailService(id) {
    const service = await prisma.emailService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('Email service not found');
    }

    // Mask sensitive fields
    return {
      ...service,
      config: this.maskSensitiveFields(service.config),
    };
  }

  // Update email service
  static async updateEmailService(id, data) {
    const service = await prisma.emailService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('Email service not found');
    }

    const { name, config, isActive, isDefault } = data;

    // Validate configuration if provided
    if (config) {
      this.validateConfig(service.type, config);
    }

    // If setting as default, unset other defaults
    if (isDefault === true) {
      await prisma.emailService.updateMany({
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

    const updated = await prisma.emailService.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Email service updated: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Toggle email service active status
  static async toggleEmailService(id, isActive) {
    const service = await prisma.emailService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('Email service not found');
    }

    const updated = await prisma.emailService.update({
      where: { id },
      data: { isActive },
    });

    logger.info(`Email service ${isActive ? 'activated' : 'deactivated'}: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Set default email service
  static async setDefaultEmailService(id) {
    const service = await prisma.emailService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('Email service not found');
    }

    if (!service.isActive) {
      throw new Error('Cannot set inactive service as default');
    }

    // Unset other defaults
    await prisma.emailService.updateMany({
      where: {
        isDefault: true,
        id: { not: id },
      },
      data: { isDefault: false },
    });

    // Set this as default
    const updated = await prisma.emailService.update({
      where: { id },
      data: { isDefault: true },
    });

    logger.info(`Email service set as default: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Delete email service
  static async deleteEmailService(id) {
    const service = await prisma.emailService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('Email service not found');
    }

    if (service.isDefault) {
      throw new Error('Cannot delete default email service');
    }

    await prisma.emailService.delete({
      where: { id },
    });

    logger.info(`Email service deleted: ${id}`);

    return { message: 'Email service deleted successfully' };
  }

  // Get active/default email service for sending emails
  static async getActiveEmailService() {
    // Try to get default service first
    let service = await prisma.emailService.findFirst({
      where: {
        isDefault: true,
        isActive: true,
      },
    });

    // If no default, get any active service
    if (!service) {
      service = await prisma.emailService.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return service;
  }
}

module.exports = { AdminEmailServiceService };
