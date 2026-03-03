const express = require('express');
const router = express.Router();
const adminCurrencyController = require('../../controllers/admin/adminCurrencyController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Currencies
 *   description: Admin endpoints for managing currencies (code, name, symbol, default, active)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/currencies:
 *   get:
 *     summary: List all currencies
 *     description: Retrieve all currencies including inactive. Use ?activeOnly=true to filter to active only - Admin only
 *     tags: [Admin Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: If "true", return only active currencies
 *     responses:
 *       200:
 *         description: Currencies retrieved successfully
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
 *                       code:
 *                         type: string
 *                         example: USD
 *                       name:
 *                         type: string
 *                       symbol:
 *                         type: string
 *                       exchangeRate:
 *                         type: number
 *                       isActive:
 *                         type: boolean
 *                       isDefault:
 *                         type: boolean
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', adminCurrencyController.listCurrencies);

/**
 * @swagger
 * /api/v1/admin/currencies:
 *   post:
 *     summary: Create currency
 *     description: Add a new currency with code, name, symbol, optional rate and default/active - Admin only
 *     tags: [Admin Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - symbol
 *             properties:
 *               code:
 *                 type: string
 *                 example: EUR
 *                 description: 3-letter ISO code (uppercase)
 *               name:
 *                 type: string
 *                 example: Euro
 *               symbol:
 *                 type: string
 *                 example: "€"
 *               exchangeRate:
 *                 type: number
 *                 default: 1
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Currency created successfully
 *       400:
 *         description: Validation error (invalid code, empty name/symbol, invalid rate)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Currency code already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', adminCurrencyController.createCurrency);

/**
 * @swagger
 * /api/v1/admin/currencies/{code}:
 *   get:
 *     summary: Get currency by code
 *     description: Retrieve a single currency - Admin only
 *     tags: [Admin Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Currency code (e.g. USD, EUR)
 *     responses:
 *       200:
 *         description: Currency retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Currency not found
 *       500:
 *         description: Internal server error
 */
router.get('/:code', adminCurrencyController.getCurrency);

/**
 * @swagger
 * /api/v1/admin/currencies/{code}:
 *   put:
 *     summary: Update currency
 *     description: Update name, symbol, exchangeRate, isDefault, isActive - Admin only
 *     tags: [Admin Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               exchangeRate:
 *                 type: number
 *               isDefault:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Currency updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Currency not found
 *       500:
 *         description: Internal server error
 */
router.put('/:code', adminCurrencyController.updateCurrency);

/**
 * @swagger
 * /api/v1/admin/currencies/{code}:
 *   delete:
 *     summary: Deactivate currency
 *     description: Soft-delete by setting isActive to false. Cannot delete the default currency - Admin only
 *     tags: [Admin Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Currency deactivated successfully
 *       400:
 *         description: Cannot delete default currency
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Currency not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:code', adminCurrencyController.deleteCurrency);

module.exports = router;
