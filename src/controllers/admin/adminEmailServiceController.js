const { asyncHandler } = require('../../utils/asyncHandler');
const { AdminEmailServiceService } = require('../../services/adminEmailServiceService');

// Create email service
const createEmailService = asyncHandler(async (req, res) => {
  const { name, type, config, isActive, isDefault } = req.body;

  const service = await AdminEmailServiceService.createEmailService({
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
      config: AdminEmailServiceService.maskSensitiveFields(service.config),
    },
  });
});

// Get all email services
const getEmailServices = asyncHandler(async (req, res) => {
  const { isActive, type, page, limit } = req.query;

  const result = await AdminEmailServiceService.getEmailServices({
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

// Get single email service
const getEmailService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await AdminEmailServiceService.getEmailService(id);

  res.json({
    success: true,
    data: service,
  });
});

// Update email service
const updateEmailService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, config, isActive, isDefault } = req.body;

  const service = await AdminEmailServiceService.updateEmailService(id, {
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

// Toggle email service active status
const toggleEmailService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'isActive must be a boolean value',
    });
  }

  const service = await AdminEmailServiceService.toggleEmailService(id, isActive);

  res.json({
    success: true,
    data: service,
    message: `Email service ${isActive ? 'activated' : 'deactivated'} successfully`,
  });
});

// Set default email service
const setDefaultEmailService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await AdminEmailServiceService.setDefaultEmailService(id);

  res.json({
    success: true,
    data: service,
    message: 'Email service set as default successfully',
  });
});

// Delete email service
const deleteEmailService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await AdminEmailServiceService.deleteEmailService(id);

  res.json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  createEmailService,
  getEmailServices,
  getEmailService,
  updateEmailService,
  toggleEmailService,
  setDefaultEmailService,
  deleteEmailService,
};
