const express = require('express');
const router = express.Router();
const advancedProductController = require('../controllers/advancedProductController');
const { auth } = require('../middleware/auth');

// Digital Products
router.get('/digital/:productId', advancedProductController.getDigitalProduct);
router.get('/digital/:productId/download/:orderId', auth, advancedProductController.downloadDigitalProduct);

// Subscriptions
router.use(auth);
router.get('/subscriptions', advancedProductController.getSubscriptions);
router.post('/subscriptions', advancedProductController.createSubscription);

// Pre-Orders
router.post('/pre-orders', advancedProductController.createPreOrder);
router.get('/pre-orders', advancedProductController.getPreOrders);

// Gift Cards
router.get('/gift-cards', advancedProductController.getGiftCards);
router.post('/gift-cards/purchase', advancedProductController.purchaseGiftCard);
router.post('/gift-cards/redeem', advancedProductController.redeemGiftCard);

module.exports = router;


