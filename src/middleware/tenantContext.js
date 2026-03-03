const prisma = require('../config/database');
const logger = require('../utils/logger');

// Tenant context middleware
const tenantContext = async (req, res, next) => {
  // Extract tenant ID from various sources
  let tenantId = null;

  // 1. From subdomain (e.g., tenant1.example.com)
  const hostname = req.get('host') || '';
  const subdomain = hostname.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
    tenantId = subdomain;
  }

  // 2. From header (X-Tenant-ID)
  if (!tenantId) {
    tenantId = req.headers['x-tenant-id'];
  }

  // 3. From JWT token (if user is authenticated)
  if (!tenantId && req.user) {
    tenantId = req.user.tenantId;
  }

  // 4. From query parameter (for testing)
  if (!tenantId) {
    tenantId = req.query.tenantId;
  }

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: 'Tenant ID is required',
    });
  }

  // Verify tenant exists and is active
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant || !tenant.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or inactive tenant',
    });
  }

  // Attach tenant context to request
  req.tenantId = tenantId;
  req.tenant = tenant;

  next();
};

// Admin separation - Admin users are not tenant-scoped
const adminTenantBypass = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    // Admins can access all tenants
    req.tenantId = req.query.tenantId || req.headers['x-tenant-id'] || null;
  }
  next();
};

// Row-level security helper
const applyTenantFilter = (where, tenantId) => {
  if (!tenantId) return where;
  return {
    ...where,
    tenantId,
  };
};

module.exports = {
  tenantContext,
  adminTenantBypass,
  applyTenantFilter,
};


