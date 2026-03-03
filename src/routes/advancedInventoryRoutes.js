const express = require('express');
const router = express.Router();
const advancedInventoryController = require('../controllers/advancedInventoryController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Advanced Inventory
 *   description: Advanced inventory management features (Admin only)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/inventory/advanced/{productId}/reorder-point:
 *   post:
 *     summary: Calculate reorder point
 *     description: Calculate optimal reorder point for a product (Admin only)
 *     tags: [Advanced Inventory]
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
 *         description: Reorder point calculated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/:productId/reorder-point', advancedInventoryController.calculateReorderPoint);

/**
 * @swagger
 * /api/v1/inventory/advanced/transfer:
 *   post:
 *     summary: Transfer stock
 *     description: Transfer stock between locations or warehouses (Admin only)
 *     tags: [Advanced Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - fromLocation
 *               - toLocation
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               fromLocation:
 *                 type: string
 *               toLocation:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock transferred successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/transfer', advancedInventoryController.transferStock);

/**
 * @swagger
 * /api/v1/inventory/advanced/cycle-count:
 *   post:
 *     summary: Record cycle count
 *     description: Record physical inventory count for cycle counting (Admin only)
 *     tags: [Advanced Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - countedQuantity
 *             properties:
 *               productId:
 *                 type: string
 *               countedQuantity:
 *                 type: integer
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cycle count recorded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/cycle-count', advancedInventoryController.recordCycleCount);

/**
 * @swagger
 * /api/v1/inventory/advanced/aging-report:
 *   get:
 *     summary: Get inventory aging report
 *     description: Retrieve inventory aging analysis report (Admin only)
 *     tags: [Advanced Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aging report retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/aging-report', advancedInventoryController.getInventoryAgingReport);

/**
 * @swagger
 * /api/v1/inventory/advanced/shrinkage:
 *   post:
 *     summary: Record inventory shrinkage
 *     description: Record inventory loss due to theft, damage, or other reasons (Admin only)
 *     tags: [Advanced Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 enum: [THEFT, DAMAGE, EXPIRATION, OTHER]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shrinkage recorded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/shrinkage', advancedInventoryController.recordShrinkage);

module.exports = router;


