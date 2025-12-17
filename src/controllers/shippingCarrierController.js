const { ShippingCarrierService } = require('../services/shippingCarrierService');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllRates = asyncHandler(async (req, res) => {
  const { fromAddress, toAddress, packageDetails } = req.body;

  const rates = await ShippingCarrierService.getAllRates(fromAddress, toAddress, packageDetails);

  res.json({
    success: true,
    data: rates,
  });
});

const createShippingLabel = asyncHandler(async (req, res) => {
  const { carrierCode, orderId, packageDetails } = req.body;

  const label = await ShippingCarrierService.createShippingLabel(carrierCode, orderId, packageDetails);

  res.status(201).json({
    success: true,
    data: label,
  });
});

const trackShipment = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;
  const { carrierCode } = req.query;

  const tracking = await ShippingCarrierService.trackShipment(trackingNumber, carrierCode);

  res.json({
    success: true,
    data: tracking,
  });
});

module.exports = {
  getAllRates,
  createShippingLabel,
  trackShipment,
};


