const StripeGateway = require('../../../src/services/payments/StripeGateway');

// Use Stripe test mode
const STRIPE_TEST_KEY = process.env.STRIPE_TEST_SECRET_KEY || 'sk_test_...';

describe('Stripe Gateway Contract Tests', () => {
  let gateway;

  beforeAll(() => {
    gateway = new StripeGateway({
      apiKey: STRIPE_TEST_KEY,
      testMode: true,
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent matching Stripe API contract', async () => {
      const result = await gateway.createPaymentIntent({
        amount: 1000, // $10.00 in cents
        currency: 'usd',
        metadata: {
          orderId: 'test-order-123',
        },
      });

      // Verify response matches Stripe API contract
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('client_secret');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('currency');
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe('usd');
      expect(result.status).toBe('requires_payment_method');
    });

    it('should handle invalid amount', async () => {
      await expect(
        gateway.createPaymentIntent({
          amount: -100,
          currency: 'usd',
        })
      ).rejects.toThrow();
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment matching Stripe API contract', async () => {
      // Create payment intent first
      const intent = await gateway.createPaymentIntent({
        amount: 1000,
        currency: 'usd',
      });

      // Confirm payment (using test card)
      const result = await gateway.confirmPayment({
        paymentIntentId: intent.id,
        paymentMethodId: 'pm_card_visa', // Stripe test card
      });

      // Verify response matches Stripe API contract
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('succeeded');
    });
  });

  describe('refundPayment', () => {
    it('should refund payment matching Stripe API contract', async () => {
      // Create and confirm payment first
      const intent = await gateway.createPaymentIntent({
        amount: 1000,
        currency: 'usd',
      });

      const payment = await gateway.confirmPayment({
        paymentIntentId: intent.id,
        paymentMethodId: 'pm_card_visa',
      });

      // Refund payment
      const refund = await gateway.refundPayment({
        paymentId: payment.id,
        amount: 1000,
      });

      // Verify response matches Stripe API contract
      expect(refund).toHaveProperty('id');
      expect(refund).toHaveProperty('status');
      expect(refund).toHaveProperty('amount');
      expect(refund.status).toBe('succeeded');
    });
  });

  describe('handleWebhook', () => {
    it('should handle webhook events matching Stripe contract', async () => {
      // Mock Stripe webhook event
      const webhookEvent = {
        id: 'evt_test_webhook',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'succeeded',
            amount: 1000,
          },
        },
      };

      const result = await gateway.handleWebhook(webhookEvent);

      expect(result).toHaveProperty('eventId');
      expect(result).toHaveProperty('eventType');
      expect(result.eventType).toBe('payment_intent.succeeded');
    });
  });
});


