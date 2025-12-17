const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const pauseSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { reason } = req.body;

  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId: req.user.id,
    },
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: 'Subscription not found',
    });
  }

  const pausedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'PAUSED',
      pausedAt: new Date(),
      pauseReason: reason,
    },
  });

  res.json({
    success: true,
    data: pausedSubscription,
  });
});

const resumeSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId: req.user.id,
    },
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: 'Subscription not found',
    });
  }

  // Calculate new dates based on pause duration
  const pauseDuration = subscription.pausedAt
    ? Math.floor((new Date() - subscription.pausedAt) / (1000 * 60 * 60 * 24))
    : 0;

  const newEndDate = new Date(subscription.endDate);
  newEndDate.setDate(newEndDate.getDate() + pauseDuration);

  const resumedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'ACTIVE',
      pausedAt: null,
      pauseReason: null,
      endDate: newEndDate,
    },
  });

  res.json({
    success: true,
    data: resumedSubscription,
  });
});

const skipNextDelivery = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId: req.user.id,
    },
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: 'Subscription not found',
    });
  }

  // Calculate next billing date after skip
  let nextBillingDate = new Date(subscription.nextBillingDate);
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: subscription.planId },
  });

  switch (plan.interval) {
    case 'WEEKLY':
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
      break;
    case 'MONTHLY':
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      break;
    case 'QUARTERLY':
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      break;
    case 'YEARLY':
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      break;
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      skipNextDelivery: true,
      nextBillingDate,
    },
  });

  res.json({
    success: true,
    data: updatedSubscription,
  });
});

const changeFrequency = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { planId } = req.body;

  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId: req.user.id,
    },
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: 'Subscription not found',
    });
  }

  const newPlan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!newPlan) {
    return res.status(404).json({
      success: false,
      error: 'Plan not found',
    });
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      planId,
    },
  });

  res.json({
    success: true,
    data: updatedSubscription,
  });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { reason, retentionOffer } = req.body;

  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId: req.user.id,
    },
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: 'Subscription not found',
    });
  }

  // If retention offer accepted, don't cancel
  if (retentionOffer && retentionOffer.accepted) {
    return res.json({
      success: true,
      message: 'Subscription retained with offer',
      data: subscription,
    });
  }

  const cancelledSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });

  res.json({
    success: true,
    data: cancelledSubscription,
  });
});

module.exports = {
  pauseSubscription,
  resumeSubscription,
  skipNextDelivery,
  changeFrequency,
  cancelSubscription,
};


