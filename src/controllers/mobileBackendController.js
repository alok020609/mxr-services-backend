const { MobileBackendService } = require('../services/mobileBackendService');
const { asyncHandler } = require('../utils/asyncHandler');

const registerDevice = asyncHandler(async (req, res) => {
  const device = await MobileBackendService.registerDevice(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: device,
  });
});

const sendPushNotification = asyncHandler(async (req, res) => {
  const { userId, title, body, data } = req.body;

  const result = await MobileBackendService.sendPushNotification(userId, title, body, data);

  res.json({
    success: true,
    data: result,
  });
});

const createDeepLink = asyncHandler(async (req, res) => {
  const { type, entityId, metadata } = req.body;

  const link = await MobileBackendService.createDeepLink(type, entityId, metadata);

  res.json({
    success: true,
    data: link,
  });
});

const checkAppVersion = asyncHandler(async (req, res) => {
  const { platform, currentVersion } = req.query;

  const versionInfo = await MobileBackendService.checkAppVersion(platform, currentVersion);

  res.json({
    success: true,
    data: versionInfo,
  });
});

const processMobilePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, paymentData } = req.body;

  const result = await MobileBackendService.processMobilePayment(orderId, paymentMethod, paymentData);

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  registerDevice,
  sendPushNotification,
  createDeepLink,
  checkAppVersion,
  processMobilePayment,
};


