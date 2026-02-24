const { asyncHandler } = require('../utils/asyncHandler');
const LogisticsService = require('../services/logisticsService');

/**
 * Track shipment
 */
const trackShipment = asyncHandler(async (req, res) => {
  const { orderId, trackingNumber, providerType } = req.query;

  if (!orderId && !trackingNumber) {
    return res.status(400).json({
      success: false,
      error: 'Either orderId or trackingNumber is required',
    });
  }

  const trackingData = await LogisticsService.trackShipment(orderId, trackingNumber, providerType);

  res.json({
    success: true,
    data: trackingData,
  });
});

/**
 * Calculate shipping rates
 */
const calculateRates = asyncHandler(async (req, res) => {
  const { compareAll, providerType } = req.query;
  const orderData = req.body;

  const rates = await LogisticsService.calculateRates(orderData, {
    compareAll: compareAll === 'true',
    providerType,
  });

  res.json({
    success: true,
    data: rates,
  });
});

/**
 * Create shipment
 */
const createShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const { providerId } = req.query;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'orderId is required',
    });
  }

  const shipment = await LogisticsService.createShipment(orderId, req.body, providerId);

  res.status(201).json({
    success: true,
    data: shipment,
    message: 'Shipment created successfully',
  });
});

/**
 * Get shipment status
 */
const getShipmentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const shipments = await LogisticsService.getShipmentStatus(orderId);

  res.json({
    success: true,
    data: shipments,
  });
});

/**
 * Generate shipping label
 */
const generateLabel = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;

  const labelData = await LogisticsService.generateLabel(shipmentId);

  res.json({
    success: true,
    data: labelData,
    message: 'Label generated successfully',
  });
});

/**
 * Schedule pickup
 */
const schedulePickup = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const pickupData = req.body;

  const result = await LogisticsService.schedulePickup(shipmentId, pickupData);

  res.json({
    success: true,
    data: result,
    message: 'Pickup scheduled successfully',
  });
});

/**
 * Cancel shipment
 */
const cancelShipment = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const { reason } = req.body;

  const shipment = await LogisticsService.cancelShipment(shipmentId, reason);

  res.json({
    success: true,
    data: shipment,
    message: 'Shipment cancelled successfully',
  });
});

/**
 * Handle return
 */
const handleReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'orderId is required',
    });
  }

  const returnShipment = await LogisticsService.handleReturn(orderId, req.body);

  res.status(201).json({
    success: true,
    data: returnShipment,
    message: 'Return shipment created successfully',
  });
});

module.exports = {
  trackShipment,
  calculateRates,
  createShipment,
  getShipmentStatus,
  generateLabel,
  schedulePickup,
  cancelShipment,
  handleReturn,
};
