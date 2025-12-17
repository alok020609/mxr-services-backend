const express = require('express');
const router = express.Router();
const orderStateController = require('../controllers/orderStateController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.post('/:orderId/transition', orderStateController.transitionOrder);
router.post('/:orderId/rollback', orderStateController.rollbackOrder);
router.get('/:orderId/history', orderStateController.getStateHistory);
router.get('/:orderId/transitions', orderStateController.getAvailableTransitions);

module.exports = router;


