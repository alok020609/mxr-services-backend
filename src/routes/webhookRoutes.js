const express = require('express');
const router = express.Router();
const PaymentGatewayFactory = require('../services/payments/PaymentGatewayFactory');
const LogisticsService = require('../services/logisticsService');
const prisma = require('../config/database');
const logger = require('../utils/logger');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook endpoints for payment gateways and external services
 */

// Stripe webhook
/**
 * @swagger
 * /api/v1/webhooks/payments/stripe:
 *   post:
 *     summary: Stripe payment webhook
 *     description: Webhook endpoint for Stripe payment events. Called by Stripe, not by your application.
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe webhook event payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 */
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
/**
 * @swagger
 * /api/v1/webhooks/payments/razorpay:
 *   post:
 *     summary: Razorpay payment webhook
 *     description: Webhook endpoint for Razorpay payment events. Called by Razorpay, not by your application.
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Razorpay webhook event payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 */
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

// Shiprocket tracking webhook
/**
 * @swagger
 * /api/v1/webhooks/logistics/shiprocket:
 *   post:
 *     summary: Shiprocket tracking webhook
 *     description: Webhook endpoint for Shiprocket tracking events. Called by Shiprocket when tracking status changes. Optional header anx-api-key for verification. Always returns 200.
 *     tags: [Webhooks]
 *     parameters:
 *       - in: header
 *         name: anx-api-key
 *         schema: { type: string }
 *         description: Optional security token (must match provider webhookSecret when set)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               awb: { type: string }
 *               order_id: { type: string }
 *               sr_order_id: { type: number }
 *               current_status: { type: string }
 *               shipment_status: { type: string }
 *               scans: { type: array }
 *     responses:
 *       200:
 *         description: Webhook received (always)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: { type: boolean, example: true }
 */
router.post('/logistics/shiprocket', asyncHandler(async (req, res) => {
  try {
    await LogisticsService.processShiprocketTrackingWebhook(req.body, req.headers['anx-api-key']);
  } catch (err) {
    logger.error('Shiprocket webhook error', err);
  }
  res.status(200).json({ received: true });
}));

module.exports = router;


