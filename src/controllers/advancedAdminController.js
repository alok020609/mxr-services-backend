const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const addOrderNote = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { note, isInternal } = req.body;

  const orderNote = await prisma.orderNote.create({
    data: {
      orderId,
      adminId: req.user.id,
      note,
      isInternal: isInternal !== undefined ? isInternal : true,
    },
  });

  res.status(201).json({
    success: true,
    data: orderNote,
  });
});

const getOrderNotes = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const notes = await prisma.orderNote.findMany({
    where: { orderId },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: notes,
  });
});

const assignOrderTask = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { assignedTo, task, priority } = req.body;

  // TODO: Add AdminTask model to Prisma schema
  const taskAssignment = {
    id: 'temp-id',
    orderId,
    assignedBy: req.user.id,
    assignedTo,
    task,
    priority: priority || 'MEDIUM',
    status: 'PENDING',
    createdAt: new Date(),
  };

  res.status(201).json({
    success: true,
    data: taskAssignment,
  });
});

const getAdminActivityFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, adminId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(adminId && { adminId }),
  };

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activityLog.count({ where }),
  ]);

  res.json({
    success: true,
    data: activities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getAdminNotifications = asyncHandler(async (req, res) => {
  // TODO: Add AdminNotification model to Prisma schema
  const notifications = [];

  res.json({
    success: true,
    data: notifications,
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  // TODO: Add AdminNotification model to Prisma schema
  // await prisma.adminNotification.update({
  //   where: { id: notificationId },
  //   data: {
  //     isRead: true,
  //     readAt: new Date(),
  //   },
  // });

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

const getAdminSavedFilters = asyncHandler(async (req, res) => {
  // TODO: Add AdminSavedFilter model to Prisma schema
  const filters = [];

  res.json({
    success: true,
    data: filters,
  });
});

const saveAdminFilter = asyncHandler(async (req, res) => {
  const { name, entity, filters } = req.body;

  // TODO: Add AdminSavedFilter model to Prisma schema
  const savedFilter = {
    id: 'temp-id',
    adminId: req.user.id,
    name,
    entity,
    filters: filters || {},
    createdAt: new Date(),
  };

  res.status(201).json({
    success: true,
    data: savedFilter,
  });
});

module.exports = {
  addOrderNote,
  getOrderNotes,
  assignOrderTask,
  getAdminActivityFeed,
  getAdminNotifications,
  markNotificationRead,
  getAdminSavedFilters,
  saveAdminFilter,
};

