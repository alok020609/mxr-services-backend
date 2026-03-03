const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Loyalty
 *   description: Loyalty points and rewards endpoints
 */

router.use(auth);

/**
 * @swagger
 * /api/v1/loyalty/points:
 *   get:
 *     summary: Get user loyalty points
 *     description: Retrieve the user's current loyalty points balance and tier information
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: integer
 *                     tier:
 *                       type: string
 *                     tierName:
 *                       type: string
 *                     nextTier:
 *                       type: string
 *                     pointsToNextTier:
 *                       type: integer
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
router.get('/points', loyaltyController.getPoints);

/**
 * @swagger
 * /api/v1/loyalty/tiers:
 *   get:
 *     summary: Get loyalty tiers
 *     description: Retrieve available loyalty program tiers
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tiers retrieved successfully
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
router.get('/tiers', loyaltyController.getTiers);

/**
 * @swagger
 * /api/v1/loyalty/rewards:
 *   get:
 *     summary: Get available rewards
 *     description: Retrieve list of available rewards for redemption
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rewards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       pointsRequired:
 *                         type: integer
 *                       description:
 *                         type: string
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
router.get('/rewards', loyaltyController.getRewards);

/**
 * @swagger
 * /api/v1/loyalty/rewards/redeem:
 *   post:
 *     summary: Redeem loyalty points
 *     description: Redeem loyalty points for a reward
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *               - rewardId
 *             properties:
 *               points:
 *                 type: integer
 *                 description: Points to redeem
 *               rewardId:
 *                 type: string
 *                 description: Reward ID
 *     responses:
 *       200:
 *         description: Points redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Points redeemed successfully
 *                 redemption:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     points:
 *                       type: integer
 *                     reward:
 *                       type: object
 *       400:
 *         description: Validation error or insufficient points
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 value:
 *                   success: false
 *                   error: "Validation error"
 *               insufficientPoints:
 *                 value:
 *                   success: false
 *                   error: "Insufficient points"
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Reward not found
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
router.post('/rewards/redeem', loyaltyController.redeemReward);

/**
 * @swagger
 * /api/v1/loyalty/referral:
 *   get:
 *     summary: Get referral code
 *     description: Retrieve the user's referral code
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referralCode:
 *                   type: string
 *                 referralLink:
 *                   type: string
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
router.get('/referral', loyaltyController.getReferralCode);

/**
 * @swagger
 * /api/v1/loyalty/referral/apply:
 *   post:
 *     summary: Apply referral code
 *     description: Apply a referral code during registration or checkout
 *     tags: [Loyalty]
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
 *             properties:
 *               code:
 *                 type: string
 *                 description: Referral code to apply
 *     responses:
 *       200:
 *         description: Referral code applied successfully
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
 *                   example: "Referral code applied successfully"
 *       400:
 *         description: Validation error or invalid referral code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 value:
 *                   success: false
 *                   error: "Validation error"
 *               invalidCode:
 *                 value:
 *                   success: false
 *                   error: "Invalid referral code"
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Referral code already used or cannot use own code
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
router.post('/referral/apply', loyaltyController.applyReferralCode);

module.exports = router;


