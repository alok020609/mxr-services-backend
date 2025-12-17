const express = require('express');
const router = express.Router();
const customerExperienceController = require('../controllers/customerExperienceController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/products/:productId/questions', customerExperienceController.getProductQuestions);
router.get('/products/:productId/size-guide', customerExperienceController.getSizeGuide);
router.get('/products/:productId/videos', customerExperienceController.getProductVideos);
router.get('/products/:productId/social-proof', customerExperienceController.getSocialProof);

// Protected routes
router.use(auth);
router.post('/products/questions', customerExperienceController.askQuestion);
router.get('/recently-viewed', customerExperienceController.getRecentlyViewed);
router.post('/waitlist', customerExperienceController.addToWaitlist);
router.get('/waitlist', customerExperienceController.getWaitlist);
router.post('/product-alerts', customerExperienceController.createProductAlert);
router.get('/product-alerts', customerExperienceController.getProductAlerts);

module.exports = router;


