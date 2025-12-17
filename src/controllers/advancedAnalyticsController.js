const { AdvancedAnalyticsService } = require('../services/advancedAnalyticsService');
const { asyncHandler } = require('../utils/asyncHandler');

const getRealTimeDashboard = asyncHandler(async (req, res) => {
  const dashboard = await AdvancedAnalyticsService.getRealTimeDashboard();

  res.json({
    success: true,
    data: dashboard,
  });
});

const getLiveOrders = asyncHandler(async (req, res) => {
  const orders = await AdvancedAnalyticsService.getLiveOrders();

  res.json({
    success: true,
    data: orders,
  });
});

const predictChurn = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const prediction = await AdvancedAnalyticsService.predictChurn(userId);

  res.json({
    success: true,
    data: prediction,
  });
});

const predictProductAffinity = asyncHandler(async (req, res) => {
  const { userId, productId } = req.params;

  const affinity = await AdvancedAnalyticsService.predictProductAffinity(userId, productId);

  res.json({
    success: true,
    data: affinity,
  });
});

const getNextBestProduct = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const products = await AdvancedAnalyticsService.getNextBestProduct(userId);

  res.json({
    success: true,
    data: products,
  });
});

const trackUTM = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const utmParams = req.query;

  await AdvancedAnalyticsService.trackUTMParameters(orderId, utmParams);

  res.json({
    success: true,
    message: 'UTM parameters tracked',
  });
});

const getMultiTouchAttribution = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  const attribution = await AdvancedAnalyticsService.getMultiTouchAttribution(
    userId,
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.json({
    success: true,
    data: attribution,
  });
});

const getConversionFunnel = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const funnel = await AdvancedAnalyticsService.getConversionFunnel(
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.json({
    success: true,
    data: funnel,
  });
});

module.exports = {
  getRealTimeDashboard,
  getLiveOrders,
  predictChurn,
  predictProductAffinity,
  getNextBestProduct,
  trackUTM,
  getMultiTouchAttribution,
  getConversionFunnel,
};


