const express = require('express');
const router = express.Router();
const advancedAnalyticsController = require('../controllers/advancedAnalyticsController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Advanced Analytics
 *   description: Advanced analytics features including predictions, real-time dashboards, and attribution
 */

// Public UTM tracking
/**
 * @swagger
 * /api/v1/analytics/advanced/orders/{orderId}/utm:
 *   post:
 *     summary: Track UTM parameters
 *     description: Track UTM parameters for order attribution
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               utm_source:
 *                 type: string
 *               utm_medium:
 *                 type: string
 *               utm_campaign:
 *                 type: string
 *               utm_term:
 *                 type: string
 *               utm_content:
 *                 type: string
 *     responses:
 *       200:
 *         description: UTM parameters tracked successfully
 *       400:
 *         description: Bad request
 */
router.post('/orders/:orderId/utm', advancedAnalyticsController.trackUTM);

// Authenticated user analytics
router.use(auth);

/**
 * @swagger
 * /api/v1/analytics/advanced/users/{userId}/churn:
 *   get:
 *     summary: Predict user churn
 *     description: Predict likelihood of user churn (requires authentication)
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Churn prediction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/users/:userId/churn', advancedAnalyticsController.predictChurn);

/**
 * @swagger
 * /api/v1/analytics/advanced/users/{userId}/affinity/{productId}:
 *   get:
 *     summary: Predict product affinity
 *     description: Predict user's affinity for a specific product
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product affinity prediction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or product not found
 */
router.get('/users/:userId/affinity/:productId', advancedAnalyticsController.predictProductAffinity);

/**
 * @swagger
 * /api/v1/analytics/advanced/users/{userId}/next-product:
 *   get:
 *     summary: Get next best product
 *     description: Get recommended next product for a user
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Next best product recommendation retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/users/:userId/next-product', advancedAnalyticsController.getNextBestProduct);

/**
 * @swagger
 * /api/v1/analytics/advanced/users/{userId}/attribution:
 *   get:
 *     summary: Get multi-touch attribution
 *     description: Get multi-touch attribution analysis for a user
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Attribution data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/users/:userId/attribution', advancedAnalyticsController.getMultiTouchAttribution);

// Admin analytics
router.use(admin);

/**
 * @swagger
 * /api/v1/analytics/advanced/dashboard/realtime:
 *   get:
 *     summary: Get real-time dashboard
 *     description: Retrieve real-time analytics dashboard data (Admin only)
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Real-time dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard/realtime', advancedAnalyticsController.getRealTimeDashboard);

/**
 * @swagger
 * /api/v1/analytics/advanced/orders/live:
 *   get:
 *     summary: Get live orders
 *     description: Retrieve live/real-time order data (Admin only)
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Live orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/orders/live', advancedAnalyticsController.getLiveOrders);

/**
 * @swagger
 * /api/v1/analytics/advanced/funnel:
 *   get:
 *     summary: Get conversion funnel
 *     description: Retrieve conversion funnel analysis (Admin only)
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Conversion funnel retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/funnel', advancedAnalyticsController.getConversionFunnel);

module.exports = router;


