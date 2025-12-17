const express = require('express');
const router = express.Router();
const customerServiceEnhancedController = require('../controllers/customerServiceEnhancedController');
const { auth } = require('../middleware/auth');

// Public routes (no auth required)
router.post('/track-order', customerServiceEnhancedController.trackOrderWithoutLogin);
router.get('/knowledge-base', customerServiceEnhancedController.getKnowledgeBase);
router.get('/troubleshooting', customerServiceEnhancedController.getTroubleshootingGuides);
router.get('/video-tutorials', customerServiceEnhancedController.getVideoTutorials);

// Authenticated routes
router.use(auth);
router.post('/callback', customerServiceEnhancedController.scheduleCallback);

module.exports = router;


