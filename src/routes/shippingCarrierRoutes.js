const express = require('express');
const router = express.Router();
const shippingCarrierController = require('../controllers/shippingCarrierController');
const { auth, admin } = require('../middleware/auth');

// Public tracking
router.get('/track/:trackingNumber', shippingCarrierController.trackShipment);

// Authenticated endpoints
router.use(auth);
router.post('/rates', shippingCarrierController.getAllRates);

// Admin endpoints
router.use(admin);
router.post('/labels', shippingCarrierController.createShippingLabel);

module.exports = router;


