const { DisasterRecoveryService } = require('../services/disasterRecoveryService');
const { asyncHandler } = require('../utils/asyncHandler');

const getRPORTODefinitions = asyncHandler(async (req, res) => {
  const definitions = DisasterRecoveryService.getRPORTODefinitions();

  res.json({
    success: true,
    data: definitions,
  });
});

const createBackup = asyncHandler(async (req, res) => {
  const { type, metadata } = req.body;

  const backup = await DisasterRecoveryService.createBackup(type, metadata);

  res.status(201).json({
    success: true,
    data: backup,
  });
});

const scheduleBackups = asyncHandler(async (req, res) => {
  const schedule = await DisasterRecoveryService.scheduleBackups();

  res.json({
    success: true,
    data: schedule,
  });
});

const restoreBackup = asyncHandler(async (req, res) => {
  const { backupId } = req.params;
  const { targetEnvironment } = req.body;

  const restore = await DisasterRecoveryService.restoreBackup(backupId, targetEnvironment);

  res.json({
    success: true,
    data: restore,
  });
});

const performRestoreDrill = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const result = await DisasterRecoveryService.performRestoreDrill(type || 'monthly');

  res.json({
    success: true,
    data: result,
  });
});

const handleRegionFailure = asyncHandler(async (req, res) => {
  const { failedRegion, failoverRegion } = req.body;

  const failover = await DisasterRecoveryService.handleRegionFailure(failedRegion, failoverRegion);

  res.json({
    success: true,
    data: failover,
  });
});

const getDRPlan = asyncHandler(async (req, res) => {
  const plan = DisasterRecoveryService.getDRPlan();

  res.json({
    success: true,
    data: plan,
  });
});

module.exports = {
  getRPORTODefinitions,
  createBackup,
  scheduleBackups,
  restoreBackup,
  performRestoreDrill,
  handleRegionFailure,
  getDRPlan,
};


