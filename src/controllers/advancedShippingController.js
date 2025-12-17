const { AdvancedShippingService } = require('../services/advancedShippingService');
const { asyncHandler } = require('../utils/asyncHandler');

const validateAddress = asyncHandler(async (req, res) => {
  const address = req.body;

  const validation = await AdvancedShippingService.validateAddress(address);

  res.json({
    success: true,
    data: validation,
  });
});

const autocompleteAddress = asyncHandler(async (req, res) => {
  const { query } = req.query;

  const predictions = await AdvancedShippingService.autocompleteAddress(query);

  res.json({
    success: true,
    data: predictions,
  });
});

const detectPOBox = asyncHandler(async (req, res) => {
  const { address } = req.body;

  const isPOBox = AdvancedShippingService.detectPOBox(address);

  res.json({
    success: true,
    data: { isPOBox },
  });
});

const detectAddressType = asyncHandler(async (req, res) => {
  const { address } = req.body;

  const addressType = await AdvancedShippingService.detectAddressType(address);

  res.json({
    success: true,
    data: addressType,
  });
});

const createPickupLocation = asyncHandler(async (req, res) => {
  const location = await AdvancedShippingService.createPickupLocation(req.body);

  res.status(201).json({
    success: true,
    data: location,
  });
});

const getAvailablePickupLocations = asyncHandler(async (req, res) => {
  const { zipCode } = req.query;

  const locations = await AdvancedShippingService.getAvailablePickupLocations(zipCode);

  res.json({
    success: true,
    data: locations,
  });
});

const requestWhiteGloveDelivery = asyncHandler(async (req, res) => {
  const { orderId, requirements } = req.body;

  const delivery = await AdvancedShippingService.requestWhiteGloveDelivery(orderId, requirements);

  res.status(201).json({
    success: true,
    data: delivery,
  });
});

const requireSignature = asyncHandler(async (req, res) => {
  const { orderId, signatureType } = req.body;

  await AdvancedShippingService.requireSignature(orderId, signatureType);

  res.json({
    success: true,
    message: 'Signature requirement added',
  });
});

const addDeliveryInstructions = asyncHandler(async (req, res) => {
  const { orderId, instructions } = req.body;

  await AdvancedShippingService.addDeliveryInstructions(orderId, instructions);

  res.json({
    success: true,
    message: 'Delivery instructions added',
  });
});

const optimizeRoute = asyncHandler(async (req, res) => {
  const { deliveries } = req.body;

  const optimized = await AdvancedShippingService.optimizeRoute(deliveries);

  res.json({
    success: true,
    data: optimized,
  });
});

const optimizePackaging = asyncHandler(async (req, res) => {
  const { items } = req.body;

  const optimization = await AdvancedShippingService.optimizePackaging(items);

  res.json({
    success: true,
    data: optimization,
  });
});

const calculateDimensionalWeight = asyncHandler(async (req, res) => {
  const { length, width, height, divisor } = req.body;

  const dimWeight = AdvancedShippingService.calculateDimensionalWeight(
    length,
    width,
    height,
    divisor
  );

  res.json({
    success: true,
    data: { dimensionalWeight: dimWeight },
  });
});

const addShippingInsurance = asyncHandler(async (req, res) => {
  const { orderId, declaredValue } = req.body;

  const insurance = await AdvancedShippingService.addShippingInsurance(orderId, declaredValue);

  res.status(201).json({
    success: true,
    data: insurance,
  });
});

module.exports = {
  validateAddress,
  autocompleteAddress,
  detectPOBox,
  detectAddressType,
  createPickupLocation,
  getAvailablePickupLocations,
  requestWhiteGloveDelivery,
  requireSignature,
  addDeliveryInstructions,
  optimizeRoute,
  optimizePackaging,
  calculateDimensionalWeight,
  addShippingInsurance,
};


