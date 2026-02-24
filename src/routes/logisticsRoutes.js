const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { auth, admin, vendor } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Logistics
 *   description: Logistics and shipping operations
 */

/**
 * @swagger
 * /api/v1/logistics/track:
 *   get:
 *     summary: Track shipment
 *     description: Track a shipment by order ID or tracking number
 *     tags: [Logistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Order ID
 *       - in: query
 *         name: trackingNumber
 *         schema:
 *           type: string
 *         description: Tracking number or AWB
 *       - in: query
 *         name: providerType
 *         schema:
 *           type: string
 *         description: Provider type (optional, auto-detected if not provided)
 *     responses:
 *       200:
 *         description: Tracking information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TrackingInfo'
 *       400:
 *         description: Missing orderId or trackingNumber
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Either orderId or trackingNumber is required"
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/track', auth, logisticsController.trackShipment);

/**
 * @swagger
 * /api/v1/logistics/rates:
 *   post:
 *     summary: Calculate shipping rates
 *     description: Calculate shipping rates for a shipment. Set compareAll=true to compare rates across all providers.
 *     tags: [Logistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: compareAll
 *         schema:
 *           type: boolean
 *         description: Compare rates from all active providers
 *       - in: query
 *         name: providerType
 *         schema:
 *           type: string
 *         description: Specific provider type to use
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickup
 *               - delivery
 *               - weight
 *             properties:
 *               pickup:
 *                 type: object
 *                 properties:
 *                   pincode:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *               delivery:
 *                 type: object
 *                 properties:
 *                   pincode:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *               weight:
 *                 type: number
 *                 description: Weight in kg
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *               codAmount:
 *                 type: number
 *                 description: COD amount if applicable
 *     responses:
 *       200:
 *         description: Rates calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/ShippingRate'
 *                     - type: object
 *                       properties:
 *                         comparisons:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               provider:
 *                                 type: string
 *                               providerName:
 *                                 type: string
 *                               rates:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/ShippingRate'
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               provider:
 *                                 type: string
 *                               error:
 *                                 type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/rates', auth, logisticsController.calculateRates);

/**
 * @swagger
 * /api/v1/logistics/shipments:
 *   post:
 *     summary: Create shipment
 *     description: Create a new shipment for an order - Admin/Vendor only
 *     tags: [Logistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *         description: Specific provider ID (optional, uses default if not provided)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *               pickup:
 *                 type: object
 *               delivery:
 *                 type: object
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: object
 *               codAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogisticsShipment'
 *                 message:
 *                   type: string
 *                   example: "Shipment created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin/Vendor access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/shipments', auth, (req, res, next) => {
  if (req.user.role === 'ADMIN' || req.user.role === 'VENDOR') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Forbidden - Admin/Vendor access required' });
  }
}, logisticsController.createShipment);

/**
 * @swagger
 * /api/v1/logistics/shipments/{orderId}:
 *   get:
 *     summary: Get shipment status
 *     description: Get shipment status for an order
 *     tags: [Logistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Shipment status retrieved successfully
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
 *                     $ref: '#/components/schemas/LogisticsShipment'
 *       404:
 *         description: No shipments found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/shipments/:orderId', auth, logisticsController.getShipmentStatus);

/**
 * @swagger
 * /api/v1/logistics/shipments/{shipmentId}/label:
 *   post:
 *     summary: Generate shipping label
 *     description: Generate shipping label for a shipment - Admin/Vendor only
 *     tags: [Logistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     responses:
 *       200:
 *         description: Label generated successfully
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
 *                     labelUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/labels/AWB123456.pdf"
 *                     awbNumber:
 *                       type: string
 *                       example: "AWB123456"
 *                 message:
 *                   type: string
 *                   example: "Label generated successfully"
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin/Vendor access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/shipments/:shipmentId/label', auth, (req, res, next) => {
  if (req.user.role === 'ADMIN' || req.user.role === 'VENDOR') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Forbidden - Admin/Vendor access required' });
  }
}, logisticsController.generateLabel);

/**
 * @swagger
 * /api/v1/logistics/shipments/{shipmentId}/pickup:
 *   post:
 *     summary: Schedule pickup
 *     description: Schedule a pickup for a shipment - Admin/Vendor only
 *     tags: [Logistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pickupDate:
 *                 type: string
 *                 format: date
 *               pickupTime:
 *                 type: string
 *                 example: "10:00-17:00"
 *     responses:
 *       200:
 *         description: Pickup scheduled successfully
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
 *                     success:
 *                       type: boolean
 *                     pickupDate:
 *                       type: string
 *                       format: date
 *                 message:
 *                   type: string
 *                   example: "Pickup scheduled successfully"
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin/Vendor access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/shipments/:shipmentId/pickup', auth, (req, res, next) => {
  if (req.user.role === 'ADMIN' || req.user.role === 'VENDOR') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Forbidden - Admin/Vendor access required' });
  }
}, logisticsController.schedulePickup);

/**
 * @swagger
 * /api/v1/logistics/shipments/{shipmentId}:
 *   delete:
 *     summary: Cancel shipment
 *     description: Cancel a shipment - Admin/Vendor only
 *     tags: [Logistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Cancellation reason
 *     responses:
 *       200:
 *         description: Shipment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogisticsShipment'
 *                 message:
 *                   type: string
 *                   example: "Shipment cancelled successfully"
 *       400:
 *         description: Cannot cancel shipment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Cannot cancel shipment with status: delivered"
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin/Vendor access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/shipments/:shipmentId', auth, (req, res, next) => {
  if (req.user.role === 'ADMIN' || req.user.role === 'VENDOR') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Forbidden - Admin/Vendor access required' });
  }
}, logisticsController.cancelShipment);

/**
 * @swagger
 * /api/v1/logistics/returns:
 *   post:
 *     summary: Handle return shipment
 *     description: Create a return shipment for an order
 *     tags: [Logistics]
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
 *             properties:
 *               orderId:
 *                 type: string
 *               providerId:
 *                 type: string
 *               pickup:
 *                 type: object
 *               delivery:
 *                 type: object
 *               items:
 *                 type: array
 *               total:
 *                 type: number
 *     responses:
 *       201:
 *         description: Return shipment created successfully
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
 *                       example: "SR789012"
 *                     awbNumber:
 *                       type: string
 *                       example: "AWB789012"
 *                     trackingNumber:
 *                       type: string
 *                       example: "AWB789012"
 *                 message:
 *                   type: string
 *                   example: "Return shipment created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/returns', auth, logisticsController.handleReturn);

module.exports = router;
