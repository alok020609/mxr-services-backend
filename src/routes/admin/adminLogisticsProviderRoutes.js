const express = require('express');
const router = express.Router();
const adminLogisticsProviderController = require('../../controllers/admin/adminLogisticsProviderController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Logistics Providers
 *   description: Admin endpoints for managing logistics providers (Shiprocket, Delhivery, etc.)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/logistics-providers:
 *   post:
 *     summary: Create logistics provider
 *     description: Create and configure a new logistics provider (Shiprocket, Delhivery, etc.) - Admin only
 *     tags: [Admin Logistics Providers]
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
 *                 description: Display name of the logistics provider
 *                 example: "Shiprocket"
 *               type:
 *                 type: string
 *                 enum: [SHIPROCKET, DELHIVERY, CLICKPOST, VAMASHIP, SHIPJEE, INDISPEED, ULIP]
 *                 description: Logistics provider type
 *                 example: "SHIPROCKET"
 *               config:
 *                 type: object
 *                 description: Provider-specific configuration (API keys, credentials, etc.)
 *                 example:
 *                   email: "merchant@example.com"
 *                   password: "password123"
 *                   apiKey: "API_KEY"
 *                   environment: "production"
 *               webhookUrl:
 *                 type: string
 *                 description: Webhook URL for status updates
 *                 example: "https://api.example.com/webhooks/logistics"
 *               webhookSecret:
 *                 type: string
 *                 description: Webhook secret for signature verification
 *               supportedRegions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Supported regions/countries
 *                 example: ["IN", "US"]
 *               supportedServices:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Supported service types
 *                 example: ["express", "standard", "cod"]
 *               isActive:
 *                 type: boolean
 *                 description: Whether the provider is active
 *                 default: false
 *               isDefault:
 *                 type: boolean
 *                 description: Whether this is the default provider
 *                 default: false
 *               priority:
 *                 type: integer
 *                 description: Provider priority (lower = higher priority)
 *                 default: 0
 *     responses:
 *       201:
 *         description: Logistics provider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogisticsProvider'
 *                 message:
 *                   type: string
 *                   example: "Logistics provider created successfully"
 *       400:
 *         description: Validation error or provider already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Logistics provider with type SHIPROCKET already exists"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', adminLogisticsProviderController.createLogisticsProvider);

/**
 * @swagger
 * /api/v1/admin/logistics-providers:
 *   get:
 *     summary: Get all logistics providers
 *     description: Retrieve paginated list of all logistics providers with optional filters - Admin only
 *     tags: [Admin Logistics Providers]
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
 *           enum: [SHIPROCKET, DELHIVERY, CLICKPOST, VAMASHIP, SHIPJEE, INDISPEED, ULIP]
 *         description: Filter by provider type
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
 *         description: Logistics providers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogisticsProvider'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', adminLogisticsProviderController.getLogisticsProviders);

/**
 * @swagger
 * /api/v1/admin/logistics-providers/{id}:
 *   get:
 *     summary: Get logistics provider by ID
 *     description: Retrieve details of a specific logistics provider - Admin only
 *     tags: [Admin Logistics Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logistics provider ID
 *     responses:
 *       200:
 *         description: Logistics provider retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogisticsProvider'
 *       404:
 *         description: Logistics provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', adminLogisticsProviderController.getLogisticsProvider);

/**
 * @swagger
 * /api/v1/admin/logistics-providers/{id}:
 *   put:
 *     summary: Update logistics provider
 *     description: Update configuration of an existing logistics provider - Admin only
 *     tags: [Admin Logistics Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logistics provider ID
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
 *               webhookUrl:
 *                 type: string
 *               webhookSecret:
 *                 type: string
 *               supportedRegions:
 *                 type: array
 *                 items:
 *                   type: string
 *               supportedServices:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               isDefault:
 *                 type: boolean
 *               priority:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Logistics provider updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogisticsProvider'
 *                 message:
 *                   type: string
 *                   example: "Logistics provider updated successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Logistics provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', adminLogisticsProviderController.updateLogisticsProvider);

/**
 * @swagger
 * /api/v1/admin/logistics-providers/{id}/toggle:
 *   patch:
 *     summary: Toggle logistics provider active status
 *     description: Enable or disable a logistics provider - Admin only
 *     tags: [Admin Logistics Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logistics provider ID
 *     responses:
 *       200:
 *         description: Logistics provider status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogisticsProvider'
 *                 message:
 *                   type: string
 *                   example: "Logistics provider activated successfully"
 *       404:
 *         description: Logistics provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/toggle', adminLogisticsProviderController.toggleLogisticsProvider);

/**
 * @swagger
 * /api/v1/admin/logistics-providers/{id}/set-default:
 *   patch:
 *     summary: Set default logistics provider
 *     description: Set a logistics provider as the default provider - Admin only
 *     tags: [Admin Logistics Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logistics provider ID
 *     responses:
 *       200:
 *         description: Default logistics provider set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogisticsProvider'
 *                 message:
 *                   type: string
 *                   example: "Default logistics provider set successfully"
 *       400:
 *         description: Cannot set inactive provider as default
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Logistics provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/set-default', adminLogisticsProviderController.setDefaultLogisticsProvider);

/**
 * @swagger
 * /api/v1/admin/logistics-providers/{id}:
 *   delete:
 *     summary: Delete logistics provider
 *     description: Delete a logistics provider (only if no active shipments) - Admin only
 *     tags: [Admin Logistics Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logistics provider ID
 *     responses:
 *       200:
 *         description: Logistics provider deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logistics provider deleted successfully"
 *       400:
 *         description: Cannot delete provider with active shipments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Cannot delete provider with 5 active shipments. Please cancel or complete shipments first."
 *       404:
 *         description: Logistics provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', adminLogisticsProviderController.deleteLogisticsProvider);

module.exports = router;
