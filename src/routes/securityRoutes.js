const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { auth } = require('../middleware/auth');

router.use(auth);

// 2FA/MFA
router.post('/2fa/setup', securityController.setup2FA);
router.post('/2fa/verify', securityController.verify2FA);
router.post('/2fa/disable', securityController.disable2FA);

// Device Management
router.get('/devices', securityController.getDevices);
router.delete('/devices/:id', securityController.removeDevice);

// Session Management
router.get('/sessions', securityController.getSessions);
router.delete('/sessions/:id', securityController.revokeSession);
router.delete('/sessions', securityController.revokeAllSessions);

// Login Attempts
router.get('/login-attempts', securityController.getLoginAttempts);

// API Keys
router.get('/api-keys', securityController.getAPIKeys);
router.post('/api-keys', securityController.createAPIKey);
router.delete('/api-keys/:id', securityController.revokeAPIKey);

module.exports = router;


