const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/gateways', paymentController.getGateways);

// Protected routes
router.use(auth);
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/confirm', paymentController.confirmPayment);
router.get('/:orderId', paymentController.getPaymentStatus);
router.get('/:orderId/history', paymentController.getPaymentHistory);

module.exports = router;


