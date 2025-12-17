const express = require('express');
const router = express.Router();
const observabilityController = require('../controllers/observabilityController');
const { auth, admin } = require('../middleware/auth');

// Public endpoints
router.get('/sla', observabilityController.getSLADefinitions);
router.get('/slo', observabilityController.getSLODefinitions);
router.get('/slo/:service/status', observabilityController.getSLOStatus);
router.get('/alerts/thresholds', observabilityController.getAlertThresholds);
router.get('/alerts/:service/check', observabilityController.checkAlertConditions);
router.get('/slo/:service/report', observabilityController.generateSLOReport);

module.exports = router;


