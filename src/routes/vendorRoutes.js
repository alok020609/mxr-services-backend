const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, vendor } = require('../middleware/auth');

router.use(auth);

router.post('/register', vendorController.registerAsVendor);
router.get('/dashboard', vendor, vendorController.getVendorDashboard);
router.get('/products', vendor, vendorController.getVendorProducts);
router.post('/products', vendor, vendorController.addVendorProduct);
router.get('/payouts', vendor, vendorController.getVendorPayouts);

module.exports = router;


