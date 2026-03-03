const express = require('express');
const router = express.Router();
const orderEnhancementController = require('../controllers/orderEnhancementController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Order Enhancements
 *   description: Order enhancement features including notes, scheduled delivery, and splits
 */

router.use(auth);

/**
 * @swagger
 * /api/v1/order-enhancements/notes:
 *   post:
 *     summary: Add order note
 *     description: Add a note to an order
 *     tags: [Order Enhancements]
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
 *               - note
 *             properties:
 *               orderId:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/notes', orderEnhancementController.addOrderNote);

/**
 * @swagger
 * /api/v1/order-enhancements/{orderId}/notes:
 *   get:
 *     summary: Get order notes
 *     description: Retrieve all notes for an order
 *     tags: [Order Enhancements]
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
 *         description: Order notes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:orderId/notes', orderEnhancementController.getOrderNotes);

/**
 * @swagger
 * /api/v1/order-enhancements/schedule-delivery:
 *   post:
 *     summary: Schedule delivery
 *     description: Schedule a specific delivery date and time for an order
 *     tags: [Order Enhancements]
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
 *               - deliveryDate
 *             properties:
 *               orderId:
 *                 type: string
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *               timeSlot:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery scheduled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/schedule-delivery', orderEnhancementController.scheduleDelivery);

/**
 * @swagger
 * /api/v1/order-enhancements/{orderId}/splits:
 *   get:
 *     summary: Get order splits
 *     description: Retrieve order split information (multiple shipments)
 *     tags: [Order Enhancements]
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
 *         description: Order splits retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:orderId/splits', orderEnhancementController.getOrderSplits);

module.exports = router;


