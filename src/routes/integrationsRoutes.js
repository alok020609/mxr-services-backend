const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrationsController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Integrations
 *   description: Third-party integrations endpoints
 */

// Authenticated endpoints
router.use(auth);

/**
 * @swagger
 * /api/v1/integrations/sms:
 *   post:
 *     summary: Send SMS
 *     description: Send SMS through integrated SMS service
 *     tags: [Integrations]
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
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: SMS sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/sms', integrationsController.sendSMS);

/**
 * @swagger
 * /api/v1/integrations/email:
 *   post:
 *     summary: Send email
 *     description: Send an email through the configured email service
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - text
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *                 example: "user@example.com"
 *               subject:
 *                 type: string
 *                 description: Email subject
 *                 example: "Welcome to our store"
 *               text:
 *                 type: string
 *                 description: Plain text email content
 *                 example: "Welcome! Thank you for joining us."
 *               html:
 *                 type: string
 *                 description: HTML email content (optional)
 *                 example: "<h1>Welcome!</h1><p>Thank you for joining us.</p>"
 *               cc:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: CC recipients (optional)
 *               bcc:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: BCC recipients (optional)
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     path:
 *                       type: string
 *                     content:
 *                       type: string
 *                 description: Email attachments (optional)
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     accepted:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request - Invalid email data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/email', integrationsController.sendEmail);

/**
 * @swagger
 * /api/v1/integrations/marketing/list:
 *   post:
 *     summary: Add to marketing list
 *     description: Add user to marketing email list
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *             properties:
 *               listId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Added to marketing list successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/marketing/list', integrationsController.addToMarketingList);

/**
 * @swagger
 * /api/v1/integrations/analytics/track:
 *   post:
 *     summary: Track analytics event
 *     description: Track custom analytics events
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *             properties:
 *               event:
 *                 type: string
 *               properties:
 *                 type: object
 *     responses:
 *       200:
 *         description: Event tracked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/analytics/track', integrationsController.trackAnalyticsEvent);

/**
 * @swagger
 * /api/v1/integrations/social/post:
 *   post:
 *     summary: Post to social media
 *     description: Post content to integrated social media platforms
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *               - content
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [facebook, twitter, instagram]
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Posted to social media successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/social/post', integrationsController.postToSocialMedia);

// Admin endpoints
router.use(admin);

/**
 * @swagger
 * /api/v1/integrations/crm/sync:
 *   post:
 *     summary: Sync to CRM
 *     description: Sync data to CRM system (Admin only)
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *             properties:
 *               resource:
 *                 type: string
 *                 enum: [customers, orders, products]
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/crm/sync', integrationsController.syncToCRM);

/**
 * @swagger
 * /api/v1/integrations/erp/sync:
 *   post:
 *     summary: Sync to ERP
 *     description: Sync data to ERP system (Admin only)
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *             properties:
 *               resource:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/erp/sync', integrationsController.syncToERP);

/**
 * @swagger
 * /api/v1/integrations/wms/sync:
 *   post:
 *     summary: Sync to WMS
 *     description: Sync inventory data to Warehouse Management System (Admin only)
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               warehouseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/wms/sync', integrationsController.syncToWMS);

/**
 * @swagger
 * /api/v1/integrations/webhooks:
 *   post:
 *     summary: Create webhook
 *     description: Create a webhook for external integrations (Admin only)
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Webhook created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/webhooks', integrationsController.createWebhook);

/**
 * @swagger
 * /api/v1/integrations/webhooks/trigger:
 *   post:
 *     summary: Trigger webhook
 *     description: Manually trigger a webhook (Admin only)
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webhookId
 *               - event
 *             properties:
 *               webhookId:
 *                 type: string
 *               event:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook triggered successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/webhooks/trigger', integrationsController.triggerWebhook);

module.exports = router;


