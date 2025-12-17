const { asyncHandler } = require('../utils/asyncHandler');
const shippingService = require('../services/shippingService');

const getShippingMethods = asyncHandler(async (req, res) => {
  const methods = await shippingService.getShippingMethods();
  res.json({
    success: true,
    data: methods,
  });
});

const calculateShipping = asyncHandler(async (req, res) => {
  const { address, items } = req.body;
  const result = await shippingService.calculateShipping(address, items);
  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  getShippingMethods,
  calculateShipping,
};


