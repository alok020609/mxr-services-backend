const express = require('express');
const router = express.Router();
const disasterRecoveryController = require('../controllers/disasterRecoveryController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Disaster Recovery
 *   description: Disaster recovery and backup management endpoints (Admin only)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/disaster-recovery/rpo-rto:
 *   get:
 *     summary: Get RPO/RTO definitions
 *     description: Retrieve Recovery Point Objective and Recovery Time Objective definitions (Admin only)
 *     tags: [Disaster Recovery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: RPO/RTO definitions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/rpo-rto', disasterRecoveryController.getRPORTODefinitions);

/**
 * @swagger
 * /api/v1/disaster-recovery/plan:
 *   get:
 *     summary: Get disaster recovery plan
 *     description: Retrieve disaster recovery plan (Admin only)
 *     tags: [Disaster Recovery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: DR plan retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/plan', disasterRecoveryController.getDRPlan);

/**
 * @swagger
 * /api/v1/disaster-recovery/backups:
 *   post:
 *     summary: Create backup
 *     description: Create a manual backup (Admin only)
 *     tags: [Disaster Recovery]
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
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [FULL, INCREMENTAL, DIFFERENTIAL]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Backup created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/backups', disasterRecoveryController.createBackup);

/**
 * @swagger
 * /api/v1/disaster-recovery/backups/schedule:
 *   post:
 *     summary: Schedule backups
 *     description: Configure automated backup schedule (Admin only)
 *     tags: [Disaster Recovery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - frequency
 *               - time
 *             properties:
 *               frequency:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY]
 *               time:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: Backup schedule configured successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/backups/schedule', disasterRecoveryController.scheduleBackups);

/**
 * @swagger
 * /api/v1/disaster-recovery/backups/{backupId}/restore:
 *   post:
 *     summary: Restore backup
 *     description: Restore from a backup (Admin only)
 *     tags: [Disaster Recovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetDatabase:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restore initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Backup not found
 */
router.post('/backups/:backupId/restore', disasterRecoveryController.restoreBackup);

/**
 * @swagger
 * /api/v1/disaster-recovery/drills:
 *   post:
 *     summary: Perform restore drill
 *     description: Perform a disaster recovery drill (Admin only)
 *     tags: [Disaster Recovery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - backupId
 *             properties:
 *               backupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restore drill completed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/drills', disasterRecoveryController.performRestoreDrill);

/**
 * @swagger
 * /api/v1/disaster-recovery/failover:
 *   post:
 *     summary: Handle region failure
 *     description: Initiate failover to a backup region (Admin only)
 *     tags: [Disaster Recovery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetRegion
 *             properties:
 *               targetRegion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Failover initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/failover', disasterRecoveryController.handleRegionFailure);

module.exports = router;


