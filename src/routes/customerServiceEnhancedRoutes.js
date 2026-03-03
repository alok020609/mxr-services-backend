const express = require('express');
const router = express.Router();
const customerServiceEnhancedController = require('../controllers/customerServiceEnhancedController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Customer Service Enhanced
 *   description: Enhanced customer service features including knowledge base and troubleshooting
 */

// Public routes (no auth required)
/**
 * @swagger
 * /api/v1/customer-service/track-order:
 *   post:
 *     summary: Track order without login
 *     description: Track an order using order number and email (no authentication required)
 *     tags: [Customer Service Enhanced]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderNumber
 *               - email
 *             properties:
 *               orderNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Order tracking information retrieved successfully
 *       404:
 *         description: Order not found
 */
router.post('/track-order', customerServiceEnhancedController.trackOrderWithoutLogin);

/**
 * @swagger
 * /api/v1/customer-service/knowledge-base:
 *   get:
 *     summary: Get knowledge base articles
 *     description: Retrieve knowledge base articles
 *     tags: [Customer Service Enhanced]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Knowledge base articles retrieved successfully
 */
router.get('/knowledge-base', customerServiceEnhancedController.getKnowledgeBase);

/**
 * @swagger
 * /api/v1/customer-service/troubleshooting:
 *   get:
 *     summary: Get troubleshooting guides
 *     description: Retrieve troubleshooting guides
 *     tags: [Customer Service Enhanced]
 *     responses:
 *       200:
 *         description: Troubleshooting guides retrieved successfully
 */
router.get('/troubleshooting', customerServiceEnhancedController.getTroubleshootingGuides);

/**
 * @swagger
 * /api/v1/customer-service/video-tutorials:
 *   get:
 *     summary: Get video tutorials
 *     description: Retrieve video tutorials
 *     tags: [Customer Service Enhanced]
 *     responses:
 *       200:
 *         description: Video tutorials retrieved successfully
 */
router.get('/video-tutorials', customerServiceEnhancedController.getVideoTutorials);

// Authenticated routes
router.use(auth);

/**
 * @swagger
 * /api/v1/customer-service/callback:
 *   post:
 *     summary: Schedule callback
 *     description: Schedule a callback from customer service
 *     tags: [Customer Service Enhanced]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - preferredTime
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               preferredTime:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Callback scheduled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/callback', customerServiceEnhancedController.scheduleCallback);

module.exports = router;


