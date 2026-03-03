const express = require('express');
const router = express.Router();
const internationalizationController = require('../controllers/internationalizationController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Internationalization
 *   description: Internationalization and regional features
 */

// Public regional endpoints
/**
 * @swagger
 * /api/v1/i18n/products/{productId}/price:
 *   get:
 *     summary: Get regional price
 *     description: Get product price for a specific region
 *     tags: [Internationalization]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Region code
 *     responses:
 *       200:
 *         description: Regional price retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:productId/price', internationalizationController.getRegionalPrice);

/**
 * @swagger
 * /api/v1/i18n/products/{productId}/availability:
 *   get:
 *     summary: Get regional availability
 *     description: Get product availability for a specific region
 *     tags: [Internationalization]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Region code
 *     responses:
 *       200:
 *         description: Regional availability retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:productId/availability', internationalizationController.getRegionalAvailability);

/**
 * @swagger
 * /api/v1/i18n/payment-methods:
 *   get:
 *     summary: Get regional payment methods
 *     description: Get available payment methods for a region
 *     tags: [Internationalization]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Region code
 *     responses:
 *       200:
 *         description: Regional payment methods retrieved successfully
 */
router.get('/payment-methods', internationalizationController.getRegionalPaymentMethods);

/**
 * @swagger
 * /api/v1/i18n/shipping-carriers:
 *   get:
 *     summary: Get regional shipping carriers
 *     description: Get available shipping carriers for a region
 *     tags: [Internationalization]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Region code
 *     responses:
 *       200:
 *         description: Regional shipping carriers retrieved successfully
 */
router.get('/shipping-carriers', internationalizationController.getRegionalShippingCarriers);

/**
 * @swagger
 * /api/v1/i18n/compliance:
 *   get:
 *     summary: Get regional compliance
 *     description: Get compliance requirements for a region
 *     tags: [Internationalization]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Region code
 *     responses:
 *       200:
 *         description: Regional compliance information retrieved successfully
 */
router.get('/compliance', internationalizationController.getRegionalCompliance);

// Store management (admin)
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/i18n/stores:
 *   get:
 *     summary: Get stores
 *     description: Retrieve list of stores (Admin only)
 *     tags: [Internationalization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stores retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stores', internationalizationController.getStores);

/**
 * @swagger
 * /api/v1/i18n/stores/{storeId}:
 *   get:
 *     summary: Get store
 *     description: Retrieve details of a specific store (Admin only)
 *     tags: [Internationalization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Store not found
 */
router.get('/stores/:storeId', internationalizationController.getStore);

/**
 * @swagger
 * /api/v1/i18n/stores:
 *   post:
 *     summary: Create store
 *     description: Create a new store (Admin only)
 *     tags: [Internationalization]
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
 *               - region
 *             properties:
 *               name:
 *                 type: string
 *               region:
 *                 type: string
 *               currency:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/stores', internationalizationController.createStore);

module.exports = router;


