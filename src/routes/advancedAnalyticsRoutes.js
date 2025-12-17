const express = require('express');
const router = express.Router();
const advancedAnalyticsController = require('../controllers/advancedAnalyticsController');
const { auth, admin } = require('../middleware/auth');

// Public UTM tracking
router.post('/orders/:orderId/utm', advancedAnalyticsController.trackUTM);

// Authenticated user analytics
router.use(auth);
router.get('/users/:userId/churn', advancedAnalyticsController.predictChurn);
router.get('/users/:userId/affinity/:productId', advancedAnalyticsController.predictProductAffinity);
router.get('/users/:userId/next-product', advancedAnalyticsController.getNextBestProduct);
router.get('/users/:userId/attribution', advancedAnalyticsController.getMultiTouchAttribution);

// Admin analytics
router.use(admin);
router.get('/dashboard/realtime', advancedAnalyticsController.getRealTimeDashboard);
router.get('/orders/live', advancedAnalyticsController.getLiveOrders);
router.get('/funnel', advancedAnalyticsController.getConversionFunnel);

module.exports = router;


