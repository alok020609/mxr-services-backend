const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId: req.user.id,
    ...(isRead !== undefined && { isRead: isRead === 'true' }),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  res.json({
    success: true,
    data: notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    data: { isRead: true },
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await prisma.notification.deleteMany({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  res.json({
    success: true,
    message: 'Notification deleted',
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: {
      userId: req.user.id,
      isRead: false,
    },
  });

  res.json({
    success: true,
    data: { count },
  });
});

const updatePreferences = asyncHandler(async (req, res) => {
  // TODO: Implement notification preferences
  res.json({
    success: true,
    message: 'Preferences updated',
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  updatePreferences,
};


