const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);

module.exports = router;


