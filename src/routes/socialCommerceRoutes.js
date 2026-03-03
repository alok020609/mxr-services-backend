const express = require('express');
const router = express.Router();
const socialCommerceController = require('../controllers/socialCommerceController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Social Commerce
 *   description: Social commerce features including social login, sharing, and user-generated content
 */

// Public routes
/**
 * @swagger
 * /api/v1/social/ugc:
 *   get:
 *     summary: Get user-generated content
 *     description: Retrieve user-generated content (reviews, photos, videos) for products
 *     tags: [Social Commerce]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [review, photo, video]
 *         description: Filter by content type
 *     responses:
 *       200:
 *         description: User-generated content retrieved successfully
 */
router.get('/ugc', socialCommerceController.getUserGeneratedContent);

// Authenticated routes
router.use(auth);

/**
 * @swagger
 * /api/v1/social/login:
 *   post:
 *     summary: Social login
 *     description: Authenticate using social media providers (Facebook, Google, Apple)
 *     tags: [Social Commerce]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - token
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [google, facebook, apple]
 *                 description: Social provider
 *               token:
 *                 type: string
 *                 description: Social provider authentication token
 *     responses:
 *       200:
 *         description: Social login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/login', socialCommerceController.socialLogin);

/**
 * @swagger
 * /api/v1/social/products/{productId}/share:
 *   post:
 *     summary: Share product on social media
 *     description: Share a product on social media platforms
 *     tags: [Social Commerce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to share
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [facebook, twitter, instagram, whatsapp]
 *                 description: Social platform
 *               message:
 *                 type: string
 *                 description: Custom message
 *     responses:
 *       200:
 *         description: Product shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product shared successfully
 *                 shareUrl:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/products/:productId/share', socialCommerceController.shareProduct);

/**
 * @swagger
 * /api/v1/social/ugc:
 *   post:
 *     summary: Submit user-generated content
 *     description: Submit user-generated content (photos, videos) for products
 *     tags: [Social Commerce]
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
 *               - type
 *             properties:
 *               productId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [photo, video]
 *               content:
 *                 type: string
 *                 description: Content URL or base64
 *               caption:
 *                 type: string
 *     responses:
 *       201:
 *         description: Content submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/ugc', socialCommerceController.submitUserGeneratedContent);

// Admin routes
router.use(admin);

/**
 * @swagger
 * /api/v1/social/influencers:
 *   get:
 *     summary: Get influencer tracking
 *     description: Retrieve influencer tracking and analytics (Admin only)
 *     tags: [Social Commerce]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Influencer data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/influencers', socialCommerceController.getInfluencerTracking);

module.exports = router;


