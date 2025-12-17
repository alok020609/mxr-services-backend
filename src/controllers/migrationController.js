const { MigrationService } = require('../services/migrationService');
const { asyncHandler } = require('../utils/asyncHandler');

const executeMigration = asyncHandler(async (req, res) => {
  const { migrationName, upFunction, downFunction } = req.body;

  const result = await MigrationService.executeMigration(migrationName, upFunction, downFunction);

  res.json({
    success: true,
    data: result,
  });
});

const executeZeroDowntimeMigration = asyncHandler(async (req, res) => {
  const { migrationName, migrationSteps } = req.body;

  await MigrationService.executeZeroDowntimeMigration(migrationName, migrationSteps);

  res.json({
    success: true,
    message: 'Zero-downtime migration completed',
  });
});

const rollbackMigration = asyncHandler(async (req, res) => {
  const { migrationId } = req.params;

  const result = await MigrationService.rollbackMigration(migrationId);

  res.json({
    success: true,
    data: result,
  });
});

const gradualRollout = asyncHandler(async (req, res) => {
  const { featureKey, percentages, intervalMs } = req.body;

  await MigrationService.gradualRollout(featureKey, percentages, intervalMs);

  res.json({
    success: true,
    message: 'Gradual rollout completed',
  });
});

const checkBackwardCompatibility = asyncHandler(async (req, res) => {
  const { oldVersion, newVersion } = req.body;

  const result = await MigrationService.checkBackwardCompatibility(oldVersion, newVersion);

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  executeMigration,
  executeZeroDowntimeMigration,
  rollbackMigration,
  gradualRollout,
  checkBackwardCompatibility,
};


