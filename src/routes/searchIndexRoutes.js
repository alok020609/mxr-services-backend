const express = require('express');
const router = express.Router();
const searchIndexController = require('../controllers/searchIndexController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Search Index
 *   description: Search indexing and management endpoints
 */

// Public search
/**
 * @swagger
 * /api/v1/search-index/search:
 *   get:
 *     summary: Search indexed products
 *     description: Search products using the search index
 *     tags: [Search Index]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', searchIndexController.search);

// Admin indexing operations
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/search-index/index/{productId}:
 *   post:
 *     summary: Index product
 *     description: Index a single product in the search index (Admin only)
 *     tags: [Search Index]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product indexed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/index/:productId', searchIndexController.indexProduct);

/**
 * @swagger
 * /api/v1/search-index/index/batch:
 *   post:
 *     summary: Batch index products
 *     description: Index multiple products in batch (Admin only)
 *     tags: [Search Index]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Products indexed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/index/batch', searchIndexController.batchIndexProducts);

/**
 * @swagger
 * /api/v1/search-index/reindex/all:
 *   post:
 *     summary: Reindex all products
 *     description: Reindex all products in the search index (Admin only)
 *     tags: [Search Index]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reindexing started successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/reindex/all', searchIndexController.reindexAll);

/**
 * @swagger
 * /api/v1/search-index/reindex/category/{categoryId}:
 *   post:
 *     summary: Reindex category
 *     description: Reindex all products in a category (Admin only)
 *     tags: [Search Index]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category reindexed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.post('/reindex/category/:categoryId', searchIndexController.reindexCategory);

module.exports = router;


