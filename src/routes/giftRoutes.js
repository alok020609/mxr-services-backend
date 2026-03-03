const express = require('express');
const router = express.Router();
const giftController = require('../controllers/giftController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Gifts
 *   description: Gift registry and gifting features
 */

router.use(auth);

/**
 * @swagger
 * /api/v1/gifts/registry:
 *   post:
 *     summary: Create gift registry
 *     description: Create a new gift registry for events like weddings, birthdays, etc.
 *     tags: [Gifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [WEDDING, BIRTHDAY, BABY_SHOWER, ANNIVERSARY, OTHER]
 *                 description: Registry type
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *                 description: Event date
 *               name:
 *                 type: string
 *                 description: Registry name
 *     responses:
 *       201:
 *         description: Gift registry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registry:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *                     shareUrl:
 *                       type: string
 *                       format: uri
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
router.post('/registry', giftController.createGiftRegistry);

/**
 * @swagger
 * /api/v1/gifts/registry:
 *   get:
 *     summary: Get gift registries
 *     description: Retrieve all gift registries for the authenticated user
 *     tags: [Gifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gift registries retrieved successfully
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
router.get('/registry', giftController.getGiftRegistries);

/**
 * @swagger
 * /api/v1/gifts/registry/items:
 *   post:
 *     summary: Add item to gift registry
 *     description: Add a product to a gift registry
 *     tags: [Gifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registryId
 *               - productId
 *             properties:
 *               registryId:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *               priority:
 *                 type: string
 *                 enum: [HIGH, MEDIUM, LOW]
 *     responses:
 *       201:
 *         description: Item added to registry successfully
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
 *       404:
 *         description: Registry or product not found
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
router.post('/registry/items', giftController.addToGiftRegistry);

/**
 * @swagger
 * /api/v1/gifts/send:
 *   post:
 *     summary: Send order as gift
 *     description: Mark an order as a gift and add gift options
 *     tags: [Gifts]
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
 *             properties:
 *               orderId:
 *                 type: string
 *               giftMessage:
 *                 type: string
 *                 description: Gift message
 *               giftWrap:
 *                 type: boolean
 *                 description: Include gift wrap
 *               recipientName:
 *                 type: string
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Gift options added successfully
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
 *                   example: "Gift options added successfully"
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
 *       404:
 *         description: Order not found
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
router.post('/send', giftController.sendAsGift);

/**
 * @swagger
 * /api/v1/gifts/schedule:
 *   post:
 *     summary: Schedule gift delivery
 *     description: Schedule a gift to be delivered on a specific date
 *     tags: [Gifts]
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
 *                 description: Scheduled delivery date
 *     responses:
 *       200:
 *         description: Gift scheduled successfully
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
 *                   example: "Gift scheduled successfully"
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
 *       404:
 *         description: Order not found
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
router.post('/schedule', giftController.scheduleGift);

/**
 * @swagger
 * /api/v1/gifts/track/{trackingNumber}:
 *   get:
 *     summary: Track gift
 *     description: Track a gift order using tracking number
 *     tags: [Gifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Gift tracking number
 *     responses:
 *       200:
 *         description: Gift tracking information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tracking'
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Gift not found
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
router.get('/track/:trackingNumber', giftController.trackGift);

module.exports = router;


