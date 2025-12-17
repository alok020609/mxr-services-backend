const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/points', loyaltyController.getPoints);
router.get('/tiers', loyaltyController.getTiers);
router.get('/rewards', loyaltyController.getRewards);
router.post('/rewards/redeem', loyaltyController.redeemReward);
router.get('/referral', loyaltyController.getReferralCode);
router.post('/referral/apply', loyaltyController.applyReferralCode);

module.exports = router;


