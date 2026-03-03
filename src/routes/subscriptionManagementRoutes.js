const express = require('express');
const router = express.Router();
const subscriptionManagementController = require('../controllers/subscriptionManagementController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription management endpoints
 */

router.use(auth);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/pause:
 *   post:
 *     summary: Pause subscription
 *     description: Temporarily pause a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription paused successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription paused
 *                 subscription:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: PAUSED
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 */
router.post('/:subscriptionId/pause', subscriptionManagementController.pauseSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/resume:
 *   post:
 *     summary: Resume subscription
 *     description: Resume a paused subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription resumed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 */
router.post('/:subscriptionId/resume', subscriptionManagementController.resumeSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/skip:
 *   post:
 *     summary: Skip next delivery
 *     description: Skip the next scheduled delivery
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Next delivery skipped successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 */
router.post('/:subscriptionId/skip', subscriptionManagementController.skipNextDelivery);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/frequency:
 *   put:
 *     summary: Change subscription frequency
 *     description: Update the delivery frequency of a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - frequency
 *             properties:
 *               frequency:
 *                 type: string
 *                 enum: [WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY]
 *                 description: New delivery frequency
 *     responses:
 *       200:
 *         description: Frequency updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 */
router.put('/:subscriptionId/frequency', subscriptionManagementController.changeFrequency);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/cancel:
 *   post:
 *     summary: Cancel subscription
 *     description: Cancel an active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription cancelled
 *                 subscription:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: CANCELLED
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 */
router.post('/:subscriptionId/cancel', subscriptionManagementController.cancelSubscription);

module.exports = router;


