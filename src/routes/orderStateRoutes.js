const express = require('express');
const router = express.Router();
const orderStateController = require('../controllers/orderStateController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Order State
 *   description: Order state machine management endpoints (Admin only)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/order-state/{orderId}/transition:
 *   post:
 *     summary: Transition order state
 *     description: Transition an order to a new state using the state machine (Admin only)
 *     tags: [Order State]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetState
 *             properties:
 *               targetState:
 *                 type: string
 *                 enum: [CREATED, PAYMENT_PENDING, PAID, PACKED, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED]
 *     responses:
 *       200:
 *         description: Order state transitioned successfully
 *       400:
 *         description: Bad request (invalid transition)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:orderId/transition', orderStateController.transitionOrder);

/**
 * @swagger
 * /api/v1/order-state/{orderId}/rollback:
 *   post:
 *     summary: Rollback order state
 *     description: Rollback an order to a previous state (Admin only)
 *     tags: [Order State]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetState:
 *                 type: string
 *                 description: Target state (optional, rolls back to previous if not specified)
 *     responses:
 *       200:
 *         description: Order state rolled back successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:orderId/rollback', orderStateController.rollbackOrder);

/**
 * @swagger
 * /api/v1/order-state/{orderId}/history:
 *   get:
 *     summary: Get order state history
 *     description: Retrieve state transition history for an order (Admin only)
 *     tags: [Order State]
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
 *         description: State history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:orderId/history', orderStateController.getStateHistory);

/**
 * @swagger
 * /api/v1/order-state/{orderId}/transitions:
 *   get:
 *     summary: Get available transitions
 *     description: Get available state transitions for an order (Admin only)
 *     tags: [Order State]
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
 *         description: Available transitions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:orderId/transitions', orderStateController.getAvailableTransitions);

module.exports = router;


