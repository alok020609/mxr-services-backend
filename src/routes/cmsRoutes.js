const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Content management system endpoints
 */

// Public routes
/**
 * @swagger
 * /api/v1/cms/pages:
 *   get:
 *     summary: Get CMS pages
 *     description: Retrieve list of CMS pages
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Pages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 */
router.get('/pages', cmsController.getCMSPages);

/**
 * @swagger
 * /api/v1/cms/pages/{slug}:
 *   get:
 *     summary: Get CMS page by slug
 *     description: Retrieve a specific CMS page by its slug
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Page slug
 *     responses:
 *       200:
 *         description: Page retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *       404:
 *         description: Page not found
 */
router.get('/pages/:slug', cmsController.getCMSPage);

/**
 * @swagger
 * /api/v1/cms/blog:
 *   get:
 *     summary: Get blog posts
 *     description: Retrieve paginated list of blog posts
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       excerpt:
 *                         type: string
 *                       publishedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 */
router.get('/blog', cmsController.getBlogPosts);

/**
 * @swagger
 * /api/v1/cms/blog/{slug}:
 *   get:
 *     summary: Get blog post by slug
 *     description: Retrieve a specific blog post by its slug
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post slug
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: Blog post not found
 */
router.get('/blog/:slug', cmsController.getBlogPost);

/**
 * @swagger
 * /api/v1/cms/banners:
 *   get:
 *     summary: Get banners
 *     description: Retrieve active banners for display
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 banners:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       image:
 *                         type: string
 *                       link:
 *                         type: string
 *                       position:
 *                         type: string
 */
router.get('/banners', cmsController.getBanners);

module.exports = router;


