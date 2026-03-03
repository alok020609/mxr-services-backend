const express = require('express');
const router = express.Router();
const featureFlagController = require('../controllers/featureFlagController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Feature Flags
 *   description: Feature flag management and evaluation endpoints
 */

// Public evaluation endpoint
/**
 * @swagger
 * /api/v1/feature-flags/{flagKey}/evaluate:
 *   get:
 *     summary: Evaluate feature flag
 *     description: Check if a feature flag is enabled for the authenticated user
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     responses:
 *       200:
 *         description: Flag evaluation result
 *       401:
 *         description: Unauthorized
 */
router.get('/:flagKey/evaluate', auth, featureFlagController.evaluateFlag);

// Admin endpoints
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/feature-flags:
 *   get:
 *     summary: Get all feature flags
 *     description: Retrieve all feature flags (Admin only)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feature flags retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', featureFlagController.getFlags);

/**
 * @swagger
 * /api/v1/feature-flags/{flagKey}:
 *   get:
 *     summary: Get feature flag
 *     description: Retrieve details of a specific feature flag (Admin only)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     responses:
 *       200:
 *         description: Feature flag retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feature flag not found
 */
router.get('/:flagKey', featureFlagController.getFlag);

/**
 * @swagger
 * /api/v1/feature-flags:
 *   post:
 *     summary: Create feature flag
 *     description: Create a new feature flag (Admin only)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - name
 *             properties:
 *               key:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Feature flag created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', featureFlagController.createFlag);

/**
 * @swagger
 * /api/v1/feature-flags/{flagKey}:
 *   put:
 *     summary: Update feature flag
 *     description: Update an existing feature flag (Admin only)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feature flag updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feature flag not found
 */
router.put('/:flagKey', featureFlagController.updateFlag);

/**
 * @swagger
 * /api/v1/feature-flags/{flagKey}/stats:
 *   get:
 *     summary: Get feature flag usage stats
 *     description: Retrieve usage statistics for a feature flag (Admin only)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     responses:
 *       200:
 *         description: Usage stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feature flag not found
 */
router.get('/:flagKey/stats', featureFlagController.getUsageStats);

/**
 * @swagger
 * /api/v1/feature-flags/{flagKey}/rules:
 *   post:
 *     summary: Create feature flag rule
 *     description: Create a targeting rule for a feature flag (Admin only)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conditions
 *             properties:
 *               conditions:
 *                 type: object
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Rule created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/:flagKey/rules', featureFlagController.createRule);

/**
 * @swagger
 * /api/v1/feature-flags/{flagKey}/overrides:
 *   post:
 *     summary: Create feature flag override
 *     description: Create an override for a specific user or context (Admin only)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - context
 *               - enabled
 *             properties:
 *               context:
 *                 type: object
 *                 description: Context for override (e.g., userId, tenantId)
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Override created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/:flagKey/overrides', featureFlagController.createOverride);

module.exports = router;


