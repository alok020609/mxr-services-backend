const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.get('/customers/:userId/360', crmController.getCustomer360);
router.get('/customers/:userId/rfm', crmController.getRFMAnalysis);
router.post('/customers/:userId/tags', crmController.addCustomerTag);
router.post('/customers/:userId/notes', crmController.addCustomerNote);
router.get('/segments', crmController.getCustomerSegments);

module.exports = router;


