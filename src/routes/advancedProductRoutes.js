const express = require('express');
const router = express.Router();
const advancedProductController = require('../controllers/advancedProductController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Advanced Products
 *   description: Advanced product features including digital products, subscriptions, pre-orders, and gift cards
 */

// Digital Products
/**
 * @swagger
 * /api/v1/advanced-products/digital/{productId}:
 *   get:
 *     summary: Get digital product
 *     description: Retrieve information about a digital product
 *     tags: [Advanced Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Digital product ID
 *     responses:
 *       200:
 *         description: Digital product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/digital/:productId', advancedProductController.getDigitalProduct);

/**
 * @swagger
 * /api/v1/advanced-products/digital/{productId}/download/{orderId}:
 *   get:
 *     summary: Download digital product
 *     description: Download a purchased digital product (requires authentication)
 *     tags: [Advanced Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Digital product ID
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Download initiated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (order not owned by user)
 *       404:
 *         description: Product or order not found
 */
router.get('/digital/:productId/download/:orderId', auth, advancedProductController.downloadDigitalProduct);

// Subscriptions
router.use(auth);

/**
 * @swagger
 * /api/v1/advanced-products/subscriptions:
 *   get:
 *     summary: Get subscriptions
 *     description: Retrieve user's product subscriptions
 *     tags: [Advanced Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/subscriptions', advancedProductController.getSubscriptions);

/**
 * @swagger
 * /api/v1/advanced-products/subscriptions:
 *   post:
 *     summary: Create subscription
 *     description: Create a new product subscription
 *     tags: [Advanced Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - planId
 *             properties:
 *               productId:
 *                 type: string
 *               planId:
 *                 type: string
 *               paymentMethodId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/subscriptions', advancedProductController.createSubscription);

// Pre-Orders
/**
 * @swagger
 * /api/v1/advanced-products/pre-orders:
 *   post:
 *     summary: Create pre-order
 *     description: Create a pre-order for a product that is not yet available
 *     tags: [Advanced Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Pre-order created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/pre-orders', advancedProductController.createPreOrder);

/**
 * @swagger
 * /api/v1/advanced-products/pre-orders:
 *   get:
 *     summary: Get pre-orders
 *     description: Retrieve user's pre-orders
 *     tags: [Advanced Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pre-orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/pre-orders', advancedProductController.getPreOrders);

// Gift Cards
/**
 * @swagger
 * /api/v1/advanced-products/gift-cards:
 *   get:
 *     summary: Get gift cards
 *     description: Retrieve available gift cards
 *     tags: [Advanced Products]
 *     responses:
 *       200:
 *         description: Gift cards retrieved successfully
 */
router.get('/gift-cards', advancedProductController.getGiftCards);

/**
 * @swagger
 * /api/v1/advanced-products/gift-cards/purchase:
 *   post:
 *     summary: Purchase gift card
 *     description: Purchase a gift card
 *     tags: [Advanced Products]
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
 *               - paymentMethodId
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *               paymentMethodId:
 *                 type: string
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gift card purchased successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/gift-cards/purchase', advancedProductController.purchaseGiftCard);

/**
 * @swagger
 * /api/v1/advanced-products/gift-cards/redeem:
 *   post:
 *     summary: Redeem gift card
 *     description: Redeem a gift card code
 *     tags: [Advanced Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Gift card code
 *     responses:
 *       200:
 *         description: Gift card redeemed successfully
 *       400:
 *         description: Bad request (invalid or expired code)
 *       401:
 *         description: Unauthorized
 */
router.post('/gift-cards/redeem', advancedProductController.redeemGiftCard);

module.exports = router;


