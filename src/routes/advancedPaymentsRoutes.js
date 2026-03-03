const express = require('express');
const router = express.Router();
const advancedPaymentsController = require('../controllers/advancedPaymentsController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Advanced Payments
 *   description: Advanced payment features including payment links, saved methods, and split payments
 */

router.use(auth);

// Payment links
/**
 * @swagger
 * /api/v1/payments/advanced/links:
 *   post:
 *     summary: Create payment link
 *     description: Create a shareable payment link for invoices or orders
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *               description:
 *                 type: string
 *               orderId:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Payment link created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/links', advancedPaymentsController.createPaymentLink);

// Saved payment methods
/**
 * @swagger
 * /api/v1/payments/advanced/methods:
 *   post:
 *     summary: Save payment method
 *     description: Save a payment method for future use
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - token
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [card, bank_account]
 *               token:
 *                 type: string
 *               nickname:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment method saved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/methods', advancedPaymentsController.savePaymentMethod);

/**
 * @swagger
 * /api/v1/payments/advanced/methods:
 *   get:
 *     summary: Get saved payment methods
 *     description: Retrieve user's saved payment methods
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/methods', advancedPaymentsController.getSavedPaymentMethods);

// Payment routing
/**
 * @swagger
 * /api/v1/payments/advanced/route:
 *   post:
 *     summary: Route payment
 *     description: Route payment to different processors based on rules
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               preferredGateway:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment routed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/route', advancedPaymentsController.routePayment);

// Payment retry
/**
 * @swagger
 * /api/v1/payments/advanced/{paymentId}/retry:
 *   post:
 *     summary: Retry payment
 *     description: Retry a failed payment
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 description: Alternative payment method (optional)
 *     responses:
 *       200:
 *         description: Payment retry initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.post('/:paymentId/retry', advancedPaymentsController.retryPayment);

// Split payments
/**
 * @swagger
 * /api/v1/payments/advanced/split:
 *   post:
 *     summary: Split payment
 *     description: Split a payment across multiple recipients or methods
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - splits
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - recipientId
 *                     - amount
 *                   properties:
 *                     recipientId:
 *                       type: string
 *                     amount:
 *                       type: number
 *     responses:
 *       200:
 *         description: Payment split successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/split', advancedPaymentsController.splitPayment);

// Admin endpoints
router.use(admin);

/**
 * @swagger
 * /api/v1/payments/advanced/reconcile:
 *   get:
 *     summary: Reconcile payments
 *     description: Reconcile payments with bank statements (Admin only)
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reconciliation completed successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/reconcile', advancedPaymentsController.reconcilePayments);

/**
 * @swagger
 * /api/v1/payments/advanced/{paymentId}/chargeback:
 *   post:
 *     summary: Record chargeback
 *     description: Record a chargeback for a payment (Admin only)
 *     tags: [Advanced Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *               reason:
 *                 type: string
 *               disputeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chargeback recorded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.post('/:paymentId/chargeback', advancedPaymentsController.recordChargeback);

module.exports = router;


