const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon and discount management endpoints
 */

// Public routes
/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: Get available coupons
 *     description: Retrieve list of available coupons
 *     tags: [Coupons]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Filter by coupon code
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
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
 *                     $ref: '#/components/schemas/Coupon'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', couponController.getCoupons);

/**
 * @swagger
 * /api/v1/coupons/{code}:
 *   get:
 *     summary: Get coupon by code
 *     description: Retrieve coupon details by code
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon code
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *       404:
 *         description: Coupon not found
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
router.get('/:code', couponController.getCoupon);

/**
 * @swagger
 * /api/v1/coupons/validate:
 *   post:
 *     summary: Validate coupon code
 *     description: Validate a coupon code and calculate discount
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - cartTotal
 *             properties:
 *               code:
 *                 type: string
 *                 description: Coupon code to validate
 *               cartTotal:
 *                 type: number
 *                 format: decimal
 *                 description: Cart total amount
 *     responses:
 *       200:
 *         description: Coupon validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 coupon:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     discount:
 *                       type: number
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Coupon not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Coupon expired, minimum purchase not met, or usage limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               expired:
 *                 value:
 *                   success: false
 *                   error: "Coupon has expired"
 *               minPurchase:
 *                 value:
 *                   success: false
 *                   error: "Minimum purchase amount not met"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/validate', couponController.validateCoupon);

// Protected routes
router.use(auth);

/**
 * @swagger
 * /api/v1/coupons/my-coupons:
 *   get:
 *     summary: Get user's available coupons
 *     description: Retrieve coupons available to the authenticated user
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User coupons retrieved successfully
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
 *                     $ref: '#/components/schemas/Coupon'
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
router.get('/my-coupons', couponController.getMyCoupons);

module.exports = router;


