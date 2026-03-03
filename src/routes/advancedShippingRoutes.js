const express = require('express');
const router = express.Router();
const advancedShippingController = require('../controllers/advancedShippingController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Advanced Shipping
 *   description: Advanced shipping features including address validation, white-glove delivery, and route optimization
 */

// Public endpoints
/**
 * @swagger
 * /api/v1/shipping/advanced/address/validate:
 *   post:
 *     summary: Validate address
 *     description: Validate and standardize a shipping address
 *     tags: [Advanced Shipping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Address validated successfully
 *       400:
 *         description: Invalid address
 */
router.post('/address/validate', advancedShippingController.validateAddress);

/**
 * @swagger
 * /api/v1/shipping/advanced/address/autocomplete:
 *   get:
 *     summary: Autocomplete address
 *     description: Get address suggestions as user types
 *     tags: [Advanced Shipping]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Address query string
 *     responses:
 *       200:
 *         description: Address suggestions retrieved successfully
 */
router.get('/address/autocomplete', advancedShippingController.autocompleteAddress);

/**
 * @swagger
 * /api/v1/shipping/advanced/address/detect-pobox:
 *   post:
 *     summary: Detect PO Box
 *     description: Detect if an address is a PO Box
 *     tags: [Advanced Shipping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: PO Box detection result
 */
router.post('/address/detect-pobox', advancedShippingController.detectPOBox);

/**
 * @swagger
 * /api/v1/shipping/advanced/address/detect-type:
 *   post:
 *     summary: Detect address type
 *     description: Detect address type (residential, commercial, etc.)
 *     tags: [Advanced Shipping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: object
 *     responses:
 *       200:
 *         description: Address type detected successfully
 */
router.post('/address/detect-type', advancedShippingController.detectAddressType);

/**
 * @swagger
 * /api/v1/shipping/advanced/pickup-locations:
 *   get:
 *     summary: Get available pickup locations
 *     description: Retrieve list of available pickup locations
 *     tags: [Advanced Shipping]
 *     parameters:
 *       - in: query
 *         name: zipCode
 *         schema:
 *           type: string
 *         description: Filter by zip code
 *     responses:
 *       200:
 *         description: Pickup locations retrieved successfully
 */
router.get('/pickup-locations', advancedShippingController.getAvailablePickupLocations);

// Authenticated endpoints
router.use(auth);

/**
 * @swagger
 * /api/v1/shipping/advanced/white-glove:
 *   post:
 *     summary: Request white-glove delivery
 *     description: Request premium white-glove delivery service
 *     tags: [Advanced Shipping]
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
 *               specialInstructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: White-glove delivery requested successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/white-glove', advancedShippingController.requestWhiteGloveDelivery);

/**
 * @swagger
 * /api/v1/shipping/advanced/signature:
 *   post:
 *     summary: Require signature
 *     description: Require signature on delivery
 *     tags: [Advanced Shipping]
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
 *     responses:
 *       200:
 *         description: Signature requirement added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/signature', advancedShippingController.requireSignature);

/**
 * @swagger
 * /api/v1/shipping/advanced/instructions:
 *   post:
 *     summary: Add delivery instructions
 *     description: Add special delivery instructions for an order
 *     tags: [Advanced Shipping]
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
 *               - instructions
 *             properties:
 *               orderId:
 *                 type: string
 *               instructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery instructions added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/instructions', advancedShippingController.addDeliveryInstructions);

/**
 * @swagger
 * /api/v1/shipping/advanced/insurance:
 *   post:
 *     summary: Add shipping insurance
 *     description: Add insurance coverage to a shipment
 *     tags: [Advanced Shipping]
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
 *               - coverageAmount
 *             properties:
 *               orderId:
 *                 type: string
 *               coverageAmount:
 *                 type: number
 *                 format: decimal
 *     responses:
 *       200:
 *         description: Insurance added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/insurance', advancedShippingController.addShippingInsurance);

/**
 * @swagger
 * /api/v1/shipping/advanced/calculate-dim-weight:
 *   post:
 *     summary: Calculate dimensional weight
 *     description: Calculate dimensional weight for shipping
 *     tags: [Advanced Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - length
 *               - width
 *               - height
 *               - weight
 *             properties:
 *               length:
 *                 type: number
 *               width:
 *                 type: number
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Dimensional weight calculated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/calculate-dim-weight', advancedShippingController.calculateDimensionalWeight);

// Admin endpoints
router.use(admin);

/**
 * @swagger
 * /api/v1/shipping/advanced/pickup-locations:
 *   post:
 *     summary: Create pickup location
 *     description: Create a new pickup location (Admin only)
 *     tags: [Advanced Shipping]
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *               operatingHours:
 *                 type: object
 *     responses:
 *       201:
 *         description: Pickup location created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/pickup-locations', advancedShippingController.createPickupLocation);

/**
 * @swagger
 * /api/v1/shipping/advanced/route/optimize:
 *   post:
 *     summary: Optimize route
 *     description: Optimize delivery routes for multiple orders (Admin only)
 *     tags: [Advanced Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Route optimized successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/route/optimize', advancedShippingController.optimizeRoute);

/**
 * @swagger
 * /api/v1/shipping/advanced/packaging/optimize:
 *   post:
 *     summary: Optimize packaging
 *     description: Optimize packaging for an order to reduce shipping costs (Admin only)
 *     tags: [Advanced Shipping]
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
 *     responses:
 *       200:
 *         description: Packaging optimized successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/packaging/optimize', advancedShippingController.optimizePackaging);

module.exports = router;


