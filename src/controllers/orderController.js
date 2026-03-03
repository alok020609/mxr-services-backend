const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const crypto = require('crypto');
const logger = require('../utils/logger');
const mailSettingsService = require('../services/mailSettingsService');
const orderConfirmationEmailService = require('../services/orderConfirmationEmailService');

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// Map request paymentMethod string to Prisma PaymentGatewayType enum
const PAYMENT_METHOD_TO_GATEWAY = {
  cod: 'COD',
  cash_on_delivery: 'COD',
  stripe: 'STRIPE',
  razorpay: 'RAZORPAY',
  paypal: 'PAYPAL',
  upi: 'UPI',
  phonepe: 'PHONEPE',
  gpay: 'GPAY',
  paytm: 'PAYTM',
  payu: 'PAYU',
  bank_transfer: 'BANK_TRANSFER',
  crypto: 'CRYPTO',
};
const VALID_GATEWAYS = ['STRIPE', 'PAYU', 'PAYPAL', 'UPI', 'RAZORPAY', 'CRYPTO', 'BANK_TRANSFER', 'COD', 'PHONEPE', 'GPAY', 'PAYTM'];

function resolvePaymentGateway(paymentMethod) {
  if (!paymentMethod || typeof paymentMethod !== 'string') return 'COD';
  const normalized = paymentMethod.trim().toLowerCase().replace(/-/g, '_');
  if (PAYMENT_METHOD_TO_GATEWAY[normalized]) return PAYMENT_METHOD_TO_GATEWAY[normalized];
  const upper = paymentMethod.trim().toUpperCase();
  if (VALID_GATEWAYS.includes(upper)) return upper;
  return 'COD';
}

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, billingAddressId, couponCode, paymentMethod: paymentMethodRaw } = req.body;
  const gateway = resolvePaymentGateway(paymentMethodRaw);

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cart is empty',
    });
  }

  // Get addresses
  const shippingAddress = await prisma.address.findFirst({
    where: {
      id: shippingAddressId,
      userId: req.user.id,
    },
  });

  const billingAddress = billingAddressId
    ? await prisma.address.findFirst({
        where: {
          id: billingAddressId,
          userId: req.user.id,
        },
      })
    : shippingAddress;

  if (!shippingAddress || !billingAddress) {
    return res.status(400).json({
      success: false,
      error: 'Invalid address',
    });
  }

  // Stock check: ensure every cart item has sufficient stock
  for (const item of cart.items) {
    const available = item.variant != null ? item.variant.stock : item.product.stock;
    if (available < item.quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock for one or more items',
      });
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const price = item.variant?.price || item.product.price;
    const total = price * item.quantity;
    subtotal += total;

    orderItems.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price,
      total,
    });
  }

  // Apply coupon if provided
  let discount = 0;
  let couponId = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode,
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
    });

    if (coupon && coupon.usedCount < (coupon.usageLimit || Infinity)) {
      couponId = coupon.id;
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.value;
      }
    }
  }

  const tax = 0; // TODO: Calculate tax
  const shipping = 0; // TODO: Calculate shipping
  const total = subtotal + tax + shipping - discount;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: req.user.id,
        orderNumber: generateOrderNumber(),
        status: 'CREATED',
        total,
        subtotal,
        tax,
        shipping,
        discount,
        currency: 'USD',
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        billingAddress: {
          street: billingAddress.street,
          city: billingAddress.city,
          state: billingAddress.state,
          zipCode: billingAddress.zipCode,
          country: billingAddress.country,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        items: {
          create: orderItems,
        },
        payments: {
          create: {
            gateway,
            amount: Number(total),
            currency: 'USD',
            status: 'PENDING',
            paymentMethod: paymentMethodRaw && typeof paymentMethodRaw === 'string' ? paymentMethodRaw.trim() : null,
          },
        },
        ...(couponId && {
          coupons: {
            create: {
              couponId,
              userId: req.user.id,
              discountAmount: discount,
            },
          },
        }),
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
      },
    });

    for (const item of cart.items) {
      const qty = item.quantity;
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: qty } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: qty } },
        });
        const inv = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { stock: { decrement: qty } },
          });
        }
      }
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await tx.orderStateHistory.create({
      data: {
        orderId: created.id,
        fromState: 'CREATED',
        toState: 'CREATED',
        userId: req.user.id,
      },
    });

    return created;
  });

  // Order confirmation email if enabled in mail settings (fire-and-forget)
  mailSettingsService.getMailSettings().then((settings) => {
    if (settings.config?.triggers?.orderPlaced) {
      orderConfirmationEmailService.sendOrderConfirmationEmail(order.id).catch((err) => {
        logger.error('Order confirmation email failed', { orderId: order.id, error: err.message });
      });
    }
  }).catch(() => {});

  res.status(201).json({
    success: true,
    data: order,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId: req.user.id,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
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
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
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

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  if (!['CREATED', 'PAYMENT_PENDING'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      error: 'Order cannot be cancelled',
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED' },
  });

  // Record state history
  await prisma.orderStateHistory.create({
    data: {
      orderId: order.id,
      fromState: order.status,
      toState: 'CANCELLED',
      userId: req.user.id,
      reason: 'User cancelled',
    },
  });

  res.json({
    success: true,
    data: updatedOrder,
  });
});

const requestReturn = asyncHandler(async (req, res) => {
  const { reason, items } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      error: 'Order cannot be returned',
    });
  }

  const orderReturn = await prisma.orderReturn.create({
    data: {
      orderId: order.id,
      userId: req.user.id,
      reason,
      items: items || [],
      status: 'PENDING',
    },
  });

  res.status(201).json({
    success: true,
    data: orderReturn,
  });
});

const getOrderTracking = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
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
      error: 'Order not found',
    });
  }

  res.json({
    success: true,
    data: order.tracking,
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  requestReturn,
  getOrderTracking,
};


