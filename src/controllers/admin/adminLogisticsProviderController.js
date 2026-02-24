const { asyncHandler } = require('../../utils/asyncHandler');
const AdminLogisticsProviderService = require('../../services/adminLogisticsProviderService');

/**
 * Create a new logistics provider
 */
const createLogisticsProvider = asyncHandler(async (req, res) => {
  const provider = await AdminLogisticsProviderService.createLogisticsProvider(req.body);
  res.status(201).json({
    success: true,
    data: provider,
    message: 'Logistics provider created successfully',
  });
});

/**
 * Get all logistics providers
 */
const getLogisticsProviders = asyncHandler(async (req, res) => {
  const { isActive, type, page, limit } = req.query;
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const result = await AdminLogisticsProviderService.getLogisticsProviders(
    {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      type,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    },
    baseUrl
  );

  res.json({
    success: true,
    data: result.providers,
    pagination: result.pagination,
  });
});

/**
 * Get single logistics provider
 */
const getLogisticsProvider = asyncHandler(async (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const provider = await AdminLogisticsProviderService.getLogisticsProvider(req.params.id, baseUrl);
  res.json({
    success: true,
    data: provider,
  });
});

/**
 * Update logistics provider
 */
const updateLogisticsProvider = asyncHandler(async (req, res) => {
  const provider = await AdminLogisticsProviderService.updateLogisticsProvider(
    req.params.id,
    req.body
  );
  res.json({
    success: true,
    data: provider,
    message: 'Logistics provider updated successfully',
  });
});

/**
 * Toggle logistics provider active status
 */
const toggleLogisticsProvider = asyncHandler(async (req, res) => {
  const provider = await AdminLogisticsProviderService.toggleLogisticsProvider(req.params.id);
  res.json({
    success: true,
    data: provider,
    message: `Logistics provider ${provider.isActive ? 'activated' : 'deactivated'} successfully`,
  });
});

/**
 * Set default logistics provider
 */
const setDefaultLogisticsProvider = asyncHandler(async (req, res) => {
  const provider = await AdminLogisticsProviderService.setDefaultLogisticsProvider(req.params.id);
  res.json({
    success: true,
    data: provider,
    message: 'Default logistics provider set successfully',
  });
});

/**
 * Delete logistics provider
 */
const deleteLogisticsProvider = asyncHandler(async (req, res) => {
  await AdminLogisticsProviderService.deleteLogisticsProvider(req.params.id);
  res.json({
    success: true,
    message: 'Logistics provider deleted successfully',
  });
});

module.exports = {
  createLogisticsProvider,
  getLogisticsProviders,
  getLogisticsProvider,
  updateLogisticsProvider,
  toggleLogisticsProvider,
  setDefaultLogisticsProvider,
  deleteLogisticsProvider,
};
