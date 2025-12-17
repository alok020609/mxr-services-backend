const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { auth, admin } = require('../middleware/auth');

// Public endpoints
router.get('/documents/:type', complianceController.getActiveLegalDocument);

// Authenticated endpoints
router.use(auth);
router.get('/users/:userId/export', complianceController.exportUserData);
router.delete('/users/:userId/data', complianceController.deleteUserData);
router.post('/acceptance', complianceController.recordUserAcceptance);
router.get('/acceptance/:documentType', complianceController.checkUserAcceptance);

// Admin endpoints
router.use(admin);
router.get('/pci/status', complianceController.getPCIComplianceStatus);
router.post('/tax/avalara', complianceController.calculateTaxWithAvalara);
router.post('/tax/taxjar', complianceController.calculateTaxWithTaxJar);
router.post('/tax/vat-moss', complianceController.calculateVATMOSS);
router.post('/tax/gst', complianceController.calculateGST);
router.post('/tax/nexus', complianceController.trackNexus);
router.post('/documents', complianceController.createLegalDocument);

module.exports = router;


