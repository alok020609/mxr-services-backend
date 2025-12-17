const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const trackOrderWithoutLogin = asyncHandler(async (req, res) => {
  const { orderNumber, email } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      email,
    },
    include: {
      tracking: {
        orderBy: { createdAt: 'desc' },
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
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      tracking: order.tracking,
      items: order.items,
    },
  });
});

const getKnowledgeBase = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isPublished: true,
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // TODO: Add KnowledgeBaseArticle model to Prisma schema
  const articles = [];
  const total = 0;

  res.json({
    success: true,
    data: articles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getTroubleshootingGuides = asyncHandler(async (req, res) => {
  // TODO: Add TroubleshootingGuide model to Prisma schema
  const guides = [];

  res.json({
    success: true,
    data: guides,
  });
});

const scheduleCallback = asyncHandler(async (req, res) => {
  const { preferredDate, preferredTime, phoneNumber, reason } = req.body;

  // TODO: Add CallbackRequest model to Prisma schema
  const callback = {
    id: 'temp-id',
    userId: req.user?.id,
    phoneNumber,
    preferredDate: new Date(preferredDate),
    preferredTime,
    reason,
    status: 'PENDING',
    createdAt: new Date(),
  };

  res.status(201).json({
    success: true,
    data: callback,
    message: 'Callback request submitted',
  });
});

const getVideoTutorials = asyncHandler(async (req, res) => {
  const { category } = req.query;

  // TODO: Add VideoTutorial model to Prisma schema
  const tutorials = [];

  res.json({
    success: true,
    data: tutorials,
  });
});

module.exports = {
  trackOrderWithoutLogin,
  getKnowledgeBase,
  getTroubleshootingGuides,
  scheduleCallback,
  getVideoTutorials,
};

