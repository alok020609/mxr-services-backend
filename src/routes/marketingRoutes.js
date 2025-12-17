const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { auth, admin } = require('../middleware/auth');

// Public routes
router.get('/flash-sales', marketingController.getFlashSales);
router.get('/deals', marketingController.getDeals);
router.get('/bundles', marketingController.getBundles);
router.get('/recommendations', marketingController.getRecommendations);

// Admin routes
router.use(auth, admin);
router.get('/abandoned-carts', marketingController.getAbandonedCarts);

module.exports = router;


