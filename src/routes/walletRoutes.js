const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', walletController.getWallet);
router.post('/add', walletController.addToWallet);
router.get('/store-credits', walletController.getStoreCredits);
router.get('/invoices', walletController.getInvoices);
router.get('/invoices/:id', walletController.getInvoice);
router.get('/invoices/:id/download', walletController.downloadInvoice);

module.exports = router;


