const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// Social Login
const socialLogin = asyncHandler(async (req, res) => {
  const { provider, accessToken } = req.body;

  // TODO: Verify token with provider and get user info
  // For now, this is a placeholder
  res.json({
    success: true,
    message: `Social login with ${provider} - implementation needed`,
  });
});

// Share product
const shareProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { platform, message } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      images: true,
      price: true,
    },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found',
    });
  }

  // Record share (TODO: Add SocialShare model to Prisma schema)
  // await prisma.socialShare.create({
  //   data: {
  //     userId: req.user?.id,
  //     productId,
  //     platform,
  //     message,
  //   },
  // });

  res.json({
    success: true,
    data: {
      shareUrl: `${process.env.FRONTEND_URL}/products/${productId}`,
      product,
    },
  });
});

// Get user-generated content
const getUserGeneratedContent = asyncHandler(async (req, res) => {
  const { productId, type } = req.query;

  const where = {
    isApproved: true,
    ...(productId && { productId }),
    ...(type && { type }),
  };

  // TODO: Add UserGeneratedContent model to Prisma schema
  const content = []; // await prisma.userGeneratedContent.findMany({
  //   where,
  //   include: {
  //     user: {
  //       select: {
  //         id: true,
  //         name: true,
  //         avatar: true,
  //       },
  //     },
  //     product: {
  //       select: {
  //         id: true,
  //         name: true,
  //       },
  //     },
  //   },
  //   orderBy: { createdAt: 'desc' },
  //   take: 50,
  // });

  res.json({
    success: true,
    data: content,
  });
});

// Submit user-generated content
const submitUserGeneratedContent = asyncHandler(async (req, res) => {
  const { productId, type, content, mediaUrls } = req.body;

  // TODO: Add UserGeneratedContent model to Prisma schema
  const ugc = {
    id: 'temp-id',
    userId: req.user.id,
    productId,
    type,
    content,
    mediaUrls: mediaUrls || [],
    status: 'PENDING',
    createdAt: new Date(),
  };

  res.status(201).json({
    success: true,
    data: ugc,
    message: 'Content submitted for review',
  });
});

// Get influencer tracking
const getInfluencerTracking = asyncHandler(async (req, res) => {
  const { influencerId, startDate, endDate } = req.query;

  const where = {
    ...(influencerId && { influencerId }),
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  // TODO: Add InfluencerTracking model to Prisma schema
  const tracking = [];

  res.json({
    success: true,
    data: tracking,
  });
});

module.exports = {
  socialLogin,
  shareProduct,
  getUserGeneratedContent,
  submitUserGeneratedContent,
  getInfluencerTracking,
};

