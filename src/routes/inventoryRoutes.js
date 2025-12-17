const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth, admin } = require('../middleware/auth');

// Admin routes
router.use(auth, admin);
router.get('/', inventoryController.getInventory);
router.put('/:productId', inventoryController.updateStock);
router.get('/:productId/movements', inventoryController.getMovements);

module.exports = router;


