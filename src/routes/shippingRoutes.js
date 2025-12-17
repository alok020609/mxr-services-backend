const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

router.get('/methods', shippingController.getShippingMethods);
router.post('/calculate', shippingController.calculateShipping);

module.exports = router;


