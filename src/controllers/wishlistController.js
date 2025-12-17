const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          category: true,
          inventory: true,
          variants: {
            where: { isActive: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: wishlist,
  });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const wishlistItem = await prisma.wishlist.upsert({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId,
      },
    },
    update: {},
    create: {
      userId: req.user.id,
      productId,
    },
    include: {
      product: true,
    },
  });

  res.status(201).json({
    success: true,
    data: wishlistItem,
  });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  await prisma.wishlist.deleteMany({
    where: {
      userId: req.user.id,
      productId: req.params.productId,
    },
  });

  res.json({
    success: true,
    message: 'Item removed from wishlist',
  });
});

const checkWishlist = asyncHandler(async (req, res) => {
  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId: req.params.productId,
      },
    },
  });

  res.json({
    success: true,
    data: {
      inWishlist: !!wishlistItem,
    },
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};


