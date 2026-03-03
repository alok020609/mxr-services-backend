const express = require('express');
const router = express.Router();
const apiDeprecationController = require('../controllers/apiDeprecationController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: API Deprecation
 *   description: API versioning and deprecation management
 */

// Public endpoints
/**
 * @swagger
 * /api/v1/deprecation/versioning-strategy:
 *   get:
 *     summary: Get versioning strategy
 *     description: Retrieve API versioning strategy information
 *     tags: [API Deprecation]
 *     responses:
 *       200:
 *         description: Versioning strategy retrieved successfully
 */
router.get('/versioning-strategy', apiDeprecationController.getVersioningStrategy);

/**
 * @swagger
 * /api/v1/deprecation/deprecation-policy:
 *   get:
 *     summary: Get deprecation policy
 *     description: Retrieve API deprecation policy
 *     tags: [API Deprecation]
 *     responses:
 *       200:
 *         description: Deprecation policy retrieved successfully
 */
router.get('/deprecation-policy', apiDeprecationController.getDeprecationPolicy);

/**
 * @swagger
 * /api/v1/deprecation/notices:
 *   get:
 *     summary: Get deprecation notices
 *     description: Retrieve active deprecation notices
 *     tags: [API Deprecation]
 *     responses:
 *       200:
 *         description: Deprecation notices retrieved successfully
 */
router.get('/notices', apiDeprecationController.getDeprecationNotices);

/**
 * @swagger
 * /api/v1/deprecation/versions/{version}/lifecycle:
 *   get:
 *     summary: Get version lifecycle
 *     description: Retrieve lifecycle information for an API version
 *     tags: [API Deprecation]
 *     parameters:
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: API version
 *     responses:
 *       200:
 *         description: Version lifecycle retrieved successfully
 *       404:
 *         description: Version not found
 */
router.get('/versions/:version/lifecycle', apiDeprecationController.getVersionLifecycle);

/**
 * @swagger
 * /api/v1/deprecation/compatibility-guarantees:
 *   get:
 *     summary: Get compatibility guarantees
 *     description: Retrieve API compatibility guarantees
 *     tags: [API Deprecation]
 *     responses:
 *       200:
 *         description: Compatibility guarantees retrieved successfully
 */
router.get('/compatibility-guarantees', apiDeprecationController.getCompatibilityGuarantees);

// Admin endpoints
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/deprecation/notices:
 *   post:
 *     summary: Create deprecation notice
 *     description: Create a new deprecation notice (Admin only)
 *     tags: [API Deprecation]
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
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Deprecation notice created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/notices', apiDeprecationController.createDeprecationNotice);

module.exports = router;


