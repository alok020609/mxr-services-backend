const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Marketing
 *   description: Marketing campaigns and promotions endpoints
 */

// Public routes
/**
 * @swagger
 * /api/v1/marketing/flash-sales:
 *   get:
 *     summary: Get active flash sales
 *     description: Retrieve list of currently active flash sales
 *     tags: [Marketing]
 *     responses:
 *       200:
 *         description: Flash sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashSales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       discount:
 *                         type: number
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       products:
 *                         type: array
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/flash-sales', marketingController.getFlashSales);

/**
 * @swagger
 * /api/v1/marketing/deals:
 *   get:
 *     summary: Get deals
 *     description: Retrieve available deals and promotions
 *     tags: [Marketing]
 *     responses:
 *       200:
 *         description: Deals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/deals', marketingController.getDeals);

/**
 * @swagger
 * /api/v1/marketing/bundles:
 *   get:
 *     summary: Get product bundles
 *     description: Retrieve product bundles and package deals
 *     tags: [Marketing]
 *     responses:
 *       200:
 *         description: Bundles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/bundles', marketingController.getBundles);

/**
 * @swagger
 * /api/v1/marketing/recommendations:
 *   get:
 *     summary: Get product recommendations
 *     description: Retrieve personalized product recommendations
 *     tags: [Marketing]
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/recommendations', marketingController.getRecommendations);

// Admin routes
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/marketing/abandoned-carts:
 *   get:
 *     summary: Get abandoned carts
 *     description: Retrieve list of abandoned shopping carts for marketing campaigns (Admin only)
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Abandoned carts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
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
router.get('/abandoned-carts', marketingController.getAbandonedCarts);

module.exports = router;


