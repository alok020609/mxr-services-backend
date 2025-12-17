const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/clv/:userId', analyticsController.calculateCLV);
router.get('/cohort', analyticsController.getCohortAnalysis);
router.get('/funnel', analyticsController.getFunnelAnalysis);
router.get('/segments', analyticsController.getCustomerSegments);

module.exports = router;


