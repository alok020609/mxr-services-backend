const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrationsController');
const { auth, admin } = require('../middleware/auth');

// Authenticated endpoints
router.use(auth);
router.post('/sms', integrationsController.sendSMS);
router.post('/marketing/list', integrationsController.addToMarketingList);
router.post('/analytics/track', integrationsController.trackAnalyticsEvent);
router.post('/social/post', integrationsController.postToSocialMedia);

// Admin endpoints
router.use(admin);
router.post('/crm/sync', integrationsController.syncToCRM);
router.post('/erp/sync', integrationsController.syncToERP);
router.post('/wms/sync', integrationsController.syncToWMS);
router.post('/webhooks', integrationsController.createWebhook);
router.post('/webhooks/trigger', integrationsController.triggerWebhook);

module.exports = router;


