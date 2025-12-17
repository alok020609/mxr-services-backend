const { asyncHandler } = require('../utils/asyncHandler');
const taxService = require('../services/taxService');

const calculateTax = asyncHandler(async (req, res) => {
  const { address, items } = req.body;
  const result = await taxService.calculateTax(address, items);
  res.json({
    success: true,
    data: result,
  });
});

const getTaxRates = asyncHandler(async (req, res) => {
  const { country, state } = req.query;
  const rates = await taxService.getTaxRates({ country, state });
  res.json({
    success: true,
    data: rates,
  });
});

module.exports = {
  calculateTax,
  getTaxRates,
};


