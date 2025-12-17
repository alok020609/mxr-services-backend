const Stripe = require('stripe');
const IPaymentGateway = require('./IPaymentGateway');

class StripeGateway extends IPaymentGateway {
  constructor(config) {
    super();
    this.stripe = new Stripe(config.secretKey);
    this.webhookSecret = config.webhookSecret;
  }

  async createPayment(paymentData) {
    const { amount, currency, orderId, metadata } = paymentData;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        ...metadata,
      },
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    };
  }

  async confirmPayment(paymentId, verificationData) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        status: 'SUCCEEDED',
        transactionId: paymentIntent.id,
        gatewayResponse: paymentIntent,
      };
    }

    return {
      success: false,
      status: paymentIntent.status.toUpperCase(),
      transactionId: paymentIntent.id,
      gatewayResponse: paymentIntent,
    };
  }

  async refundPayment(paymentId, amount, reason) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount: Math.round(amount * 100),
      reason: reason || 'requested_by_customer',
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      gatewayResponse: refund,
    };
  }

  async getPaymentStatus(paymentId) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

    return {
      status: paymentIntent.status.toUpperCase(),
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      gatewayResponse: paymentIntent,
    };
  }

  async handleWebhook(webhookData, signature) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        webhookData,
        signature,
        this.webhookSecret
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    return {
      eventId: event.id,
      type: event.type,
      data: event.data.object,
    };
  }
}

module.exports = StripeGateway;


