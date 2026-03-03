const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency management and conversion endpoints
 */

/**
 * @swagger
 * /api/v1/currencies:
 *   get:
 *     summary: Get available currencies
 *     description: Retrieve list of available currencies with exchange rates
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: Currencies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: USD
 *                       name:
 *                         type: string
 *                         example: US Dollar
 *                       symbol:
 *                         type: string
 *                         example: $
 *                       rate:
 *                         type: number
 *                       isDefault:
 *                         type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', currencyController.getCurrencies);

/**
 * @swagger
 * /api/v1/currencies/default:
 *   get:
 *     summary: Get default currency
 *     description: Retrieve the store default currency (isDefault true, active)
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: Default currency retrieved successfully
 *       404:
 *         description: Default currency not found
 *       500:
 *         description: Internal server error
 */
router.get('/default', currencyController.getDefaultCurrency);

/**
 * @swagger
 * /api/v1/currencies/convert:
 *   get:
 *     summary: Convert currency amount
 *     description: Convert an amount from one currency to another
 *     tags: [Currency]
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Amount to convert
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Source currency code
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Target currency code
 *     responses:
 *       200:
 *         description: Currency converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                 from:
 *                   type: string
 *                 to:
 *                   type: string
 *                 convertedAmount:
 *                   type: number
 *                 rate:
 *                   type: number
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
router.get('/convert', currencyController.convertCurrency);

/**
 * @swagger
 * /api/v1/currencies/{code}:
 *   get:
 *     summary: Get currency by code
 *     description: Retrieve details for a specific currency
 *     tags: [Currency]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Currency code (e.g., USD, EUR)
 *     responses:
 *       200:
 *         description: Currency retrieved successfully
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
 *       404:
 *         description: Currency not found
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
router.get('/:code', currencyController.getCurrency);

// Admin routes
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/currencies/rates:
 *   put:
 *     summary: Update exchange rates
 *     description: Update currency exchange rates (Admin only)
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rates:
 *                 type: object
 *                 description: Currency code to rate mapping
 *                 additionalProperties:
 *                   type: number
 *     responses:
 *       200:
 *         description: Exchange rates updated successfully
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
 *                   example: "Exchange rates updated successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
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
router.put('/rates', currencyController.updateExchangeRates);

module.exports = router;


