const prisma = require('../config/database');
const logger = require('../utils/logger');
const mailSettingsService = require('./mailSettingsService');
const { IntegrationsService } = require('./integrationsService');

/**
 * Send order confirmation email to the customer. Respects mail settings (order summary, shipping address).
 * @param {string} orderId - Order id
 */
async function sendOrderConfirmationEmail(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  if (!order) {
    logger.warn(`Order not found for confirmation email: ${orderId}`);
    return;
  }

  const user = order.user;
  if (!user?.email) {
    logger.warn(`Order ${orderId} has no customer email, skipping confirmation`);
    return;
  }

  const settings = await mailSettingsService.getMailSettings();
  const details = settings.config.details || {};

  const firstName = user.firstName || '';
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
  const orderNumber = order.orderNumber;
  const total = String(order.total);

  let htmlBody = `
    <p>${greeting}</p>
    <p>Thank you for your order. Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
    <p><strong>Total:</strong> ${total} ${order.currency || 'USD'}</p>
  `;

  let textBody = `${greeting}\n\nThank you for your order. Order #${orderNumber} has been placed. Total: ${total} ${order.currency || 'USD'}\n`;

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

  const subject = `Order confirmation #${orderNumber}`;
  const html = `<!DOCTYPE html><html><body>${htmlBody}</body></html>`;

  await IntegrationsService.sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html,
  });

  logger.info(`Order confirmation email sent for #${orderNumber} to ${user.email}`);
}

module.exports = {
  sendOrderConfirmationEmail,
};
