const express = require('express');
const router = express.Router();
const adminInvoiceController = require('../../controllers/admin/adminInvoiceController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Invoices
 *   description: Admin invoice actions (e.g. send invoice by email)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/invoices/{id}/send-email:
 *   post:
 *     summary: Send invoice by email
 *     description: Sends the invoice to the order customer's email. Respects mail settings (include PDF, order summary, shipping address).
 *     tags: [Admin Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sentTo:
 *                       type: string
 *                     invoiceNumber:
 *                       type: string
 *       400:
 *         description: Order has no customer email
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Email service error
 */
router.post('/:id/send-email', adminInvoiceController.sendInvoiceEmail);

module.exports = router;
