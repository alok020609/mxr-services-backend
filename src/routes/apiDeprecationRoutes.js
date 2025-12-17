const express = require('express');
const router = express.Router();
const apiDeprecationController = require('../controllers/apiDeprecationController');
const { auth, admin } = require('../middleware/auth');

// Public endpoints
router.get('/versioning-strategy', apiDeprecationController.getVersioningStrategy);
router.get('/deprecation-policy', apiDeprecationController.getDeprecationPolicy);
router.get('/notices', apiDeprecationController.getDeprecationNotices);
router.get('/versions/:version/lifecycle', apiDeprecationController.getVersionLifecycle);
router.get('/compatibility-guarantees', apiDeprecationController.getCompatibilityGuarantees);

// Admin endpoints
router.use(auth, admin);
router.post('/notices', apiDeprecationController.createDeprecationNotice);

module.exports = router;


