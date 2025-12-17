const express = require('express');
const router = express.Router();
const featureFlagController = require('../controllers/featureFlagController');
const { auth, admin } = require('../middleware/auth');

// Public evaluation endpoint
router.get('/:flagKey/evaluate', auth, featureFlagController.evaluateFlag);

// Admin endpoints
router.use(auth, admin);
router.get('/', featureFlagController.getFlags);
router.get('/:flagKey', featureFlagController.getFlag);
router.post('/', featureFlagController.createFlag);
router.put('/:flagKey', featureFlagController.updateFlag);
router.get('/:flagKey/stats', featureFlagController.getUsageStats);
router.post('/:flagKey/rules', featureFlagController.createRule);
router.post('/:flagKey/overrides', featureFlagController.createOverride);

module.exports = router;


