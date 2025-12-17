const express = require('express');
const router = express.Router();
const advancedPaymentsController = require('../controllers/advancedPaymentsController');
const { auth, admin } = require('../middleware/auth');

router.use(auth);

// Payment links
router.post('/links', advancedPaymentsController.createPaymentLink);

// Saved payment methods
router.post('/methods', advancedPaymentsController.savePaymentMethod);
router.get('/methods', advancedPaymentsController.getSavedPaymentMethods);

// Payment routing
router.post('/route', advancedPaymentsController.routePayment);

// Payment retry
router.post('/:paymentId/retry', advancedPaymentsController.retryPayment);

// Split payments
router.post('/split', advancedPaymentsController.splitPayment);

// Admin endpoints
router.use(admin);
router.get('/reconcile', advancedPaymentsController.reconcilePayments);
router.post('/:paymentId/chargeback', advancedPaymentsController.recordChargeback);

module.exports = router;


