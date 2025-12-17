const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
    },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      minPurchase: true,
      maxDiscount: true,
      validFrom: true,
      validUntil: true,
    },
  });

  res.json({
    success: true,
    data: coupons,
  });
});

const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: req.params.code,
      isActive: true,
    },
  });

  if (!coupon) {
    return res.status(404).json({
      success: false,
      error: 'Coupon not found',
    });
  }

  res.json({
    success: true,
    data: coupon,
  });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;

  const coupon = await prisma.coupon.findFirst({
    where: {
      code,
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
    },
  });

  if (!coupon) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired coupon',
    });
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({
      success: false,
      error: 'Coupon usage limit reached',
    });
  }

  // Check minimum purchase
  if (coupon.minPurchase && amount < coupon.minPurchase) {
    return res.status(400).json({
      success: false,
      error: `Minimum purchase of ${coupon.minPurchase} required`,
    });
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discount = (amount * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }

  res.json({
    success: true,
    data: {
      coupon,
      discount,
    },
  });
});

const getMyCoupons = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
    },
    include: {
      _count: {
        select: {
          usages: {
            where: {
              userId: req.user.id,
            },
          },
        },
      },
    },
  });

  // Filter out coupons already used by user
  const availableCoupons = coupons.filter(
    (coupon) => coupon._count.usages === 0 || !coupon.usageLimit
  );

  res.json({
    success: true,
    data: availableCoupons,
  });
});

module.exports = {
  getCoupons,
  getCoupon,
  validateCoupon,
  getMyCoupons,
};


