const prisma = require('../../config/database');
const { asyncHandler } = require('../../utils/asyncHandler');
const { restoreOrderInventory } = require('../../services/orderInventoryRestore');

const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, userId, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(status && { status }),
    ...(userId && { userId }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
            variant: true,
            service: true,
            package: true,
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            gateway: true,
            paymentMethod: true,
            currency: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true,
          service: true,
          package: true,
        },
      },
      payments: {
        include: {
          transactions: true,
        },
      },
      tracking: true,
      returns: true,
      notes: true,
      stateHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  res.json({
    success: true,
    data: order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });

  // When setting order to PAID, align payment records so list/detail show Payment as paid
  if (status === 'PAID') {
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { status: 'SUCCEEDED' },
    });
  }

  // Record state history
  await prisma.orderStateHistory.create({
    data: {
      orderId: order.id,
      fromState: order.status,
      toState: status,
      userId: req.user.id,
    },
  });

  res.json({
    success: true,
    data: updatedOrder,
  });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: { select: { productId: true, variantId: true, quantity: true } },
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    await restoreOrderInventory(tx, order.items);
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });
    await tx.orderStateHistory.create({
      data: {
        orderId: order.id,
        fromState: order.status,
        toState: 'CANCELLED',
        userId: req.user.id,
        reason: 'Admin cancelled',
      },
    });
    return tx.order.findUnique({
      where: { id: order.id },
    });
  });

  res.json({
    success: true,
    data: updatedOrder,
  });
});

const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      payments: true,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  // TODO: Process refund through payment gateway
  // Update order status
  await prisma.order.update({
    where: { id: req.params.id },
    data: { status: 'REFUNDED' },
  });

  res.json({
    success: true,
    message: 'Refund processed',
  });
});

module.exports = {
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  processRefund,
};


