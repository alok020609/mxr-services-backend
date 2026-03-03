const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Monitoring
 *   description: System monitoring and health check endpoints
 */

// Public health check
/**
 * @swagger
 * /api/v1/monitoring/health:
 *   get:
 *     summary: Get system health
 *     description: Retrieve system health status
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: System health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                     redis:
 *                       type: string
 */
router.get('/health', monitoringController.getSystemHealth);

// Admin metrics
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/monitoring/metrics:
 *   get:
 *     summary: Get system metrics
 *     description: Retrieve detailed system metrics (Admin only)
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics', monitoringController.getMetrics);

module.exports = router;


