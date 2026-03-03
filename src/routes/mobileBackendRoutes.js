const express = require('express');
const router = express.Router();
const mobileBackendController = require('../controllers/mobileBackendController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Mobile
 *   description: Mobile app backend endpoints
 */

// Public endpoints
/**
 * @swagger
 * /api/v1/mobile/version:
 *   get:
 *     summary: Get app version information
 *     description: Check app version and update requirements
 *     tags: [Mobile]
 *     responses:
 *       200:
 *         description: Version information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 minVersion:
 *                   type: string
 *                   example: 1.0.0
 *                 updateRequired:
 *                   type: boolean
 *                 updateUrl:
 *                   type: string
 *                   format: uri
 */
router.get('/version', mobileBackendController.checkAppVersion);

// Authenticated endpoints
router.use(auth);

/**
 * @swagger
 * /api/v1/mobile/device/register:
 *   post:
 *     summary: Register device for push notifications
 *     description: Register a mobile device to receive push notifications
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceToken
 *               - platform
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 description: FCM or APNS device token
 *               platform:
 *                 type: string
 *                 enum: [ios, android]
 *                 description: Device platform
 *               deviceId:
 *                 type: string
 *                 description: Unique device identifier
 *     responses:
 *       200:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device registered for push notifications
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/device/register', mobileBackendController.registerDevice);

/**
 * @swagger
 * /api/v1/mobile/deep-link:
 *   post:
 *     summary: Create deep link
 *     description: Create a deep link for mobile app navigation
 *     tags: [Mobile]
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
 *               - targetId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [product, order, category]
 *               targetId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deep link created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/deep-link', mobileBackendController.createDeepLink);

/**
 * @swagger
 * /api/v1/mobile/payment:
 *   post:
 *     summary: Process mobile payment
 *     description: Process payment through mobile payment methods
 *     tags: [Mobile]
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
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [apple_pay, google_pay, wallet]
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/payment', mobileBackendController.processMobilePayment);

// Admin endpoints
router.use(admin);

/**
 * @swagger
 * /api/v1/mobile/push:
 *   post:
 *     summary: Send push notification
 *     description: Send push notification to users (Admin only)
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific user IDs (optional, sends to all if not provided)
 *     responses:
 *       200:
 *         description: Push notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/push', mobileBackendController.sendPushNotification);

module.exports = router;


