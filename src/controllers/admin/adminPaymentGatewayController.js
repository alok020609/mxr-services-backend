const { asyncHandler } = require('../../utils/asyncHandler');
const { AdminPaymentGatewayService } = require('../../services/adminPaymentGatewayService');

// Create payment gateway
const createPaymentGateway = asyncHandler(async (req, res) => {
  const { name, type, config, webhookSecret, supportedCurrencies, supportedMethods, isActive } = req.body;

  const gateway = await AdminPaymentGatewayService.createPaymentGateway({
    name,
    type,
    config,
    webhookSecret,
    supportedCurrencies,
    supportedMethods,
    isActive,
  });

  res.status(201).json({
    success: true,
    data: {
      ...gateway,
      config: AdminPaymentGatewayService.maskSensitiveFields(gateway.config),
    },
  });
});

// Get all payment gateways
const getPaymentGateways = asyncHandler(async (req, res) => {
  const { isActive, type, page, limit } = req.query;

  const result = await AdminPaymentGatewayService.getPaymentGateways({
    isActive,
    type,
    page,
    limit,
  });

  res.json({
    success: true,
    data: result.gateways,
    pagination: result.pagination,
  });
});

// Get config schema for a gateway type (for frontend form rendering)
const getConfigSchema = asyncHandler(async (req, res) => {
  const type = req.query.type;
  if (!type) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "type" is required (e.g. PAYU, STRIPE, RAZORPAY)',
    });
  }
  const schema = AdminPaymentGatewayService.getConfigSchema(type.toUpperCase());
  if (!schema.fields || schema.fields.length === 0) {
    return res.status(400).json({
      success: false,
      error: `No config schema for gateway type: ${type}`,
    });
  }
  res.json({
    success: true,
    data: schema,
  });
});

// Get single payment gateway
const getPaymentGateway = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const gateway = await AdminPaymentGatewayService.getPaymentGateway(id);

  res.json({
    success: true,
    data: gateway,
  });
});

// Update payment gateway
const updatePaymentGateway = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, config, webhookSecret, supportedCurrencies, supportedMethods, isActive } = req.body;

  const gateway = await AdminPaymentGatewayService.updatePaymentGateway(id, {
    name,
    config,
    webhookSecret,
    supportedCurrencies,
    supportedMethods,
    isActive,
  });

  res.json({
    success: true,
    data: gateway,
  });
});

// Toggle payment gateway active status
const togglePaymentGateway = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'isActive must be a boolean value',
    });
  }

  const gateway = await AdminPaymentGatewayService.togglePaymentGateway(id, isActive);

  res.json({
    success: true,
    data: gateway,
    message: `Payment gateway ${isActive ? 'activated' : 'deactivated'} successfully`,
  });
});

// Delete payment gateway
const deletePaymentGateway = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await AdminPaymentGatewayService.deletePaymentGateway(id);

  res.json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  createPaymentGateway,
  getPaymentGateways,
  getConfigSchema,
  getPaymentGateway,
  updatePaymentGateway,
  togglePaymentGateway,
  deletePaymentGateway,
};
