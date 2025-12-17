const express = require('express');
const router = express.Router();
const apiGatewayController = require('../controllers/apiGatewayController');
const { auth, admin } = require('../middleware/auth');

// Authenticated endpoints
router.use(auth);
router.get('/tier', apiGatewayController.getUserTier);
router.put('/tier', apiGatewayController.setUserTier);
router.get('/usage', apiGatewayController.getAPIUsage);
router.get('/versions/:version', apiGatewayController.getAPIVersionInfo);

// Admin endpoints
router.use(admin);
router.post('/versions/deprecate', apiGatewayController.deprecateAPIVersion);

module.exports = router;


