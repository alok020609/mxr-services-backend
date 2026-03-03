const prisma = require('../config/database');
const logger = require('../utils/logger');

class AdminPaymentGatewayService {
  // Configuration validation templates for each gateway type
  static getConfigTemplate(gatewayType) {
    const templates = {
      PHONEPE: {
        merchantId: 'string',
        merchantKey: 'string',
        apiKey: 'string',
        environment: 'production|sandbox',
        saltKey: 'string',
        saltIndex: 'number',
      },
      GPAY: {
        merchantId: 'string',
        merchantKey: 'string',
        apiKey: 'string',
        environment: 'production|sandbox',
      },
      PAYTM: {
        merchantId: 'string',
        merchantKey: 'string',
        environment: 'production|sandbox',
        website: 'string',
        industryType: 'string',
        channelId: 'string',
      },
      STRIPE: {
        secretKey: 'string',
        publishableKey: 'string',
        environment: 'production|sandbox',
      },
      RAZORPAY: {
        keyId: 'string',
        keySecret: 'string',
        environment: 'production|sandbox',
      },
      PAYU: {
        key: 'string',
        salt: 'string',
        environment: 'production|sandbox',
      },
      PAYPAL: {
        clientId: 'string',
        clientSecret: 'string',
        environment: 'production|sandbox',
      },
    };

    return templates[gatewayType] || {};
  }

  // Field labels and descriptions for config schema (optional, for frontend form UX)
  static getConfigSchemaFieldMeta(gatewayType) {
    const meta = {
      PAYU: {
        key: { label: 'Merchant key', description: 'PayU merchant key from dashboard (Developer Tools → API Keys)' },
        salt: { label: 'Merchant salt', description: 'PayU salt from dashboard (Developer Tools → API Keys)' },
        environment: { label: 'Environment', description: 'Use sandbox for test, production for live' },
        successRedirectUrl: { label: 'Success redirect URL', description: 'Frontend URL to redirect after successful payment' },
        failureRedirectUrl: { label: 'Failure redirect URL', description: 'Frontend URL to redirect after failed payment' },
      },
      STRIPE: {
        secretKey: { label: 'Secret key', description: 'Stripe secret key' },
        publishableKey: { label: 'Publishable key', description: 'Stripe publishable key' },
        environment: { label: 'Environment', description: 'production or sandbox' },
      },
      RAZORPAY: {
        keyId: { label: 'Key ID', description: 'Razorpay key ID' },
        keySecret: { label: 'Key secret', description: 'Razorpay key secret' },
        environment: { label: 'Environment', description: 'production or sandbox' },
      },
      PHONEPE: {
        merchantId: { label: 'Merchant ID', description: 'PhonePe merchant ID' },
        merchantKey: { label: 'Merchant key', description: 'PhonePe merchant key' },
        apiKey: { label: 'API key', description: 'PhonePe API key' },
        environment: { label: 'Environment', description: 'production or sandbox' },
        saltKey: { label: 'Salt key', description: 'PhonePe salt key' },
        saltIndex: { label: 'Salt index', description: 'PhonePe salt index (number)' },
      },
      GPAY: {
        merchantId: { label: 'Merchant ID', description: 'GPay merchant ID' },
        merchantKey: { label: 'Merchant key', description: 'GPay merchant key' },
        apiKey: { label: 'API key', description: 'GPay API key' },
        environment: { label: 'Environment', description: 'production or sandbox' },
      },
      PAYTM: {
        merchantId: { label: 'Merchant ID', description: 'Paytm merchant ID' },
        merchantKey: { label: 'Merchant key', description: 'Paytm merchant key' },
        environment: { label: 'Environment', description: 'production or sandbox' },
        website: { label: 'Website', description: 'Paytm website name' },
        industryType: { label: 'Industry type', description: 'Paytm industry type' },
        channelId: { label: 'Channel ID', description: 'Paytm channel ID' },
      },
      PAYPAL: {
        clientId: { label: 'Client ID', description: 'PayPal client ID' },
        clientSecret: { label: 'Client secret', description: 'PayPal client secret' },
        environment: { label: 'Environment', description: 'production or sandbox' },
      },
    };
    return meta[gatewayType] || {};
  }

  /**
   * Config schema for a gateway type: field names, types, required/optional, labels, descriptions.
   * Frontend can use this to render gateway-specific config forms without hardcoding.
   */
  static getConfigSchema(gatewayType) {
    const template = this.getConfigTemplate(gatewayType);
    const fieldMeta = this.getConfigSchemaFieldMeta(gatewayType);
    const fields = [];

    for (const [name, value] of Object.entries(template)) {
      const isEnum = typeof value === 'string' && value.includes('|');
      const required = !isEnum;
      const type = value === 'number' ? 'number' : isEnum ? 'enum' : 'string';
      const field = {
        name,
        type,
        required,
        ...(fieldMeta[name] || {}),
      };
      if (isEnum) {
        field.enum = value.split('|').map((s) => s.trim());
      }
      fields.push(field);
    }

    // PayU: append optional fields not in template
    if (gatewayType === 'PAYU') {
      if (!template.successRedirectUrl) {
        fields.push({
          name: 'successRedirectUrl',
          type: 'string',
          required: false,
          ...(fieldMeta.successRedirectUrl || {}),
        });
      }
      if (!template.failureRedirectUrl) {
        fields.push({
          name: 'failureRedirectUrl',
          type: 'string',
          required: false,
          ...(fieldMeta.failureRedirectUrl || {}),
        });
      }
    }

    return { type: gatewayType, fields };
  }

  // Validate configuration based on gateway type
  static validateConfig(gatewayType, config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration must be an object');
    }

    const template = this.getConfigTemplate(gatewayType);
    const requiredFields = Object.keys(template);

    if (requiredFields.length === 0) {
      // No template means gateway type not supported or custom config
      return true;
    }

    // Check for required fields
    for (const field of requiredFields) {
      if (template[field].includes('|')) {
        // Field with options (like environment)
        continue;
      }
      if (!config[field]) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }

    // Validate environment if present
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
      'merchantKey',
      'apiKey',
      'secretKey',
      'keySecret',
      'clientSecret',
      'saltKey',
      'salt',
      'key',
      'webhookSecret',
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

  // Create payment gateway
  static async createPaymentGateway(data) {
    const { name, type, config, webhookSecret, supportedCurrencies, supportedMethods, isActive } = data;

    // Validate required fields
    if (!name || !type) {
      throw new Error('Name and type are required');
    }

    // Check if gateway type already exists
    const existing = await prisma.paymentGateway.findUnique({
      where: { type },
    });

    if (existing) {
      throw new Error(`Payment gateway with type ${type} already exists`);
    }

    // Validate configuration
    this.validateConfig(type, config);

    // Create gateway
    const gateway = await prisma.paymentGateway.create({
      data: {
        name,
        type,
        config: config || {},
        webhookSecret: webhookSecret || null,
        supportedCurrencies: supportedCurrencies || [],
        supportedMethods: supportedMethods || [],
        isActive: isActive !== undefined ? isActive : false,
      },
    });

    logger.info(`Payment gateway created: ${gateway.id} (${type})`);

    return gateway;
  }

  // Get all payment gateways with filters
  static async getPaymentGateways(filters = {}) {
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

    const [gateways, total] = await Promise.all([
      prisma.paymentGateway.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.paymentGateway.count({ where }),
    ]);

    // Mask sensitive fields in config
    const maskedGateways = gateways.map((gateway) => ({
      ...gateway,
      config: this.maskSensitiveFields(gateway.config),
    }));

    return {
      gateways: maskedGateways,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Get single payment gateway
  static async getPaymentGateway(id) {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new Error('Payment gateway not found');
    }

    // Mask sensitive fields
    return {
      ...gateway,
      config: this.maskSensitiveFields(gateway.config),
    };
  }

  // Update payment gateway
  static async updatePaymentGateway(id, data) {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new Error('Payment gateway not found');
    }

    const { name, config, webhookSecret, supportedCurrencies, supportedMethods, isActive } = data;

    // Validate configuration if provided
    if (config) {
      this.validateConfig(gateway.type, config);
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (config !== undefined) updateData.config = config;
    if (webhookSecret !== undefined) updateData.webhookSecret = webhookSecret;
    if (supportedCurrencies !== undefined) updateData.supportedCurrencies = supportedCurrencies;
    if (supportedMethods !== undefined) updateData.supportedMethods = supportedMethods;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.paymentGateway.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Payment gateway updated: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Toggle payment gateway active status
  static async togglePaymentGateway(id, isActive) {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new Error('Payment gateway not found');
    }

    const updated = await prisma.paymentGateway.update({
      where: { id },
      data: { isActive },
    });

    logger.info(`Payment gateway ${isActive ? 'activated' : 'deactivated'}: ${id}`);

    // Mask sensitive fields
    return {
      ...updated,
      config: this.maskSensitiveFields(updated.config),
    };
  }

  // Delete payment gateway
  static async deletePaymentGateway(id) {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new Error('Payment gateway not found');
    }

    // Check if gateway is being used in any payments
    const paymentCount = await prisma.payment.count({
      where: { gateway: gateway.type },
      take: 1,
    });

    if (paymentCount > 0) {
      throw new Error('Cannot delete payment gateway that is being used in payments');
    }

    await prisma.paymentGateway.delete({
      where: { id },
    });

    logger.info(`Payment gateway deleted: ${id}`);

    return { message: 'Payment gateway deleted successfully' };
  }
}

module.exports = { AdminPaymentGatewayService };
