const express = require('express');
const router = express.Router();
const adminMailSettingsController = require('../../controllers/admin/adminMailSettingsController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Mail Settings
 *   description: When to send emails and which details to include (order confirmation, invoice emails)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/mail-settings:
 *   get:
 *     summary: Get mail settings
 *     description: Returns triggers (when to send) and details (what to include) for transactional emails.
 *     tags: [Admin Mail Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mail settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     config:
 *                       type: object
 *                       properties:
 *                         triggers:
 *                           type: object
 *                           properties:
 *                             orderPlaced:
 *                               type: boolean
 *                             orderShipped:
 *                               type: boolean
 *                             invoiceCreated:
 *                               type: boolean
 *                             invoiceSent:
 *                               type: boolean
 *                         details:
 *                           type: object
 *                           properties:
 *                             includeOrderSummary:
 *                               type: boolean
 *                             includeInvoicePdf:
 *                               type: boolean
 *                             includeShippingAddress:
 *                               type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', adminMailSettingsController.getMailSettings);

/**
 * @swagger
 * /api/v1/admin/mail-settings:
 *   put:
 *     summary: Update mail settings
 *     description: Update when to send emails and which details to include. Partial update (only send fields to change).
 *     tags: [Admin Mail Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               triggers:
 *                 type: object
 *                 properties:
 *                   orderPlaced:
 *                     type: boolean
 *                   orderShipped:
 *                     type: boolean
 *                   invoiceCreated:
 *                     type: boolean
 *                   invoiceSent:
 *                     type: boolean
 *               details:
 *                 type: object
 *                 properties:
 *                   includeOrderSummary:
 *                     type: boolean
 *                   includeInvoicePdf:
 *                     type: boolean
 *                   includeShippingAddress:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Updated mail settings
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/', adminMailSettingsController.updateMailSettings);

module.exports = router;
