const express = require('express');
const router = express.Router();
const customerExperienceController = require('../controllers/customerExperienceController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Customer Experience
 *   description: Customer experience enhancement features
 */

// Public routes
/**
 * @swagger
 * /api/v1/experience/products/{productId}/questions:
 *   get:
 *     summary: Get product questions
 *     description: Retrieve questions and answers for a product
 *     tags: [Customer Experience]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product questions retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:productId/questions', customerExperienceController.getProductQuestions);

/**
 * @swagger
 * /api/v1/experience/products/{productId}/size-guide:
 *   get:
 *     summary: Get size guide
 *     description: Retrieve size guide for a product
 *     tags: [Customer Experience]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Size guide retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:productId/size-guide', customerExperienceController.getSizeGuide);

/**
 * @swagger
 * /api/v1/experience/products/{productId}/videos:
 *   get:
 *     summary: Get product videos
 *     description: Retrieve videos for a product
 *     tags: [Customer Experience]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product videos retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:productId/videos', customerExperienceController.getProductVideos);

/**
 * @swagger
 * /api/v1/experience/products/{productId}/social-proof:
 *   get:
 *     summary: Get social proof
 *     description: Retrieve social proof data for a product (recent purchases, reviews count, etc.)
 *     tags: [Customer Experience]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Social proof retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:productId/social-proof', customerExperienceController.getSocialProof);

// Protected routes
router.use(auth);

/**
 * @swagger
 * /api/v1/experience/products/questions:
 *   post:
 *     summary: Ask product question
 *     description: Submit a question about a product
 *     tags: [Customer Experience]
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
 *               - question
 *             properties:
 *               productId:
 *                 type: string
 *               question:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/products/questions', customerExperienceController.askQuestion);

/**
 * @swagger
 * /api/v1/experience/recently-viewed:
 *   get:
 *     summary: Get recently viewed products
 *     description: Retrieve products recently viewed by the user
 *     tags: [Customer Experience]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed products retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/recently-viewed', customerExperienceController.getRecentlyViewed);

/**
 * @swagger
 * /api/v1/experience/waitlist:
 *   post:
 *     summary: Add to waitlist
 *     description: Add a product to waitlist for out-of-stock items
 *     tags: [Customer Experience]
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
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Added to waitlist successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/waitlist', customerExperienceController.addToWaitlist);

/**
 * @swagger
 * /api/v1/experience/waitlist:
 *   get:
 *     summary: Get waitlist
 *     description: Retrieve user's waitlist items
 *     tags: [Customer Experience]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Waitlist retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/waitlist', customerExperienceController.getWaitlist);

/**
 * @swagger
 * /api/v1/experience/product-alerts:
 *   post:
 *     summary: Create product alert
 *     description: Create an alert for product price drop or back in stock
 *     tags: [Customer Experience]
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
 *               - alertType
 *             properties:
 *               productId:
 *                 type: string
 *               alertType:
 *                 type: string
 *                 enum: [PRICE_DROP, BACK_IN_STOCK]
 *               targetPrice:
 *                 type: number
 *                 description: Target price for price drop alerts
 *     responses:
 *       201:
 *         description: Product alert created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/product-alerts', customerExperienceController.createProductAlert);

/**
 * @swagger
 * /api/v1/experience/product-alerts:
 *   get:
 *     summary: Get product alerts
 *     description: Retrieve user's product alerts
 *     tags: [Customer Experience]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product alerts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/product-alerts', customerExperienceController.getProductAlerts);

module.exports = router;


