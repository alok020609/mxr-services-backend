const authService = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({
    success: true,
    data: user,
    message: 'Registration successful. Please verify your email.',
  });
});

const login = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  const result = await authService.login(req.body.email, req.body.password, ipAddress, userAgent);
  res.json({
    success: true,
    data: result,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.params.token);
  res.json({
    success: true,
    message: result.message,
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  // TODO: Implement resend verification
  res.json({
    success: true,
    message: 'Verification email sent',
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json({
    success: true,
    message: result.message,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json({
    success: true,
    message: result.message,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.json({
    success: true,
    message: result.message,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  res.json({
    success: true,
    data: result,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const prisma = require('../config/database');
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      addresses: true,
    },
  });
  res.json({
    success: true,
    data: user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const prisma = require('../config/database');
  const { firstName, lastName, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName,
      lastName,
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
      role: true,
    },
  });
  res.json({
    success: true,
    data: user,
  });
});

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  getProfile,
  updateProfile,
};


