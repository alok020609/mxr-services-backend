const express = require('express');
const router = express.Router();
const advancedShippingController = require('../controllers/advancedShippingController');
const { auth, admin } = require('../middleware/auth');

// Public endpoints
router.post('/address/validate', advancedShippingController.validateAddress);
router.get('/address/autocomplete', advancedShippingController.autocompleteAddress);
router.post('/address/detect-pobox', advancedShippingController.detectPOBox);
router.post('/address/detect-type', advancedShippingController.detectAddressType);
router.get('/pickup-locations', advancedShippingController.getAvailablePickupLocations);

// Authenticated endpoints
router.use(auth);
router.post('/white-glove', advancedShippingController.requestWhiteGloveDelivery);
router.post('/signature', advancedShippingController.requireSignature);
router.post('/instructions', advancedShippingController.addDeliveryInstructions);
router.post('/insurance', advancedShippingController.addShippingInsurance);
router.post('/calculate-dim-weight', advancedShippingController.calculateDimensionalWeight);

// Admin endpoints
router.use(admin);
router.post('/pickup-locations', advancedShippingController.createPickupLocation);
router.post('/route/optimize', advancedShippingController.optimizeRoute);
router.post('/packaging/optimize', advancedShippingController.optimizePackaging);

module.exports = router;


