const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing endpoints
 */

// Public routes
/**
 * @swagger
 * /api/v1/payments/gateways:
 *   get:
 *     summary: Get available payment gateways
 *     description: Retrieve list of available payment gateways and their supported methods
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payment gateways retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gateways:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: STRIPE
 *                       name:
 *                         type: string
 *                         example: Stripe
 *                       isActive:
 *                         type: boolean
 *                       supportedCurrencies:
 *                         type: array
 *                         items:
 *                           type: string
 *                       supportedMethods:
 *                         type: array
 *                         items:
 *                           type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/gateways', paymentController.getGateways);

// PayU callback (surl/furl) – public; PayU POSTs form-urlencoded here
router.post('/payu/callback', paymentController.payuCallback);

// Protected routes
router.use(auth);

/**
 * @swagger
 * /api/v1/payments/create-intent:
 *   post:
 *     summary: Create payment intent
 *     description: Create a payment intent for processing a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *               - gateway
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID to create payment for
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 description: Payment amount
 *               currency:
 *                 type: string
 *                 default: USD
 *                 description: Currency code
 *               gateway:
 *                 type: string
 *                 enum: [STRIPE, PAYPAL, RAZORPAY]
 *                 description: Payment gateway to use
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentIntent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     clientSecret:
 *                       type: string
 *                     amount:
 *                       type: integer
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Validation error"
 *               errors:
 *                 - field: "orderId"
 *                   message: "\"orderId\" is required"
 *                 - field: "amount"
 *                   message: "\"amount\" must be a positive number"
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Payment gateway not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create-intent', paymentController.createPaymentIntent);

/**
 * @swagger
 * /api/v1/payments/confirm:
 *   post:
 *     summary: Confirm payment
 *     description: Confirm and process a payment using a payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *                 description: Payment intent ID
 *               paymentMethodId:
 *                 type: string
 *                 description: Payment method ID
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                     status:
 *                       type: string
 *                     gateway:
 *                       type: string
 *                     transactionId:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Validation error"
 *               errors:
 *                 - field: "paymentIntentId"
 *                   message: "\"paymentIntentId\" is required"
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment intent not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Payment processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Payment processing failed"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/confirm', paymentController.confirmPayment);

/**
 * @swagger
 * /api/v1/payments/{orderId}:
 *   get:
 *     summary: Get payment status for order
 *     description: Retrieve payment status for a specific order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                     status:
 *                       type: string
 *                     gateway:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Order belongs to another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:orderId', paymentController.getPaymentStatus);

/**
 * @swagger
 * /api/v1/payments/{orderId}/history:
 *   get:
 *     summary: Get payment history for order
 *     description: Retrieve payment history for a specific order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       gateway:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Order belongs to another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:orderId/history', paymentController.getPaymentHistory);

module.exports = router;


