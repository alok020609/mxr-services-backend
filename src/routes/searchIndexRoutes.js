const express = require('express');
const router = express.Router();
const searchIndexController = require('../controllers/searchIndexController');
const { auth, admin } = require('../middleware/auth');

// Public search
router.get('/search', searchIndexController.search);

// Admin indexing operations
router.use(auth, admin);
router.post('/index/:productId', searchIndexController.indexProduct);
router.post('/index/batch', searchIndexController.batchIndexProducts);
router.post('/reindex/all', searchIndexController.reindexAll);
router.post('/reindex/category/:categoryId', searchIndexController.reindexCategory);

module.exports = router;


