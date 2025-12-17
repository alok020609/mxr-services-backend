const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// Digital Products
const getDigitalProduct = asyncHandler(async (req, res) => {
  const digitalProduct = await prisma.digitalProduct.findUnique({
    where: { productId: req.params.productId },
    include: {
      product: true,
    },
  });

  if (!digitalProduct) {
    return res.status(404).json({
      success: false,
      error: 'Digital product not found',
    });
  }

  res.json({
    success: true,
    data: digitalProduct,
  });
});

const downloadDigitalProduct = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.orderId,
      userId: req.user.id,
      status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      items: {
        some: {
          productId: req.params.productId,
        },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found or product not purchased',
    });
  }

  const digitalProduct = await prisma.digitalProduct.findUnique({
    where: { productId: req.params.productId },
  });

  if (!digitalProduct) {
    return res.status(404).json({
      success: false,
      error: 'Digital product not found',
    });
  }

  // Check download limit
  // TODO: Track downloads per user

  res.json({
    success: true,
    data: {
      downloadUrl: digitalProduct.fileUrl,
      downloadLimit: digitalProduct.downloadLimit,
      expiryDays: digitalProduct.expiryDays,
    },
  });
});

// Subscriptions
const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.user.id },
    include: {
      product: true,
      plan: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: subscriptions,
  });
});

const createSubscription = asyncHandler(async (req, res) => {
  const { productId, planId } = req.body;

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Subscription plan not found',
    });
  }

  const startDate = new Date();
  const endDate = new Date();
  let nextBillingDate = new Date();

  switch (plan.interval) {
    case 'WEEKLY':
      endDate.setDate(endDate.getDate() + 7);
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
      break;
    case 'MONTHLY':
      endDate.setMonth(endDate.getMonth() + 1);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      break;
    case 'QUARTERLY':
      endDate.setMonth(endDate.getMonth() + 3);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      break;
    case 'YEARLY':
      endDate.setFullYear(endDate.getFullYear() + 1);
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      break;
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: req.user.id,
      productId,
      planId,
      status: 'ACTIVE',
      startDate,
      endDate,
      nextBillingDate,
    },
    include: {
      product: true,
      plan: true,
    },
  });

  res.status(201).json({
    success: true,
    data: subscription,
  });
});

// Pre-Orders
const createPreOrder = asyncHandler(async (req, res) => {
  const { productId, quantity, expectedDate } = req.body;

  const preOrder = await prisma.preOrder.create({
    data: {
      userId: req.user.id,
      productId,
      quantity,
      expectedDate: new Date(expectedDate),
      status: 'PENDING',
    },
    include: {
      product: true,
    },
  });

  res.status(201).json({
    success: true,
    data: preOrder,
  });
});

const getPreOrders = asyncHandler(async (req, res) => {
  const preOrders = await prisma.preOrder.findMany({
    where: { userId: req.user.id },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: preOrders,
  });
});

// Gift Cards
const getGiftCards = asyncHandler(async (req, res) => {
  const giftCards = await prisma.giftCard.findMany({
    where: {
      OR: [
        { issuedTo: req.user.id },
        { issuedBy: req.user.id },
      ],
    },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: giftCards,
  });
});

const purchaseGiftCard = asyncHandler(async (req, res) => {
  const { amount, recipientEmail } = req.body;

  // Generate unique code
  const code = `GC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      amount: parseFloat(amount),
      balance: parseFloat(amount),
      issuedTo: recipientEmail, // Could be user ID or email
      issuedBy: req.user.id,
      status: 'ACTIVE',
    },
  });

  // TODO: Process payment for gift card
  // TODO: Send email to recipient

  res.status(201).json({
    success: true,
    data: giftCard,
  });
});

const redeemGiftCard = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const giftCard = await prisma.giftCard.findUnique({
    where: { code },
  });

  if (!giftCard || giftCard.status !== 'ACTIVE') {
    return res.status(400).json({
      success: false,
      error: 'Invalid or inactive gift card',
    });
  }

  if (giftCard.balance <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Gift card has no balance',
    });
  }

  if (giftCard.expiryDate && giftCard.expiryDate < new Date()) {
    return res.status(400).json({
      success: false,
      error: 'Gift card has expired',
    });
  }

  res.json({
    success: true,
    data: {
      code: giftCard.code,
      balance: giftCard.balance,
    },
  });
});

module.exports = {
  getDigitalProduct,
  downloadDigitalProduct,
  getSubscriptions,
  createSubscription,
  createPreOrder,
  getPreOrders,
  getGiftCards,
  purchaseGiftCard,
  redeemGiftCard,
};


