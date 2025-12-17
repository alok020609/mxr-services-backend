const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: req.user.id,
      productId,
    },
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      error: 'You have already reviewed this product',
    });
  }

  const review = await prisma.review.create({
    data: {
      userId: req.user.id,
      productId,
      rating,
      comment,
      status: 'PENDING',
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
    data: review,
  });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        productId: req.params.productId,
        status: 'APPROVED',
      },
      skip,
      take: parseInt(limit),
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
    }),
    prisma.review.count({
      where: {
        productId: req.params.productId,
        status: 'APPROVED',
      },
    }),
  ]);

  // Calculate average rating
  const avgRating = await prisma.review.aggregate({
    where: {
      productId: req.params.productId,
      status: 'APPROVED',
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  res.json({
    success: true,
    data: reviews,
    meta: {
      averageRating: avgRating._avg.rating || 0,
      totalReviews: avgRating._count.rating || 0,
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      error: 'Review not found',
    });
  }

  const updatedReview = await prisma.review.update({
    where: { id: review.id },
    data: req.body,
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

  res.json({
    success: true,
    data: updatedReview,
  });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      error: 'Review not found',
    });
  }

  await prisma.review.delete({
    where: { id: review.id },
  });

  res.json({
    success: true,
    message: 'Review deleted',
  });
});

const markHelpful = asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { id: req.params.id },
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      error: 'Review not found',
    });
  }

  const updatedReview = await prisma.review.update({
    where: { id: review.id },
    data: {
      helpfulCount: review.helpfulCount + 1,
    },
  });

  res.json({
    success: true,
    data: updatedReview,
  });
});

const reportReview = asyncHandler(async (req, res) => {
  // TODO: Implement review reporting
  res.json({
    success: true,
    message: 'Review reported',
  });
});

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
};


