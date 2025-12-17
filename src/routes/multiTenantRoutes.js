const express = require('express');
const router = express.Router();
const multiTenantController = require('../controllers/multiTenantController');
const { auth, admin } = require('../middleware/auth');

// Admin only endpoints
router.use(auth, admin);

router.post('/', multiTenantController.createTenant);
router.get('/', multiTenantController.listTenants);
router.get('/:tenantId', multiTenantController.getTenant);
router.put('/:tenantId', multiTenantController.updateTenant);
router.get('/:tenantId/stats', multiTenantController.getTenantStats);

module.exports = router;


