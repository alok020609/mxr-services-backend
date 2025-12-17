const prisma = require('../config/database');

const createNotification = async (userId, type, title, message, link = null, metadata = null) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      metadata,
    },
  });
};

const sendOrderNotification = async (userId, orderId, orderNumber) => {
  return createNotification(
    userId,
    'ORDER',
    'Order Placed',
    `Your order #${orderNumber} has been placed successfully.`,
    `/orders/${orderId}`
  );
};

const sendPaymentNotification = async (userId, orderId, status) => {
  const messages = {
    SUCCEEDED: 'Payment successful',
    FAILED: 'Payment failed',
    REFUNDED: 'Payment refunded',
  };

  return createNotification(
    userId,
    'PAYMENT',
    messages[status] || 'Payment Update',
    `Your payment for order #${orderId} is ${status.toLowerCase()}.`,
    `/orders/${orderId}`
  );
};

const sendShippingNotification = async (userId, orderId, status) => {
  return createNotification(
    userId,
    'SHIPPING',
    'Shipping Update',
    `Your order #${orderId} has been ${status.toLowerCase()}.`,
    `/orders/${orderId}`
  );
};

module.exports = {
  createNotification,
  sendOrderNotification,
  sendPaymentNotification,
  sendShippingNotification,
};


