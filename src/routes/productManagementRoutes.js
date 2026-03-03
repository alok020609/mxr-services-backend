const express = require('express');
const router = express.Router();
const productManagementController = require('../controllers/productManagementController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Product Management
 *   description: Advanced product management features
 */

// Public routes
/**
 * @swagger
 * /api/v1/product-management/featured:
 *   get:
 *     summary: Get featured products
 *     description: Retrieve featured products
 *     tags: [Product Management]
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/featured', productManagementController.getFeaturedProducts);

/**
 * @swagger
 * /api/v1/product-management/collections:
 *   get:
 *     summary: Get product collections
 *     description: Retrieve product collections
 *     tags: [Product Management]
 *     responses:
 *       200:
 *         description: Collections retrieved successfully
 */
router.get('/collections', productManagementController.getProductCollections);

// Admin routes
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/product-management/{productId}/specifications:
 *   get:
 *     summary: Get product specifications
 *     description: Retrieve product specifications (Admin only)
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Specifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get('/:productId/specifications', productManagementController.getProductSpecifications);

/**
 * @swagger
 * /api/v1/product-management/{productId}/specifications:
 *   put:
 *     summary: Update product specifications
 *     description: Update product specifications (Admin only)
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specifications:
 *                 type: object
 *                 description: Product specifications
 *     responses:
 *       200:
 *         description: Specifications updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put('/:productId/specifications', productManagementController.updateProductSpecifications);

/**
 * @swagger
 * /api/v1/product-management/featured:
 *   put:
 *     summary: Set featured products
 *     description: Set which products are featured (Admin only)
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of product IDs to feature
 *     responses:
 *       200:
 *         description: Featured products updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/featured', productManagementController.setFeaturedProducts);

module.exports = router;


