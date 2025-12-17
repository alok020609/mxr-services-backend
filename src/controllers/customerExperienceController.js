const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// Product Q&A
const getProductQuestions = asyncHandler(async (req, res) => {
  const questions = await prisma.productQuestion.findMany({
    where: {
      productId: req.params.productId,
      answer: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: questions,
  });
});

const askQuestion = asyncHandler(async (req, res) => {
  const { productId, question } = req.body;

  const productQuestion = await prisma.productQuestion.create({
    data: {
      productId,
      userId: req.user.id,
      question,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: productQuestion,
  });
});

// Size Guide
const getSizeGuide = asyncHandler(async (req, res) => {
  const sizeGuide = await prisma.sizeGuide.findFirst({
    where: { productId: req.params.productId },
  });

  if (!sizeGuide) {
    return res.status(404).json({
      success: false,
      error: 'Size guide not found',
    });
  }

  res.json({
    success: true,
    data: sizeGuide,
  });
});

// Product Videos
const getProductVideos = asyncHandler(async (req, res) => {
  const videos = await prisma.productVideo.findMany({
    where: { productId: req.params.productId },
    orderBy: { order: 'asc' },
  });

  res.json({
    success: true,
    data: videos,
  });
});

// Social Proof
const getSocialProof = asyncHandler(async (req, res) => {
  const socialProof = await prisma.socialProof.findMany({
    where: { productId: req.params.productId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  res.json({
    success: true,
    data: socialProof,
  });
});

// Recently Viewed
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const recentlyViewed = await prisma.recentlyViewed.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          category: true,
          inventory: true,
        },
      },
    },
    orderBy: { viewedAt: 'desc' },
    take: 20,
  });

  res.json({
    success: true,
    data: recentlyViewed,
  });
});

// Waitlist
const addToWaitlist = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.body;

  const waitlist = await prisma.waitlist.upsert({
    where: {
      userId_productId_variantId: {
        userId: req.user.id,
        productId,
        variantId: variantId || null,
      },
    },
    update: {},
    create: {
      userId: req.user.id,
      productId,
      variantId,
      notified: false,
    },
    include: {
      product: true,
      variant: true,
    },
  });

  res.status(201).json({
    success: true,
    data: waitlist,
  });
});

const getWaitlist = asyncHandler(async (req, res) => {
  const waitlist = await prisma.waitlist.findMany({
    where: { userId: req.user.id },
    include: {
      product: true,
      variant: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: waitlist,
  });
});

// Product Alerts
const createProductAlert = asyncHandler(async (req, res) => {
  const { productId, type, threshold } = req.body;

  const alert = await prisma.productAlert.upsert({
    where: {
      userId_productId_type: {
        userId: req.user.id,
        productId,
        type,
      },
    },
    update: {
      threshold: threshold ? parseFloat(threshold) : null,
      notified: false,
    },
    create: {
      userId: req.user.id,
      productId,
      type,
      threshold: threshold ? parseFloat(threshold) : null,
      notified: false,
    },
    include: {
      product: true,
    },
  });

  res.status(201).json({
    success: true,
    data: alert,
  });
});

const getProductAlerts = asyncHandler(async (req, res) => {
  const alerts = await prisma.productAlert.findMany({
    where: { userId: req.user.id },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: alerts,
  });
});

module.exports = {
  getProductQuestions,
  askQuestion,
  getSizeGuide,
  getProductVideos,
  getSocialProof,
  getRecentlyViewed,
  addToWaitlist,
  getWaitlist,
  createProductAlert,
  getProductAlerts,
};


