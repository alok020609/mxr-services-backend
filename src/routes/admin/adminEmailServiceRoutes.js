const express = require('express');
const router = express.Router();
const adminEmailServiceController = require('../../controllers/admin/adminEmailServiceController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Email Services
 *   description: Admin endpoints for managing email service configurations (SMTP, SendGrid, Mailgun, AWS SES)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/email-services:
 *   post:
 *     summary: Create email service
 *     description: Create and configure a new email service (SMTP, SendGrid, Mailgun, AWS SES) - Admin only
 *     tags: [Admin Email Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - config
 *             properties:
 *               name:
 *                 type: string
 *                 description: Display name of the email service
 *                 example: "Gmail SMTP"
 *               type:
 *                 type: string
 *                 enum: [SMTP, SENDGRID, MAILGUN, AWS_SES]
 *                 description: Email service type
 *                 example: "SMTP"
 *               config:
 *                 type: object
 *                 description: Service-specific configuration
 *                 example:
 *                   host: "smtp.gmail.com"
 *                   port: 587
 *                   secure: false
 *                   user: "your-email@gmail.com"
 *                   password: "your-password"
 *                   from: "noreply@example.com"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the service is active
 *                 default: false
 *                 example: true
 *               isDefault:
 *                 type: boolean
 *                 description: Whether this is the default email service
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: Email service created successfully
 *       400:
 *         description: Bad request - Invalid configuration or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Email service type already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', adminEmailServiceController.createEmailService);

/**
 * @swagger
 * /api/v1/admin/email-services:
 *   get:
 *     summary: Get all email services
 *     description: Retrieve list of all email services with optional filters - Admin only
 *     tags: [Admin Email Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SMTP, SENDGRID, MAILGUN, AWS_SES]
 *         description: Filter by service type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Email services retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', adminEmailServiceController.getEmailServices);

/**
 * @swagger
 * /api/v1/admin/email-services/{id}:
 *   get:
 *     summary: Get email service details
 *     description: Retrieve detailed information about a specific email service - Admin only
 *     tags: [Admin Email Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email service ID
 *     responses:
 *       200:
 *         description: Email service retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Email service not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', adminEmailServiceController.getEmailService);

/**
 * @swagger
 * /api/v1/admin/email-services/{id}:
 *   put:
 *     summary: Update email service
 *     description: Update configuration and settings of an email service - Admin only
 *     tags: [Admin Email Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               config:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Email service updated successfully
 *       400:
 *         description: Bad request - Invalid configuration
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Email service not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', adminEmailServiceController.updateEmailService);

/**
 * @swagger
 * /api/v1/admin/email-services/{id}/toggle:
 *   patch:
 *     summary: Toggle email service status
 *     description: Enable or disable an email service - Admin only
 *     tags: [Admin Email Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Whether to activate or deactivate the service
 *                 example: true
 *     responses:
 *       200:
 *         description: Email service status updated successfully
 *       400:
 *         description: Bad request - Invalid isActive value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Email service not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle', adminEmailServiceController.toggleEmailService);

/**
 * @swagger
 * /api/v1/admin/email-services/{id}/set-default:
 *   patch:
 *     summary: Set default email service
 *     description: Set an email service as the default service for sending emails - Admin only
 *     tags: [Admin Email Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email service ID
 *     responses:
 *       200:
 *         description: Email service set as default successfully
 *       400:
 *         description: Bad request - Service is not active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Email service not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/set-default', adminEmailServiceController.setDefaultEmailService);

/**
 * @swagger
 * /api/v1/admin/email-services/{id}:
 *   delete:
 *     summary: Delete email service
 *     description: Delete an email service (cannot delete default service) - Admin only
 *     tags: [Admin Email Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email service ID
 *     responses:
 *       200:
 *         description: Email service deleted successfully
 *       400:
 *         description: Bad request - Cannot delete default service
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Email service not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', adminEmailServiceController.deleteEmailService);

module.exports = router;
