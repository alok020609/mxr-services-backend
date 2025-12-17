const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/', couponController.getCoupons);
router.get('/:code', couponController.getCoupon);
router.post('/validate', couponController.validateCoupon);

// Protected routes
router.use(auth);
router.get('/my-coupons', couponController.getMyCoupons);

module.exports = router;


