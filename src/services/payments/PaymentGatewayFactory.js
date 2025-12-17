const prisma = require('../../config/database');
const StripeGateway = require('./StripeGateway');
const RazorpayGateway = require('./RazorpayGateway');

class PaymentGatewayFactory {
  static async createGateway(gatewayType) {
    const gatewayConfig = await prisma.paymentGateway.findUnique({
      where: { type: gatewayType },
    });

    if (!gatewayConfig || !gatewayConfig.isActive) {
      throw new Error(`Payment gateway ${gatewayType} is not available`);
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

      case 'PAYU':
        // TODO: Implement PayU gateway
        throw new Error('PayU gateway not yet implemented');

      case 'PAYPAL':
        // TODO: Implement PayPal gateway
        throw new Error('PayPal gateway not yet implemented');

      case 'UPI':
        // TODO: Implement UPI gateway
        throw new Error('UPI gateway not yet implemented');

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

    return gateways;
  }
}

module.exports = PaymentGatewayFactory;


