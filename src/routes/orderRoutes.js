const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.requestReturn);
router.get('/:id/tracking', orderController.getOrderTracking);

module.exports = router;


