const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const createGiftRegistry = asyncHandler(async (req, res) => {
  const { type, eventDate, description } = req.body;

  // TODO: Create GiftRegistry model in Prisma schema
  // For now, using a placeholder
  const registry = {
    id: 'temp-id',
    userId: req.user.id,
    type,
    eventDate: new Date(eventDate),
    description,
    isActive: true,
    createdAt: new Date(),
  };

  res.status(201).json({
    success: true,
    data: registry,
  });
});

const getGiftRegistries = asyncHandler(async (req, res) => {
  // TODO: Implement when GiftRegistry model is added
  const registries = [];

  res.json({
    success: true,
    data: registries,
  });
});

const addToGiftRegistry = asyncHandler(async (req, res) => {
  const { registryId, productId, quantity, priority } = req.body;

  // TODO: Implement when GiftRegistryItem model is added
  const registryItem = {
    id: 'temp-id',
    registryId,
    productId,
    quantity,
    priority: priority || 'MEDIUM',
  };

  res.status(201).json({
    success: true,
    data: registryItem,
  });
});

const sendAsGift = asyncHandler(async (req, res) => {
  const { orderId, recipientName, recipientEmail, giftMessage } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  // Update order with gift information
  await prisma.order.update({
    where: { id: orderId },
    data: {
      giftMessage,
      giftRecipientName: recipientName,
      giftRecipientEmail: recipientEmail,
      isGift: true,
    },
  });

  res.json({
    success: true,
    message: 'Order marked as gift',
  });
});

const scheduleGift = asyncHandler(async (req, res) => {
  const { orderId, scheduledDate, recipientName, recipientEmail, giftMessage } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      giftMessage,
      giftRecipientName: recipientName,
      giftRecipientEmail: recipientEmail,
      isGift: true,
      scheduledDelivery: {
        create: {
          scheduledDate: new Date(scheduledDate),
          status: 'SCHEDULED',
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Gift scheduled',
  });
});

const trackGift = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;

  // Find order by tracking number
  const order = await prisma.order.findFirst({
    where: {
      trackingNumber,
      isGift: true,
    },
    include: {
      tracking: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Gift order not found',
    });
  }

  res.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      tracking: order.tracking,
      giftMessage: order.giftMessage,
    },
  });
});

module.exports = {
  createGiftRegistry,
  getGiftRegistries,
  addToGiftRegistry,
  sendAsGift,
  scheduleGift,
  trackGift,
};

