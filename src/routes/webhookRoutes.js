const express = require('express');
const router = express.Router();
const PaymentGatewayFactory = require('../services/payments/PaymentGatewayFactory');
const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const gateway = await PaymentGatewayFactory.createGateway('STRIPE');
  const event = await gateway.handleWebhook(req.body, signature);

  // Process webhook event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data;
    const payment = await prisma.payment.findFirst({
      where: { transactionId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED' },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });
    }
  }

  res.json({ received: true });
}));

// Razorpay webhook
router.post('/razorpay', asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const gateway = await PaymentGatewayFactory.createGateway('RAZORPAY');
  const event = await gateway.handleWebhook(req.body, signature);

  // Process webhook event
  if (event.type === 'payment.captured') {
    const paymentData = event.data.payment.entity;
    const payment = await prisma.payment.findFirst({
      where: { transactionId: paymentData.order_id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          gatewayTransactionId: paymentData.id,
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });
    }
  }

  res.json({ received: true });
}));

module.exports = router;


