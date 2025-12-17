const express = require('express');
const router = express.Router();
const socialCommerceController = require('../controllers/socialCommerceController');
const { auth, admin } = require('../middleware/auth');

// Public routes
router.get('/ugc', socialCommerceController.getUserGeneratedContent);

// Authenticated routes
router.use(auth);
router.post('/login', socialCommerceController.socialLogin);
router.post('/products/:productId/share', socialCommerceController.shareProduct);
router.post('/ugc', socialCommerceController.submitUserGeneratedContent);

// Admin routes
router.use(admin);
router.get('/influencers', socialCommerceController.getInfluencerTracking);

module.exports = router;


