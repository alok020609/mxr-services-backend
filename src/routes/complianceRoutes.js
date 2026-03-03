const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Compliance
 *   description: Compliance and legal document management endpoints
 */

// Public endpoints
/**
 * @swagger
 * /api/v1/compliance/documents/{type}:
 *   get:
 *     summary: Get active legal document
 *     description: Retrieve active legal document (terms, privacy policy, etc.)
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [terms, privacy, refund, shipping]
 *         description: Document type
 *     responses:
 *       200:
 *         description: Legal document retrieved successfully
 *       404:
 *         description: Document not found
 */
router.get('/documents/:type', complianceController.getActiveLegalDocument);

// Authenticated endpoints
router.use(auth);

/**
 * @swagger
 * /api/v1/compliance/users/{userId}/export:
 *   get:
 *     summary: Export user data
 *     description: Export all user data for GDPR compliance
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data exported successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/users/:userId/export', complianceController.exportUserData);

/**
 * @swagger
 * /api/v1/compliance/users/{userId}/data:
 *   delete:
 *     summary: Delete user data
 *     description: Delete all user data for GDPR right to be forgotten
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId/data', complianceController.deleteUserData);

/**
 * @swagger
 * /api/v1/compliance/acceptance:
 *   post:
 *     summary: Record user acceptance
 *     description: Record user acceptance of legal documents
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - version
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [terms, privacy, refund]
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: Acceptance recorded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/acceptance', complianceController.recordUserAcceptance);

/**
 * @swagger
 * /api/v1/compliance/acceptance/{documentType}:
 *   get:
 *     summary: Check user acceptance
 *     description: Check if user has accepted a legal document
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [terms, privacy, refund]
 *         description: Document type
 *     responses:
 *       200:
 *         description: Acceptance status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/acceptance/:documentType', complianceController.checkUserAcceptance);

// Admin endpoints
router.use(admin);

/**
 * @swagger
 * /api/v1/compliance/pci/status:
 *   get:
 *     summary: Get PCI compliance status
 *     description: Get PCI DSS compliance status (Admin only)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PCI compliance status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/pci/status', complianceController.getPCIComplianceStatus);

/**
 * @swagger
 * /api/v1/compliance/tax/avalara:
 *   post:
 *     summary: Calculate tax with Avalara
 *     description: Calculate tax using Avalara integration (Admin only)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - items
 *             properties:
 *               address:
 *                 type: object
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Tax calculated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/tax/avalara', complianceController.calculateTaxWithAvalara);

/**
 * @swagger
 * /api/v1/compliance/tax/taxjar:
 *   post:
 *     summary: Calculate tax with TaxJar
 *     description: Calculate tax using TaxJar integration (Admin only)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - items
 *             properties:
 *               address:
 *                 type: object
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Tax calculated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/tax/taxjar', complianceController.calculateTaxWithTaxJar);

/**
 * @swagger
 * /api/v1/compliance/tax/vat-moss:
 *   post:
 *     summary: Calculate VAT MOSS
 *     description: Calculate VAT MOSS for digital services (Admin only)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerCountry
 *               - amount
 *             properties:
 *               customerCountry:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: VAT MOSS calculated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/tax/vat-moss', complianceController.calculateVATMOSS);

/**
 * @swagger
 * /api/v1/compliance/tax/gst:
 *   post:
 *     summary: Calculate GST
 *     description: Calculate Goods and Services Tax (Admin only)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - amount
 *             properties:
 *               address:
 *                 type: object
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: GST calculated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/tax/gst', complianceController.calculateGST);

/**
 * @swagger
 * /api/v1/compliance/tax/nexus:
 *   post:
 *     summary: Track nexus
 *     description: Track sales tax nexus (Admin only)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - state
 *               - amount
 *             properties:
 *               state:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Nexus tracked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/tax/nexus', complianceController.trackNexus);

/**
 * @swagger
 * /api/v1/compliance/documents:
 *   post:
 *     summary: Create legal document
 *     description: Create or update a legal document (Admin only)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *               - version
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [terms, privacy, refund, shipping]
 *               content:
 *                 type: string
 *               version:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Legal document created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/documents', complianceController.createLegalDocument);

module.exports = router;


