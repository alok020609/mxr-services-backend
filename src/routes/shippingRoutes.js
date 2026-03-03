const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

/**
 * @swagger
 * tags:
 *   name: Shipping
 *   description: Shipping methods and calculation endpoints
 */

/**
 * @swagger
 * /api/v1/shipping/methods:
 *   get:
 *     summary: Get available shipping methods
 *     description: Retrieve list of available shipping methods
 *     tags: [Shipping]
 *     responses:
 *       200:
 *         description: Shipping methods retrieved successfully
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
 *                     $ref: '#/components/schemas/ShippingMethod'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/methods', shippingController.getShippingMethods);

/**
 * @swagger
 * /api/v1/shipping/calculate:
 *   post:
 *     summary: Calculate shipping cost
 *     description: Calculate shipping cost for items to a specific address
 *     tags: [Shipping]
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
 *                 required:
 *                   - city
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     weight:
 *                       type: number
 *     responses:
 *       200:
 *         description: Shipping cost calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 options:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       methodId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       cost:
 *                         type: number
 *                         format: decimal
 *                       estimatedDays:
 *                         type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/calculate', shippingController.calculateShipping);

module.exports = router;


