const { asyncHandler } = require('../../utils/asyncHandler');
const { AdminSMSServiceService } = require('../../services/adminSMSServiceService');

// Create SMS service
const createSMSService = asyncHandler(async (req, res) => {
  const { name, type, config, isActive, isDefault } = req.body;

  const service = await AdminSMSServiceService.createSMSService({
    name,
    type,
    config,
    isActive,
    isDefault,
  });

  res.status(201).json({
    success: true,
    data: {
      ...service,
      config: AdminSMSServiceService.maskSensitiveFields(service.config),
    },
  });
});

// Get all SMS services
const getSMSServices = asyncHandler(async (req, res) => {
  const { isActive, type, page, limit } = req.query;

  const result = await AdminSMSServiceService.getSMSServices({
    isActive,
    type,
    page,
    limit,
  });

  res.json({
    success: true,
    data: result.services,
    pagination: result.pagination,
  });
});

// Get single SMS service
const getSMSService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await AdminSMSServiceService.getSMSService(id);

  res.json({
    success: true,
    data: service,
  });
});

// Update SMS service
const updateSMSService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, config, isActive, isDefault } = req.body;

  const service = await AdminSMSServiceService.updateSMSService(id, {
    name,
    config,
    isActive,
    isDefault,
  });

  res.json({
    success: true,
    data: service,
  });
});

// Toggle SMS service active status
const toggleSMSService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'isActive must be a boolean value',
    });
  }

  const service = await AdminSMSServiceService.toggleSMSService(id, isActive);

  res.json({
    success: true,
    data: service,
    message: `SMS service ${isActive ? 'activated' : 'deactivated'} successfully`,
  });
});

// Set default SMS service
const setDefaultSMSService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await AdminSMSServiceService.setDefaultSMSService(id);

  res.json({
    success: true,
    data: service,
    message: 'SMS service set as default successfully',
  });
});

// Delete SMS service
const deleteSMSService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await AdminSMSServiceService.deleteSMSService(id);

  res.json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  createSMSService,
  getSMSServices,
  getSMSService,
  updateSMSService,
  toggleSMSService,
  setDefaultSMSService,
  deleteSMSService,
};
