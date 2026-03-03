const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migrationController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Migrations
 *   description: Database migration management endpoints (Admin only)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/migrations/execute:
 *   post:
 *     summary: Execute migration
 *     description: Execute a database migration (Admin only)
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - migrationName
 *             properties:
 *               migrationName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Migration executed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/execute', migrationController.executeMigration);

/**
 * @swagger
 * /api/v1/migrations/zero-downtime:
 *   post:
 *     summary: Execute zero-downtime migration
 *     description: Execute a zero-downtime migration strategy (Admin only)
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - migrationName
 *             properties:
 *               migrationName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zero-downtime migration executed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/zero-downtime', migrationController.executeZeroDowntimeMigration);

/**
 * @swagger
 * /api/v1/migrations/{migrationId}/rollback:
 *   post:
 *     summary: Rollback migration
 *     description: Rollback a migration (Admin only)
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: migrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Migration ID
 *     responses:
 *       200:
 *         description: Migration rolled back successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Migration not found
 */
router.post('/:migrationId/rollback', migrationController.rollbackMigration);

/**
 * @swagger
 * /api/v1/migrations/rollout:
 *   post:
 *     summary: Gradual rollout
 *     description: Perform gradual rollout of a migration (Admin only)
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - migrationName
 *               - rolloutPercentage
 *             properties:
 *               migrationName:
 *                 type: string
 *               rolloutPercentage:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Gradual rollout initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/rollout', migrationController.gradualRollout);

/**
 * @swagger
 * /api/v1/migrations/compatibility:
 *   post:
 *     summary: Check backward compatibility
 *     description: Check if a migration maintains backward compatibility (Admin only)
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - migrationName
 *             properties:
 *               migrationName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compatibility check completed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/compatibility', migrationController.checkBackwardCompatibility);

module.exports = router;


