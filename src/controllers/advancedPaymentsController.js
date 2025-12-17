const { AdvancedPaymentsService } = require('../services/advancedPaymentsService');
const { asyncHandler } = require('../utils/asyncHandler');

const createPaymentLink = asyncHandler(async (req, res) => {
  const { orderId, amount, description, expiresAt } = req.body;

  const paymentLink = await AdvancedPaymentsService.createPaymentLink(
    orderId,
    amount,
    description,
    expiresAt
  );

  res.status(201).json({
    success: true,
    data: paymentLink,
  });
});

const savePaymentMethod = asyncHandler(async (req, res) => {
  const savedMethod = await AdvancedPaymentsService.savePaymentMethod(
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    data: savedMethod,
  });
});

const getSavedPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await AdvancedPaymentsService.getSavedPaymentMethods(req.user.id);

  res.json({
    success: true,
    data: methods,
  });
});

const routePayment = asyncHandler(async (req, res) => {
  const { orderId, amount, currency, region } = req.body;

  const route = await AdvancedPaymentsService.routePayment(orderId, amount, currency, region);

  res.json({
    success: true,
    data: route,
  });
});

const retryPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { maxRetries } = req.body;

  const result = await AdvancedPaymentsService.retryPayment(paymentId, maxRetries);

  res.json({
    success: true,
    data: result,
  });
});

const splitPayment = asyncHandler(async (req, res) => {
  const { orderId, splits } = req.body;

  const paymentSplits = await AdvancedPaymentsService.splitPayment(orderId, splits);

  res.json({
    success: true,
    data: paymentSplits,
  });
});

const reconcilePayments = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const reconciliation = await AdvancedPaymentsService.reconcilePayments(
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.json({
    success: true,
    data: reconciliation,
  });
});

const recordChargeback = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const chargebackData = req.body;

  const chargeback = await AdvancedPaymentsService.recordChargeback(paymentId, chargebackData);

  res.status(201).json({
    success: true,
    data: chargeback,
  });
});

module.exports = {
  createPaymentLink,
  savePaymentMethod,
  getSavedPaymentMethods,
  routePayment,
  retryPayment,
  splitPayment,
  reconcilePayments,
  recordChargeback,
};


