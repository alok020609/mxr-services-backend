const express = require('express');
const router = express.Router();
const shippingCarrierController = require('../controllers/shippingCarrierController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Shipping Carriers
 *   description: Shipping carrier integration and label management
 */

// Public tracking
/**
 * @swagger
 * /api/v1/shipping/carriers/track/{trackingNumber}:
 *   get:
 *     summary: Track shipment
 *     description: Track a shipment using tracking number
 *     tags: [Shipping Carriers]
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracking number
 *       - in: query
 *         name: carrier
 *         schema:
 *           type: string
 *         description: Carrier name (optional)
 *     responses:
 *       200:
 *         description: Tracking information retrieved successfully
 *       404:
 *         description: Shipment not found
 */
router.get('/track/:trackingNumber', shippingCarrierController.trackShipment);

// Authenticated endpoints
router.use(auth);

/**
 * @swagger
 * /api/v1/shipping/carriers/rates:
 *   post:
 *     summary: Get all carrier rates
 *     description: Get shipping rates from all available carriers
 *     tags: [Shipping Carriers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - items
 *             properties:
 *               address:
 *                 type: object
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Carrier rates retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/rates', shippingCarrierController.getAllRates);

// Admin endpoints
router.use(admin);

/**
 * @swagger
 * /api/v1/shipping/carriers/labels:
 *   post:
 *     summary: Create shipping label
 *     description: Create a shipping label for an order (Admin only)
 *     tags: [Shipping Carriers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - carrier
 *             properties:
 *               orderId:
 *                 type: string
 *               carrier:
 *                 type: string
 *               service:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shipping label created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/labels', shippingCarrierController.createShippingLabel);

module.exports = router;


