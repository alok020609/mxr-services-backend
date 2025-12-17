const { APIDeprecationService } = require('../services/apiDeprecationService');
const { asyncHandler } = require('../utils/asyncHandler');

const getVersioningStrategy = asyncHandler(async (req, res) => {
  const strategy = APIDeprecationService.getVersioningStrategy();

  res.json({
    success: true,
    data: strategy,
  });
});

const getDeprecationPolicy = asyncHandler(async (req, res) => {
  const policy = APIDeprecationService.getDeprecationPolicy();

  res.json({
    success: true,
    data: policy,
  });
});

const createDeprecationNotice = asyncHandler(async (req, res) => {
  const { endpoint, version, replacement, deprecationDate, sunsetDate } = req.body;

  const notice = await APIDeprecationService.createDeprecationNotice(
    endpoint,
    version,
    replacement,
    deprecationDate,
    sunsetDate
  );

  res.status(201).json({
    success: true,
    data: notice,
  });
});

const getDeprecationNotices = asyncHandler(async (req, res) => {
  const { version } = req.query;

  const notices = await APIDeprecationService.getDeprecationNotices(version);

  res.json({
    success: true,
    data: notices,
  });
});

const getVersionLifecycle = asyncHandler(async (req, res) => {
  const { version } = req.params;

  const lifecycle = await APIDeprecationService.getVersionLifecycle(version);

  res.json({
    success: true,
    data: lifecycle,
  });
});

const getCompatibilityGuarantees = asyncHandler(async (req, res) => {
  const guarantees = APIDeprecationService.getCompatibilityGuarantees();

  res.json({
    success: true,
    data: guarantees,
  });
});

module.exports = {
  getVersioningStrategy,
  getDeprecationPolicy,
  createDeprecationNotice,
  getDeprecationNotices,
  getVersionLifecycle,
  getCompatibilityGuarantees,
};


