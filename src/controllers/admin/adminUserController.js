const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const authService = require('../../services/authService');

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      addresses: true,
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  const hashedPassword = await authService.hashPassword(password || 'temp123');

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'USER',
      emailVerified: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  res.status(201).json({
    success: true,
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, role, isActive } = req.body;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      firstName,
      lastName,
      phone,
      role,
      isActive,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'User deactivated',
  });
});

const verifyUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { emailVerified: true },
  });

  res.json({
    success: true,
    data: user,
  });
});

const activateUser = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive },
  });

  res.json({
    success: true,
    data: user,
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
  });

  res.json({
    success: true,
    data: user,
  });
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await authService.hashPassword(password);

  await prisma.user.update({
    where: { id: req.params.id },
    data: { password: hashedPassword },
  });

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  verifyUser,
  activateUser,
  updateUserRole,
  resetUserPassword,
};


