const express = require('express');
const router = express.Router();
const productManagementController = require('../controllers/productManagementController');
const { auth, admin } = require('../middleware/auth');

// Public routes
router.get('/featured', productManagementController.getFeaturedProducts);
router.get('/collections', productManagementController.getProductCollections);

// Admin routes
router.use(auth, admin);
router.get('/:productId/specifications', productManagementController.getProductSpecifications);
router.put('/:productId/specifications', productManagementController.updateProductSpecifications);
router.put('/featured', productManagementController.setFeaturedProducts);

module.exports = router;


