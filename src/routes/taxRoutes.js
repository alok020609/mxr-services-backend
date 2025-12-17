const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');

router.post('/calculate', taxController.calculateTax);
router.get('/rates', taxController.getTaxRates);

module.exports = router;


