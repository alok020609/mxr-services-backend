const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { auth, admin } = require('../middleware/auth');

// Public health check
router.get('/health', monitoringController.getSystemHealth);

// Admin metrics
router.use(auth, admin);
router.get('/metrics', monitoringController.getMetrics);

module.exports = router;


