const express = require('express');
const router = express.Router();
const observabilityController = require('../controllers/observabilityController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Observability
 *   description: System observability including SLA, SLO, and alerting
 */

// Public endpoints
/**
 * @swagger
 * /api/v1/observability/sla:
 *   get:
 *     summary: Get SLA definitions
 *     description: Retrieve Service Level Agreement definitions
 *     tags: [Observability]
 *     responses:
 *       200:
 *         description: SLA definitions retrieved successfully
 */
router.get('/sla', observabilityController.getSLADefinitions);

/**
 * @swagger
 * /api/v1/observability/slo:
 *   get:
 *     summary: Get SLO definitions
 *     description: Retrieve Service Level Objective definitions
 *     tags: [Observability]
 *     responses:
 *       200:
 *         description: SLO definitions retrieved successfully
 */
router.get('/slo', observabilityController.getSLODefinitions);

/**
 * @swagger
 * /api/v1/observability/slo/{service}/status:
 *   get:
 *     summary: Get SLO status
 *     description: Get current SLO status for a service
 *     tags: [Observability]
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *         description: Service name
 *     responses:
 *       200:
 *         description: SLO status retrieved successfully
 *       404:
 *         description: Service not found
 */
router.get('/slo/:service/status', observabilityController.getSLOStatus);

/**
 * @swagger
 * /api/v1/observability/alerts/thresholds:
 *   get:
 *     summary: Get alert thresholds
 *     description: Retrieve alert threshold configurations
 *     tags: [Observability]
 *     responses:
 *       200:
 *         description: Alert thresholds retrieved successfully
 */
router.get('/alerts/thresholds', observabilityController.getAlertThresholds);

/**
 * @swagger
 * /api/v1/observability/alerts/{service}/check:
 *   get:
 *     summary: Check alert conditions
 *     description: Check if alert conditions are met for a service
 *     tags: [Observability]
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *         description: Service name
 *     responses:
 *       200:
 *         description: Alert conditions checked successfully
 *       404:
 *         description: Service not found
 */
router.get('/alerts/:service/check', observabilityController.checkAlertConditions);

/**
 * @swagger
 * /api/v1/observability/slo/{service}/report:
 *   get:
 *     summary: Generate SLO report
 *     description: Generate SLO compliance report for a service
 *     tags: [Observability]
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *         description: Service name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Report start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Report end date
 *     responses:
 *       200:
 *         description: SLO report generated successfully
 *       404:
 *         description: Service not found
 */
router.get('/slo/:service/report', observabilityController.generateSLOReport);

module.exports = router;


