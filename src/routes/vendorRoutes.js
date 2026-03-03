const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, vendor } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor/marketplace management endpoints
 */

router.use(auth);

/**
 * @swagger
 * /api/v1/vendor/register:
 *   post:
 *     summary: Register as vendor
 *     description: Register to become a vendor on the marketplace
 *     tags: [Vendor]
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
 *               - email
 *               - businessName
 *             properties:
 *               name:
 *                 type: string
 *                 description: Vendor name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Business email
 *               businessName:
 *                 type: string
 *                 description: Legal business name
 *               taxId:
 *                 type: string
 *                 description: Tax identification number
 *               address:
 *                 type: object
 *                 description: Business address
 *     responses:
 *       201:
 *         description: Vendor registration submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: PENDING
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', vendorController.registerAsVendor);

/**
 * @swagger
 * /api/v1/vendor/dashboard:
 *   get:
 *     summary: Get vendor dashboard
 *     description: Retrieve vendor dashboard statistics (Vendor only)
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not a vendor)
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
router.get('/dashboard', vendor, vendorController.getVendorDashboard);

/**
 * @swagger
 * /api/v1/vendor/products:
 *   get:
 *     summary: Get vendor products
 *     description: Retrieve products listed by the vendor (Vendor only)
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Products retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a vendor)
 */
router.get('/products', vendor, vendorController.getVendorProducts);

/**
 * @swagger
 * /api/v1/vendor/products:
 *   post:
 *     summary: Add vendor product
 *     description: Add a new product as a vendor (Vendor only)
 *     tags: [Vendor]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               sku:
 *                 type: string
 *               stockQuantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a vendor)
 */
router.post('/products', vendor, vendorController.addVendorProduct);

/**
 * @swagger
 * /api/v1/vendor/payouts:
 *   get:
 *     summary: Get vendor payouts
 *     description: Retrieve payout history for the vendor (Vendor only)
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payouts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a vendor)
 */
router.get('/payouts', vendor, vendorController.getVendorPayouts);

module.exports = router;


