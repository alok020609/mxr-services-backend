const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const { auth, admin } = require('../middleware/auth');

router.get('/', currencyController.getCurrencies);
router.get('/:code', currencyController.getCurrency);
router.get('/convert', currencyController.convertCurrency);

// Admin routes
router.use(auth, admin);
router.put('/rates', currencyController.updateExchangeRates);

module.exports = router;


