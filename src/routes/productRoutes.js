const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, admin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/categories/:id', productController.getCategory);
router.get('/:id', productController.getProduct);

// Admin routes
router.use(auth, admin);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/categories', productController.createCategory);
router.put('/categories/:id', productController.updateCategory);
router.delete('/categories/:id', productController.deleteCategory);

module.exports = router;


