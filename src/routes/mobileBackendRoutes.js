const express = require('express');
const router = express.Router();
const mobileBackendController = require('../controllers/mobileBackendController');
const { auth, admin } = require('../middleware/auth');

// Public endpoints
router.get('/version', mobileBackendController.checkAppVersion);

// Authenticated endpoints
router.use(auth);
router.post('/device/register', mobileBackendController.registerDevice);
router.post('/deep-link', mobileBackendController.createDeepLink);
router.post('/payment', mobileBackendController.processMobilePayment);

// Admin endpoints
router.use(admin);
router.post('/push', mobileBackendController.sendPushNotification);

module.exports = router;


