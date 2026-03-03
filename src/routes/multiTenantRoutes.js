const express = require('express');
const router = express.Router();
const multiTenantController = require('../controllers/multiTenantController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Multi-Tenant
 *   description: Multi-tenant management endpoints (Admin only)
 */

// Admin only endpoints
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/tenants:
 *   post:
 *     summary: Create tenant
 *     description: Create a new tenant (Admin only)
 *     tags: [Multi-Tenant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - domain
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', multiTenantController.createTenant);

/**
 * @swagger
 * /api/v1/tenants:
 *   get:
 *     summary: List tenants
 *     description: Retrieve list of all tenants (Admin only)
 *     tags: [Multi-Tenant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', multiTenantController.listTenants);

/**
 * @swagger
 * /api/v1/tenants/{tenantId}:
 *   get:
 *     summary: Get tenant
 *     description: Retrieve details of a specific tenant (Admin only)
 *     tags: [Multi-Tenant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found
 */
router.get('/:tenantId', multiTenantController.getTenant);

/**
 * @swagger
 * /api/v1/tenants/{tenantId}:
 *   put:
 *     summary: Update tenant
 *     description: Update tenant configuration (Admin only)
 *     tags: [Multi-Tenant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               config:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found
 */
router.put('/:tenantId', multiTenantController.updateTenant);

/**
 * @swagger
 * /api/v1/tenants/{tenantId}/stats:
 *   get:
 *     summary: Get tenant stats
 *     description: Retrieve statistics for a tenant (Admin only)
 *     tags: [Multi-Tenant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found
 */
router.get('/:tenantId/stats', multiTenantController.getTenantStats);

module.exports = router;


