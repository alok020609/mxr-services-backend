const express = require('express');
const router = express.Router();
const adminPaymentGatewayController = require('../../controllers/admin/adminPaymentGatewayController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Payment Gateways
 *   description: Admin endpoints for managing payment gateways (PhonePe, GPay, Paytm, etc.)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/payment-gateways:
 *   post:
 *     summary: Create payment gateway
 *     description: Create and configure a new payment gateway (PhonePe, GPay, Paytm, etc.) - Admin only
 *     tags: [Admin Payment Gateways]
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
 *                 description: Display name of the payment gateway
 *                 example: "PhonePe"
 *               type:
 *                 type: string
 *                 enum: [STRIPE, PAYU, PAYPAL, UPI, RAZORPAY, CRYPTO, BANK_TRANSFER, COD, PHONEPE, GPAY, PAYTM]
 *                 description: Payment gateway type
 *                 example: "PHONEPE"
 *               config:
 *                 type: object
 *                 description: Gateway-specific configuration (API keys, merchant IDs, etc.)
 *                 example:
 *                   merchantId: "MERCHANT_ID"
 *                   merchantKey: "MERCHANT_KEY"
 *                   apiKey: "API_KEY"
 *                   environment: "production"
 *               webhookSecret:
 *                 type: string
 *                 description: Webhook secret for verifying webhook requests
 *                 example: "webhook_secret_key"
 *               supportedCurrencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Supported currency codes
 *                 example: ["INR", "USD"]
 *               supportedMethods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Supported payment methods
 *                 example: ["UPI", "WALLET", "NET_BANKING", "CREDIT_CARD"]
 *               isActive:
 *                 type: boolean
 *                 description: Whether the gateway is active
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: Payment gateway created successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     config:
 *                       type: object
 *                     supportedCurrencies:
 *                       type: array
 *                     supportedMethods:
 *                       type: array
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid configuration or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Payment gateway type already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', adminPaymentGatewayController.createPaymentGateway);

/**
 * @swagger
 * /api/v1/admin/payment-gateways/config-schema:
 *   get:
 *     summary: Get config schema for a gateway type
 *     description: Returns field names, types, required/optional, and optional labels/descriptions so the frontend can render gateway-specific config forms (e.g. PayU key, salt, environment) without hardcoding.
 *     tags: [Admin Payment Gateways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [STRIPE, PAYU, PAYPAL, RAZORPAY, PHONEPE, GPAY, PAYTM]
 *         description: Payment gateway type (e.g. PAYU)
 *     responses:
 *       200:
 *         description: Config schema for the gateway type
 *       400:
 *         description: Missing type or unknown gateway type
 */
router.get('/config-schema', adminPaymentGatewayController.getConfigSchema);

/**
 * @swagger
 * /api/v1/admin/payment-gateways:
 *   get:
 *     summary: Get all payment gateways
 *     description: Retrieve list of all payment gateways with optional filters - Admin only
 *     tags: [Admin Payment Gateways]
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
 *           enum: [STRIPE, PAYU, PAYPAL, UPI, RAZORPAY, CRYPTO, BANK_TRANSFER, COD, PHONEPE, GPAY, PAYTM]
 *         description: Filter by gateway type
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
 *         description: Payment gateways retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       config:
 *                         type: object
 *                       supportedCurrencies:
 *                         type: array
 *                       supportedMethods:
 *                         type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', adminPaymentGatewayController.getPaymentGateways);

/**
 * @swagger
 * /api/v1/admin/payment-gateways/{id}:
 *   get:
 *     summary: Get payment gateway details
 *     description: Retrieve detailed information about a specific payment gateway - Admin only
 *     tags: [Admin Payment Gateways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment gateway ID
 *     responses:
 *       200:
 *         description: Payment gateway retrieved successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     config:
 *                       type: object
 *                     webhookSecret:
 *                       type: string
 *                     supportedCurrencies:
 *                       type: array
 *                     supportedMethods:
 *                       type: array
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment gateway not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', adminPaymentGatewayController.getPaymentGateway);

/**
 * @swagger
 * /api/v1/admin/payment-gateways/{id}:
 *   put:
 *     summary: Update payment gateway
 *     description: Update configuration and settings of a payment gateway - Admin only
 *     tags: [Admin Payment Gateways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment gateway ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Display name of the payment gateway
 *               config:
 *                 type: object
 *                 description: Gateway-specific configuration
 *               webhookSecret:
 *                 type: string
 *                 description: Webhook secret
 *               supportedCurrencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Supported currency codes
 *               supportedMethods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Supported payment methods
 *               isActive:
 *                 type: boolean
 *                 description: Whether the gateway is active
 *     responses:
 *       200:
 *         description: Payment gateway updated successfully
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
 *       400:
 *         description: Bad request - Invalid configuration
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment gateway not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', adminPaymentGatewayController.updatePaymentGateway);

/**
 * @swagger
 * /api/v1/admin/payment-gateways/{id}/toggle:
 *   patch:
 *     summary: Toggle payment gateway status
 *     description: Enable or disable a payment gateway - Admin only
 *     tags: [Admin Payment Gateways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment gateway ID
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
 *                 description: Whether to activate or deactivate the gateway
 *                 example: true
 *     responses:
 *       200:
 *         description: Payment gateway status updated successfully
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
 *                   example: "Payment gateway activated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid isActive value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment gateway not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle', adminPaymentGatewayController.togglePaymentGateway);

/**
 * @swagger
 * /api/v1/admin/payment-gateways/{id}:
 *   delete:
 *     summary: Delete payment gateway
 *     description: Delete a payment gateway (only if not in use) - Admin only
 *     tags: [Admin Payment Gateways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment gateway ID
 *     responses:
 *       200:
 *         description: Payment gateway deleted successfully
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
 *                   example: "Payment gateway deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment gateway not found
 *       409:
 *         description: Conflict - Payment gateway is in use and cannot be deleted
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', adminPaymentGatewayController.deletePaymentGateway);

module.exports = router;
