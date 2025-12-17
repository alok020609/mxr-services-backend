const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.use(auth);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/helpful', reviewController.markHelpful);
router.post('/:id/report', reviewController.reportReview);

module.exports = router;


