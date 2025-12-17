const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

// Public routes
router.get('/pages', cmsController.getCMSPages);
router.get('/pages/:slug', cmsController.getCMSPage);
router.get('/blog', cmsController.getBlogPosts);
router.get('/blog/:slug', cmsController.getBlogPost);
router.get('/banners', cmsController.getBanners);

module.exports = router;


