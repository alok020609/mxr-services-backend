const { InternationalizationService } = require('../services/internationalizationService');
const { asyncHandler } = require('../utils/asyncHandler');

const getRegionalPrice = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { region } = req.query;

  const price = await InternationalizationService.getRegionalPrice(productId, region);

  res.json({
    success: true,
    data: price,
  });
});

const getRegionalAvailability = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { region } = req.query;

  const availability = await InternationalizationService.getRegionalAvailability(productId, region);

  res.json({
    success: true,
    data: availability,
  });
});

const getRegionalPaymentMethods = asyncHandler(async (req, res) => {
  const { region } = req.query;

  const methods = await InternationalizationService.getRegionalPaymentMethods(region);

  res.json({
    success: true,
    data: methods,
  });
});

const getRegionalShippingCarriers = asyncHandler(async (req, res) => {
  const { region } = req.query;

  const carriers = await InternationalizationService.getRegionalShippingCarriers(region);

  res.json({
    success: true,
    data: carriers,
  });
});

const getStores = asyncHandler(async (req, res) => {
  const stores = await InternationalizationService.getStores();

  res.json({
    success: true,
    data: stores,
  });
});

const getStore = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  const store = await InternationalizationService.getStore(storeId);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found',
    });
  }

  res.json({
    success: true,
    data: store,
  });
});

const createStore = asyncHandler(async (req, res) => {
  const store = await InternationalizationService.createStore(req.body);

  res.status(201).json({
    success: true,
    data: store,
  });
});

const getRegionalCompliance = asyncHandler(async (req, res) => {
  const { region } = req.query;

  const compliance = await InternationalizationService.getRegionalCompliance(region);

  res.json({
    success: true,
    data: compliance,
  });
});

module.exports = {
  getRegionalPrice,
  getRegionalAvailability,
  getRegionalPaymentMethods,
  getRegionalShippingCarriers,
  getStores,
  getStore,
  createStore,
  getRegionalCompliance,
};


