const express = require('express');
const router = express.Router();
const adminSMSServiceController = require('../../controllers/admin/adminSMSServiceController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin SMS Services
 *   description: Admin endpoints for managing SMS service configurations (Twilio, AWS SNS, MessageBird)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/sms-services:
 *   post:
 *     summary: Create SMS service
 *     description: Create and configure a new SMS service (Twilio, AWS SNS, MessageBird) - Admin only
 *     tags: [Admin SMS Services]
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
 *                 description: Display name of the SMS service
 *                 example: "Twilio Production"
 *               type:
 *                 type: string
 *                 enum: [TWILIO, AWS_SNS, MESSAGEBIRD]
 *                 description: SMS service type
 *                 example: "TWILIO"
 *               config:
 *                 type: object
 *                 description: Service-specific configuration
 *                 example:
 *                   accountSid: "ACxxx"
 *                   authToken: "xxx"
 *                   phoneNumber: "+1234567890"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the service is active
 *                 default: false
 *                 example: true
 *               isDefault:
 *                 type: boolean
 *                 description: Whether this is the default SMS service
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: SMS service created successfully
 *       400:
 *         description: Bad request - Invalid configuration or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - SMS service type already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', adminSMSServiceController.createSMSService);

/**
 * @swagger
 * /api/v1/admin/sms-services:
 *   get:
 *     summary: Get all SMS services
 *     description: Retrieve list of all SMS services with optional filters - Admin only
 *     tags: [Admin SMS Services]
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
 *           enum: [TWILIO, AWS_SNS, MESSAGEBIRD]
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
 *         description: SMS services retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', adminSMSServiceController.getSMSServices);

/**
 * @swagger
 * /api/v1/admin/sms-services/{id}:
 *   get:
 *     summary: Get SMS service details
 *     description: Retrieve detailed information about a specific SMS service - Admin only
 *     tags: [Admin SMS Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SMS service ID
 *     responses:
 *       200:
 *         description: SMS service retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: SMS service not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', adminSMSServiceController.getSMSService);

/**
 * @swagger
 * /api/v1/admin/sms-services/{id}:
 *   put:
 *     summary: Update SMS service
 *     description: Update configuration and settings of an SMS service - Admin only
 *     tags: [Admin SMS Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SMS service ID
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
 *         description: SMS service updated successfully
 *       400:
 *         description: Bad request - Invalid configuration
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: SMS service not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', adminSMSServiceController.updateSMSService);

/**
 * @swagger
 * /api/v1/admin/sms-services/{id}/toggle:
 *   patch:
 *     summary: Toggle SMS service status
 *     description: Enable or disable an SMS service - Admin only
 *     tags: [Admin SMS Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SMS service ID
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
 *         description: SMS service status updated successfully
 *       400:
 *         description: Bad request - Invalid isActive value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: SMS service not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle', adminSMSServiceController.toggleSMSService);

/**
 * @swagger
 * /api/v1/admin/sms-services/{id}/set-default:
 *   patch:
 *     summary: Set default SMS service
 *     description: Set an SMS service as the default service for sending SMS - Admin only
 *     tags: [Admin SMS Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SMS service ID
 *     responses:
 *       200:
 *         description: SMS service set as default successfully
 *       400:
 *         description: Bad request - Service is not active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: SMS service not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/set-default', adminSMSServiceController.setDefaultSMSService);

/**
 * @swagger
 * /api/v1/admin/sms-services/{id}:
 *   delete:
 *     summary: Delete SMS service
 *     description: Delete an SMS service (cannot delete default service) - Admin only
 *     tags: [Admin SMS Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SMS service ID
 *     responses:
 *       200:
 *         description: SMS service deleted successfully
 *       400:
 *         description: Bad request - Cannot delete default service
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: SMS service not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', adminSMSServiceController.deleteSMSService);

module.exports = router;
