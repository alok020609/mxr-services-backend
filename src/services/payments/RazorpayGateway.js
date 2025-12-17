const Razorpay = require('razorpay');
const crypto = require('crypto');
const IPaymentGateway = require('./IPaymentGateway');

class RazorpayGateway extends IPaymentGateway {
  constructor(config) {
    super();
    this.razorpay = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });
    this.webhookSecret = config.webhookSecret;
  }

  async createPayment(paymentData) {
    const { amount, currency, orderId, metadata } = paymentData;

    const order = await this.razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: orderId,
      notes: metadata,
    });

    return {
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      status: order.status,
      gatewayResponse: order,
    };
  }

  async confirmPayment(paymentId, verificationData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verificationData;

    const generatedSignature = crypto
      .createHmac('sha256', this.razorpay.key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Signature verification failed',
      };
    }

    const payment = await this.razorpay.payments.fetch(razorpay_payment_id);

    return {
      success: payment.status === 'authorized' || payment.status === 'captured',
      status: payment.status === 'captured' ? 'SUCCEEDED' : payment.status.toUpperCase(),
      transactionId: payment.id,
      gatewayResponse: payment,
    };
  }

  async refundPayment(paymentId, amount, reason) {
    const refund = await this.razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100),
      notes: {
        reason: reason || 'requested_by_customer',
      },
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
    const payment = await this.razorpay.payments.fetch(paymentId);

    return {
      status: payment.status === 'captured' ? 'SUCCEEDED' : payment.status.toUpperCase(),
      amount: payment.amount / 100,
      currency: payment.currency,
      gatewayResponse: payment,
    };
  }

  async handleWebhook(webhookData, signature) {
    // Razorpay webhook verification
    const generatedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(webhookData))
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new Error('Webhook signature verification failed');
    }

    return {
      eventId: webhookData.event,
      type: webhookData.event,
      data: webhookData.payload,
    };
  }
}

module.exports = RazorpayGateway;


