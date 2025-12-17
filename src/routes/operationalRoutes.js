const express = require('express');
const router = express.Router();
const operationalController = require('../controllers/operationalController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

// Bulk Operations
router.post('/bulk/products', operationalController.bulkUpdateProducts);
router.post('/bulk/orders', operationalController.bulkUpdateOrders);

// Import/Export Jobs
router.post('/import', operationalController.createImportJob);
router.get('/import', operationalController.getImportJobs);
router.post('/export', operationalController.createExportJob);
router.get('/export', operationalController.getExportJobs);

// Cron Jobs
router.get('/cron', operationalController.getCronJobs);
router.put('/cron/:id', operationalController.updateCronJob);

// Webhooks
router.get('/webhooks', operationalController.getWebhooks);
router.post('/webhooks', operationalController.createWebhook);
router.get('/webhooks/logs', operationalController.getWebhookLogs);

module.exports = router;


