const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');

/**
 * @swagger
 * tags:
 *   name: Tax
 *   description: Tax calculation endpoints
 */

/**
 * @swagger
 * /api/v1/tax/calculate:
 *   post:
 *     summary: Calculate tax for order
 *     description: Calculate tax amount for items based on shipping address
 *     tags: [Tax]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - items
 *               - subtotal
 *             properties:
 *               address:
 *                 type: object
 *                 required:
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
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
 *                     - price
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *               subtotal:
 *                 type: number
 *                 format: decimal
 *     responses:
 *       200:
 *         description: Tax calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tax:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                     rate:
 *                       type: number
 *                     breakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           rate:
 *                             type: number
 *                           amount:
 *                             type: number
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
router.post('/calculate', taxController.calculateTax);

/**
 * @swagger
 * /api/v1/tax/rates:
 *   get:
 *     summary: Get tax rates
 *     description: Retrieve tax rates for a specific location
 *     tags: [Tax]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State code
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country code
 *     responses:
 *       200:
 *         description: Tax rates retrieved successfully
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
 *                     $ref: '#/components/schemas/TaxRate'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/rates', taxController.getTaxRates);

module.exports = router;


