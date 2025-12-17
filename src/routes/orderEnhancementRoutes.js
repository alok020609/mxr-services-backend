const express = require('express');
const router = express.Router();
const orderEnhancementController = require('../controllers/orderEnhancementController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/notes', orderEnhancementController.addOrderNote);
router.get('/:orderId/notes', orderEnhancementController.getOrderNotes);
router.post('/schedule-delivery', orderEnhancementController.scheduleDelivery);
router.get('/:orderId/splits', orderEnhancementController.getOrderSplits);

module.exports = router;


