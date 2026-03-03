const express = require('express');
const router = express.Router();
const apiGatewayController = require('../controllers/apiGatewayController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: API Gateway
 *   description: API gateway features including rate limiting tiers and version management
 */

// Authenticated endpoints
router.use(auth);

/**
 * @swagger
 * /api/v1/gateway/tier:
 *   get:
 *     summary: Get user API tier
 *     description: Retrieve the user's current API rate limiting tier
 *     tags: [API Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tier information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/tier', apiGatewayController.getUserTier);

/**
 * @swagger
 * /api/v1/gateway/tier:
 *   put:
 *     summary: Set user API tier
 *     description: Update the user's API rate limiting tier
 *     tags: [API Gateway]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tier
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [FREE, BASIC, PREMIUM, ENTERPRISE]
 *     responses:
 *       200:
 *         description: Tier updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/tier', apiGatewayController.setUserTier);

/**
 * @swagger
 * /api/v1/gateway/usage:
 *   get:
 *     summary: Get API usage
 *     description: Retrieve API usage statistics for the user
 *     tags: [API Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API usage retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/usage', apiGatewayController.getAPIUsage);

/**
 * @swagger
 * /api/v1/gateway/versions/{version}:
 *   get:
 *     summary: Get API version info
 *     description: Retrieve information about a specific API version
 *     tags: [API Gateway]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: API version (e.g., v1, v2)
 *     responses:
 *       200:
 *         description: Version information retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Version not found
 */
router.get('/versions/:version', apiGatewayController.getAPIVersionInfo);

// Admin endpoints
router.use(admin);

/**
 * @swagger
 * /api/v1/gateway/versions/deprecate:
 *   post:
 *     summary: Deprecate API version
 *     description: Mark an API version as deprecated (Admin only)
 *     tags: [API Gateway]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - version
 *               - deprecationDate
 *               - sunsetDate
 *             properties:
 *               version:
 *                 type: string
 *               deprecationDate:
 *                 type: string
 *                 format: date-time
 *               sunsetDate:
 *                 type: string
 *                 format: date-time
 *               migrationGuide:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: API version deprecated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/versions/deprecate', apiGatewayController.deprecateAPIVersion);

module.exports = router;


