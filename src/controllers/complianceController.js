const { ComplianceService } = require('../services/complianceService');
const { asyncHandler } = require('../utils/asyncHandler');

const exportUserData = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const data = await ComplianceService.exportUserData(userId);

  res.json({
    success: true,
    data,
  });
});

const deleteUserData = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await ComplianceService.deleteUserData(userId);

  res.json({
    success: true,
    message: 'User data deleted',
  });
});

const getPCIComplianceStatus = asyncHandler(async (req, res) => {
  const status = await ComplianceService.getPCIComplianceStatus();

  res.json({
    success: true,
    data: status,
  });
});

const calculateTaxWithAvalara = asyncHandler(async (req, res) => {
  const tax = await ComplianceService.calculateTaxWithAvalara(req.body);

  res.json({
    success: true,
    data: tax,
  });
});

const calculateTaxWithTaxJar = asyncHandler(async (req, res) => {
  const tax = await ComplianceService.calculateTaxWithTaxJar(req.body);

  res.json({
    success: true,
    data: tax,
  });
});

const calculateVATMOSS = asyncHandler(async (req, res) => {
  const { orderData, country } = req.body;

  const vat = await ComplianceService.calculateVATMOSS(orderData, country);

  res.json({
    success: true,
    data: vat,
  });
});

const calculateGST = asyncHandler(async (req, res) => {
  const { orderData, country } = req.body;

  const gst = await ComplianceService.calculateGST(orderData, country);

  res.json({
    success: true,
    data: gst,
  });
});

const trackNexus = asyncHandler(async (req, res) => {
  const { country, state, city } = req.body;

  const nexus = await ComplianceService.trackNexus(country, state, city);

  res.json({
    success: true,
    data: nexus,
  });
});

const createLegalDocument = asyncHandler(async (req, res) => {
  const { type, content, version } = req.body;

  const document = await ComplianceService.createLegalDocument(type, content, version);

  res.status(201).json({
    success: true,
    data: document,
  });
});

const getActiveLegalDocument = asyncHandler(async (req, res) => {
  const { type } = req.params;

  const document = await ComplianceService.getActiveLegalDocument(type);

  if (!document) {
    return res.status(404).json({
      success: false,
      error: 'Document not found',
    });
  }

  res.json({
    success: true,
    data: document,
  });
});

const recordUserAcceptance = asyncHandler(async (req, res) => {
  const { documentType, documentVersion } = req.body;

  const acceptance = await ComplianceService.recordUserAcceptance(
    req.user.id,
    documentType,
    documentVersion
  );

  res.status(201).json({
    success: true,
    data: acceptance,
  });
});

const checkUserAcceptance = asyncHandler(async (req, res) => {
  const { documentType } = req.params;

  const status = await ComplianceService.checkUserAcceptance(req.user.id, documentType);

  res.json({
    success: true,
    data: status,
  });
});

module.exports = {
  exportUserData,
  deleteUserData,
  getPCIComplianceStatus,
  calculateTaxWithAvalara,
  calculateTaxWithTaxJar,
  calculateVATMOSS,
  calculateGST,
  trackNexus,
  createLegalDocument,
  getActiveLegalDocument,
  recordUserAcceptance,
  checkUserAcceptance,
};


