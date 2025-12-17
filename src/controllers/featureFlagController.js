const { FeatureFlagService } = require('../services/featureFlagService');
const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const evaluateFlag = asyncHandler(async (req, res) => {
  const { flagKey } = req.params;
  const context = {
    userId: req.user?.id,
    ...req.query,
  };

  const result = await FeatureFlagService.evaluate(flagKey, context);

  // Record evaluation
  await FeatureFlagService.recordEvaluation(flagKey, context, result);

  res.json({
    success: true,
    data: {
      flagKey,
      enabled: result,
    },
  });
});

const getFlags = asyncHandler(async (req, res) => {
  const flags = await FeatureFlagService.getAllFlags();

  res.json({
    success: true,
    data: flags,
  });
});

const getFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlagService.getFlag(req.params.flagKey);

  if (!flag) {
    return res.status(404).json({
      success: false,
      error: 'Feature flag not found',
    });
  }

  res.json({
    success: true,
    data: flag,
  });
});

const createFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlagService.createFlag(req.body);

  res.status(201).json({
    success: true,
    data: flag,
  });
});

const updateFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlagService.updateFlag(req.params.flagKey, req.body);

  res.json({
    success: true,
    data: flag,
  });
});

const getUsageStats = asyncHandler(async (req, res) => {
  const { flagKey } = req.params;
  const { startDate, endDate } = req.query;

  const stats = await FeatureFlagService.getUsageStats(
    flagKey,
    new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(endDate || Date.now())
  );

  res.json({
    success: true,
    data: stats,
  });
});

const createRule = asyncHandler(async (req, res) => {
  const { flagKey } = req.params;
  const { conditions, enabled, priority } = req.body;

  const rule = await prisma.featureFlagRule.create({
    data: {
      flagKey,
      conditions: conditions || [],
      enabled: enabled !== undefined ? enabled : true,
      priority: priority || 0,
      isActive: true,
    },
  });

  res.status(201).json({
    success: true,
    data: rule,
  });
});

const createOverride = asyncHandler(async (req, res) => {
  const { flagKey } = req.params;
  const { userId, enabled } = req.body;

  const override = await prisma.featureFlagOverride.upsert({
    where: {
      flagKey_userId: {
        flagKey,
        userId,
      },
    },
    update: {
      enabled,
      isActive: true,
    },
    create: {
      flagKey,
      userId,
      enabled,
      isActive: true,
    },
  });

  res.status(201).json({
    success: true,
    data: override,
  });
});

module.exports = {
  evaluateFlag,
  getFlags,
  getFlag,
  createFlag,
  updateFlag,
  getUsageStats,
  createRule,
  createOverride,
};


