const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: CRM
 *   description: Customer relationship management endpoints (Admin only)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/crm/customers/{userId}/360:
 *   get:
 *     summary: Get customer 360 view
 *     description: Retrieve comprehensive 360-degree view of a customer (Admin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Customer 360 view retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/customers/:userId/360', crmController.getCustomer360);

/**
 * @swagger
 * /api/v1/crm/customers/{userId}/rfm:
 *   get:
 *     summary: Get RFM analysis
 *     description: Retrieve Recency, Frequency, Monetary analysis for a customer (Admin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: RFM analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/customers/:userId/rfm', crmController.getRFMAnalysis);

/**
 * @swagger
 * /api/v1/crm/customers/{userId}/tags:
 *   post:
 *     summary: Add customer tag
 *     description: Add a tag to a customer profile (Admin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tag
 *             properties:
 *               tag:
 *                 type: string
 *                 description: Tag name
 *     responses:
 *       200:
 *         description: Tag added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/customers/:userId/tags', crmController.addCustomerTag);

/**
 * @swagger
 * /api/v1/crm/customers/{userId}/notes:
 *   post:
 *     summary: Add customer note
 *     description: Add a note to a customer profile (Admin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 description: Note content
 *     responses:
 *       201:
 *         description: Note added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/customers/:userId/notes', crmController.addCustomerNote);

/**
 * @swagger
 * /api/v1/crm/segments:
 *   get:
 *     summary: Get customer segments
 *     description: Retrieve customer segmentation data (Admin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer segments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/segments', crmController.getCustomerSegments);

module.exports = router;


