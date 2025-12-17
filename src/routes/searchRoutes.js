const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/advanced', searchController.advancedSearch);
router.get('/recommendations', searchController.getRecommendations);

// Protected routes
router.use(auth);
router.get('/recently-viewed', searchController.getRecentlyViewed);
router.post('/saved', searchController.saveSearch);
router.get('/saved', searchController.getSavedSearches);
router.delete('/saved/:id', searchController.deleteSavedSearch);

module.exports = router;


