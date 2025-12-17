const { MultiTenantService } = require('../services/multiTenantService');
const { asyncHandler } = require('../utils/asyncHandler');

const createTenant = asyncHandler(async (req, res) => {
  const tenant = await MultiTenantService.createTenant(req.body);

  res.status(201).json({
    success: true,
    data: tenant,
  });
});

const getTenant = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;

  const tenant = await MultiTenantService.getTenant(tenantId);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      error: 'Tenant not found',
    });
  }

  res.json({
    success: true,
    data: tenant,
  });
});

const updateTenant = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;

  const tenant = await MultiTenantService.updateTenant(tenantId, req.body);

  res.json({
    success: true,
    data: tenant,
  });
});

const listTenants = asyncHandler(async (req, res) => {
  const result = await MultiTenantService.listTenants(req.query);

  res.json({
    success: true,
    data: result,
  });
});

const getTenantStats = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;

  const stats = await MultiTenantService.getTenantStats(tenantId);

  res.json({
    success: true,
    data: stats,
  });
});

module.exports = {
  createTenant,
  getTenant,
  updateTenant,
  listTenants,
  getTenantStats,
};


