const express = require('express');
const router = express.Router();
const advancedInventoryController = require('../controllers/advancedInventoryController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.post('/:productId/reorder-point', advancedInventoryController.calculateReorderPoint);
router.post('/transfer', advancedInventoryController.transferStock);
router.post('/cycle-count', advancedInventoryController.recordCycleCount);
router.get('/aging-report', advancedInventoryController.getInventoryAgingReport);
router.post('/shrinkage', advancedInventoryController.recordShrinkage);

module.exports = router;


