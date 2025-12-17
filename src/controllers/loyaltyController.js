const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getPoints = asyncHandler(async (req, res) => {
  const points = await prisma.loyaltyPoints.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Calculate current balance
  const balance = await prisma.loyaltyPoints.aggregate({
    where: { userId: req.user.id },
    _sum: { points: true },
  });

  res.json({
    success: true,
    data: {
      balance: balance._sum.points || 0,
      transactions: points,
    },
  });
});

const getTiers = asyncHandler(async (req, res) => {
  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { minPoints: 'asc' },
  });

  // Get user's current tier
  const userPoints = await prisma.loyaltyPoints.aggregate({
    where: { userId: req.user.id },
    _sum: { points: true },
  });

  const totalPoints = userPoints._sum.points || 0;
  const currentTier = tiers.find((tier) => totalPoints >= tier.minPoints) || tiers[0];

  res.json({
    success: true,
    data: {
      tiers,
      currentTier,
      totalPoints,
    },
  });
});

const getRewards = asyncHandler(async (req, res) => {
  const rewards = await prisma.loyaltyReward.findMany({
    where: { isActive: true },
    orderBy: { pointsRequired: 'asc' },
  });

  res.json({
    success: true,
    data: rewards,
  });
});

const redeemReward = asyncHandler(async (req, res) => {
  const { rewardId } = req.body;

  const reward = await prisma.loyaltyReward.findUnique({
    where: { id: rewardId },
  });

  if (!reward || !reward.isActive) {
    return res.status(404).json({
      success: false,
      error: 'Reward not found',
    });
  }

  // Check stock
  if (reward.stock !== null && reward.stock <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Reward out of stock',
    });
  }

  // Get user points
  const userPoints = await prisma.loyaltyPoints.aggregate({
    where: { userId: req.user.id },
    _sum: { points: true },
  });

  const totalPoints = userPoints._sum.points || 0;

  if (totalPoints < reward.pointsRequired) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient points',
    });
  }

  // Create redemption transaction
  await prisma.loyaltyPoints.create({
    data: {
      userId: req.user.id,
      points: -reward.pointsRequired,
      balance: totalPoints - reward.pointsRequired,
      type: 'REDEEMED',
      referenceId: reward.id,
      referenceType: 'LOYALTY_REWARD',
    },
  });

  // Update reward stock
  if (reward.stock !== null) {
    await prisma.loyaltyReward.update({
      where: { id: rewardId },
      data: {
        stock: reward.stock - 1,
      },
    });
  }

  res.json({
    success: true,
    message: 'Reward redeemed successfully',
    data: {
      reward,
      pointsRemaining: totalPoints - reward.pointsRequired,
    },
  });
});

const getReferralCode = asyncHandler(async (req, res) => {
  let referral = await prisma.referral.findFirst({
    where: {
      referrerId: req.user.id,
    },
  });

  if (!referral) {
    // Generate unique code
    const code = `REF-${req.user.id.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    referral = await prisma.referral.create({
      data: {
        referrerId: req.user.id,
        referredId: req.user.id, // Placeholder, will be updated when someone uses it
        code,
        status: 'ACTIVE',
      },
    });
  }

  res.json({
    success: true,
    data: {
      code: referral.code,
      totalReferrals: await prisma.referral.count({
        where: {
          referrerId: req.user.id,
          status: 'COMPLETED',
        },
      }),
    },
  });
});

const applyReferralCode = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const referral = await prisma.referral.findUnique({
    where: { code },
  });

  if (!referral) {
    return res.status(400).json({
      success: false,
      error: 'Invalid referral code',
    });
  }

  if (referral.referrerId === req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Cannot use your own referral code',
    });
  }

  // Check if user already used a referral code
  const existingReferral = await prisma.referral.findFirst({
    where: {
      referredId: req.user.id,
      status: 'COMPLETED',
    },
  });

  if (existingReferral) {
    return res.status(400).json({
      success: false,
      error: 'You have already used a referral code',
    });
  }

  // Update referral
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      referredId: req.user.id,
      status: 'PENDING',
    },
  });

  res.json({
    success: true,
    message: 'Referral code applied successfully',
  });
});

module.exports = {
  getPoints,
  getTiers,
  getRewards,
  redeemReward,
  getReferralCode,
  applyReferralCode,
};


