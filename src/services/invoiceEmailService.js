const prisma = require('../config/database');
const logger = require('../utils/logger');
const mailSettingsService = require('./mailSettingsService');
const { IntegrationsService } = require('./integrationsService');
const https = require('https');
const http = require('http');

/**
 * Fetch buffer from URL (for PDF attachment). Supports https and http.
 */
function fetchUrlAsBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Send invoice email to the order's customer. Respects mail settings for details and PDF attachment.
 * @param {string} invoiceId - Invoice id
 * @param {object} options - Optional overrides: { includeInvoicePdf: boolean, includeOrderSummary: boolean, includeShippingAddress: boolean }
 */
async function sendInvoiceEmail(invoiceId, options = {}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      },
    },
  });

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }

  const order = invoice.order;
  const user = order?.user;
  if (!user?.email) {
    const err = new Error('Order has no customer email');
    err.statusCode = 400;
    throw err;
  }

  const settings = await mailSettingsService.getMailSettings();
  const details = { ...settings.config.details, ...options };

  const firstName = user.firstName || '';
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
  const invoiceNumber = invoice.invoiceNumber;
  const orderNumber = order.orderNumber;
  const amount = String(invoice.amount);
  const tax = String(invoice.tax);

  let htmlBody = `
    <p>${greeting}</p>
    <p>Please find your invoice <strong>#${invoiceNumber}</strong> for order <strong>#${orderNumber}</strong>.</p>
    <p><strong>Amount:</strong> ${amount} | <strong>Tax:</strong> ${tax}</p>
  `;

  let textBody = `${greeting}\n\nYour invoice #${invoiceNumber} for order #${orderNumber}.\nAmount: ${amount}, Tax: ${tax}\n`;

  if (details.includeOrderSummary && order.items?.length) {
    htmlBody += '<p><strong>Order summary:</strong></p><ul>';
    textBody += '\nOrder summary:\n';
    for (const item of order.items) {
      const name = item.product?.name || 'Item';
      htmlBody += `<li>${name} × ${item.quantity} — ${item.total}</li>`;
      textBody += `- ${name} x ${item.quantity} - ${item.total}\n`;
    }
    htmlBody += '</ul>';
  }

  if (details.includeShippingAddress && order.shippingAddress) {
    const addr = typeof order.shippingAddress === 'object' ? order.shippingAddress : {};
    const addrStr = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ');
    if (addrStr) {
      htmlBody += `<p><strong>Shipping address:</strong><br/>${addrStr}</p>`;
      textBody += `\nShipping address: ${addrStr}\n`;
    }
  }

  const subject = `Your invoice #${invoiceNumber}`;
  const html = `<!DOCTYPE html><html><body>${htmlBody}</body></html>`;

  const attachments = [];
  if (details.includeInvoicePdf && invoice.pdfUrl) {
    try {
      const pdfBuffer = await fetchUrlAsBuffer(invoice.pdfUrl);
      attachments.push({
        filename: `invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      });
    } catch (err) {
      logger.warn('Could not attach invoice PDF to email:', err.message);
    }
  }

  await IntegrationsService.sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html,
    attachments: attachments.length ? attachments : undefined,
  });

  logger.info(`Invoice email sent for #${invoiceNumber} to ${user.email}`);
  return { sentTo: user.email, invoiceNumber };
}

module.exports = {
  sendInvoiceEmail,
};
