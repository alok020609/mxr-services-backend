const { ObservabilityService } = require('../services/observabilityService');
const { asyncHandler } = require('../utils/asyncHandler');

const getSLADefinitions = asyncHandler(async (req, res) => {
  const definitions = ObservabilityService.getSLADefinitions();

  res.json({
    success: true,
    data: definitions,
  });
});

const getSLODefinitions = asyncHandler(async (req, res) => {
  const definitions = ObservabilityService.getSLODefinitions();

  res.json({
    success: true,
    data: definitions,
  });
});

const getSLOStatus = asyncHandler(async (req, res) => {
  const { service } = req.params;
  const { startDate, endDate } = req.query;

  const status = await ObservabilityService.getSLOStatus(
    service,
    startDate || new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.json({
    success: true,
    data: status,
  });
});

const getAlertThresholds = asyncHandler(async (req, res) => {
  const thresholds = ObservabilityService.getAlertThresholds();

  res.json({
    success: true,
    data: thresholds,
  });
});

const checkAlertConditions = asyncHandler(async (req, res) => {
  const { service } = req.params;

  const alerts = await ObservabilityService.checkAlertConditions(service);

  res.json({
    success: true,
    data: alerts,
  });
});

const generateSLOReport = asyncHandler(async (req, res) => {
  const { service } = req.params;
  const { period } = req.query;

  const report = await ObservabilityService.generateSLOReport(service, period || 'daily');

  res.json({
    success: true,
    data: report,
  });
});

module.exports = {
  getSLADefinitions,
  getSLODefinitions,
  getSLOStatus,
  getAlertThresholds,
  checkAlertConditions,
  generateSLOReport,
};


