const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update/:itemId', cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.get('/calculate', cartController.calculateCart);

module.exports = router;


