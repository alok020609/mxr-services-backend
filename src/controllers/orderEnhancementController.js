const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// Order Notes
const addOrderNote = asyncHandler(async (req, res) => {
  const { orderId, note, isInternal } = req.body;

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

  const orderNote = await prisma.orderNote.create({
    data: {
      orderId,
      userId: req.user.id,
      note,
      isInternal: isInternal || false,
    },
  });

  res.status(201).json({
    success: true,
    data: orderNote,
  });
});

const getOrderNotes = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.orderId,
      userId: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const notes = await prisma.orderNote.findMany({
    where: {
      orderId: req.params.orderId,
      isInternal: false, // Users can only see non-internal notes
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: notes,
  });
});

// Scheduled Delivery
const scheduleDelivery = asyncHandler(async (req, res) => {
  const { orderId, scheduledDate, timeSlot } = req.body;

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

  const scheduledDelivery = await prisma.scheduledDelivery.upsert({
    where: { orderId },
    update: {
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      status: 'SCHEDULED',
    },
    create: {
      orderId,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      status: 'SCHEDULED',
    },
  });

  res.json({
    success: true,
    data: scheduledDelivery,
  });
});

// Order Split
const getOrderSplits = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.orderId,
      userId: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const splits = await prisma.orderSplit.findMany({
    where: { orderId: req.params.orderId },
    orderBy: { shipmentNumber: 'asc' },
  });

  res.json({
    success: true,
    data: splits,
  });
});

module.exports = {
  addOrderNote,
  getOrderNotes,
  scheduleDelivery,
  getOrderSplits,
};


