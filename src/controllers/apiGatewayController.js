const { APIGatewayService } = require('../services/apiGatewayService');
const { asyncHandler } = require('../utils/asyncHandler');

const getUserTier = asyncHandler(async (req, res) => {
  const tier = await APIGatewayService.getUserTier(req.user.id);

  res.json({
    success: true,
    data: { tier },
  });
});

const setUserTier = asyncHandler(async (req, res) => {
  const { tier } = req.body;

  await APIGatewayService.setUserTier(req.user.id, tier);

  res.json({
    success: true,
    message: 'API tier updated',
  });
});

const getAPIUsage = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const usage = await APIGatewayService.getAPIUsage(
    req.user.id,
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.json({
    success: true,
    data: usage,
  });
});

const getAPIVersionInfo = asyncHandler(async (req, res) => {
  const { version } = req.params;

  const versionInfo = await APIGatewayService.getAPIVersionInfo(version);

  res.json({
    success: true,
    data: versionInfo,
  });
});

const deprecateAPIVersion = asyncHandler(async (req, res) => {
  const { version, deprecationDate, sunsetDate } = req.body;

  await APIGatewayService.deprecateAPIVersion(version, deprecationDate, sunsetDate);

  res.json({
    success: true,
    message: 'API version deprecated',
  });
});

module.exports = {
  getUserTier,
  setUserTier,
  getAPIUsage,
  getAPIVersionInfo,
  deprecateAPIVersion,
};


