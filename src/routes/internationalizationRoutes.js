const express = require('express');
const router = express.Router();
const internationalizationController = require('../controllers/internationalizationController');
const { auth, admin } = require('../middleware/auth');

// Public regional endpoints
router.get('/products/:productId/price', internationalizationController.getRegionalPrice);
router.get('/products/:productId/availability', internationalizationController.getRegionalAvailability);
router.get('/payment-methods', internationalizationController.getRegionalPaymentMethods);
router.get('/shipping-carriers', internationalizationController.getRegionalShippingCarriers);
router.get('/compliance', internationalizationController.getRegionalCompliance);

// Store management (admin)
router.use(auth, admin);
router.get('/stores', internationalizationController.getStores);
router.get('/stores/:storeId', internationalizationController.getStore);
router.post('/stores', internationalizationController.createStore);

module.exports = router;


