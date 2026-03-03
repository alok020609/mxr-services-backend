const prisma = require('../../config/database');
const StripeGateway = require('./StripeGateway');
const RazorpayGateway = require('./RazorpayGateway');
const PayUGateway = require('./PayUGateway');

const COMING_SOON_TYPES = ['STRIPE', 'RAZORPAY', 'PAYPAL', 'UPI', 'PHONEPE', 'GPAY', 'PAYTM', 'CRYPTO', 'BANK_TRANSFER', 'COD'];

class PaymentGatewayFactory {
  static async createGateway(gatewayType) {
    const gatewayConfig = await prisma.paymentGateway.findUnique({
      where: { type: gatewayType },
    });

    if (!gatewayConfig || !gatewayConfig.isActive) {
      throw new Error(`Payment gateway ${gatewayType} is not available`);
    }

    if (gatewayType === 'PAYU') {
      const config = gatewayConfig.config;
      return new PayUGateway({
        key: config.key,
        salt: config.salt,
        environment: config.environment || 'test',
        successRedirectUrl: config.successRedirectUrl || null,
        failureRedirectUrl: config.failureRedirectUrl || null,
      });
    }

    if (COMING_SOON_TYPES.includes(gatewayType)) {
      throw new Error(`Payment gateway ${gatewayType} is coming soon`);
    }

    const config = gatewayConfig.config;
    switch (gatewayType) {
      case 'STRIPE':
        return new StripeGateway({
          secretKey: config.secretKey,
          webhookSecret: gatewayConfig.webhookSecret,
        });
      case 'RAZORPAY':
        return new RazorpayGateway({
          keyId: config.keyId,
          keySecret: config.keySecret,
          webhookSecret: gatewayConfig.webhookSecret,
        });
      default:
        throw new Error(`Unsupported payment gateway: ${gatewayType}`);
    }
  }

  static async getAvailableGateways() {
    const gateways = await prisma.paymentGateway.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        supportedCurrencies: true,
        supportedMethods: true,
      },
    });

    return gateways.map((g) => ({
      ...g,
      integrationStatus: g.type === 'PAYU' ? 'available' : 'coming_soon',
    }));
  }
}

module.exports = PaymentGatewayFactory;


