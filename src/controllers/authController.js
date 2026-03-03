const authService = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendVerificationEmail } = require('../utils/email');

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

const loginWithGoogle = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  const idToken = req.body.idToken || req.body.id_token;
  const result = await authService.loginWithGoogle(idToken, ipAddress, userAgent);
  res.json({
    success: true,
    data: result,
  });
});

const loginWithMicrosoft = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  const idToken = req.body.idToken || req.body.id_token;
  const result = await authService.loginWithMicrosoft(idToken, ipAddress, userAgent);
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
  const result = await authService.resendVerificationEmail(req.body.email);
  res.json({
    success: true,
    message: result.message,
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
  const { firstName, lastName, phone, email } = req.body;
  
  // Build update data object with only provided fields
  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  
  // Handle email update - if email is changed, require verification
  if (email !== undefined && email !== req.user.email) {
    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use',
      });
    }
    
    updateData.email = email;
    updateData.emailVerified = false; // Require verification for new email
    
    // Generate new verification token for the new email
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    updateData.verificationToken = verificationToken;
    
    // Send verification email to new address (after user is updated)
    // We'll send it after the update completes
  }
  
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
      role: true,
      verificationToken: true,
    },
  });
  
  // Send verification email if email was changed
  if (email && email !== req.user.email && user.verificationToken) {
    await sendVerificationEmail(user.email, user.verificationToken, user.firstName || '');
  }
  
  // Remove verificationToken from response for security
  const { verificationToken, ...userResponse } = user;
  
  res.json({
    success: true,
    message: email && email !== req.user.email 
      ? 'Profile updated. Please verify your new email address.'
      : 'Profile updated successfully',
    data: userResponse,
  });
});

module.exports = {
  register,
  login,
  loginWithGoogle,
  loginWithMicrosoft,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  getProfile,
  updateProfile,
};


