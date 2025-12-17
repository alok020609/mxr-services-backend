const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const register = async (userData) => {
  const { email, password, firstName, lastName, phone } = userData;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate verification token
  const verificationToken = generateVerificationToken();

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      verificationToken,
      emailVerified: false,
    },
  });

  // TODO: Send verification email

  logger.info(`New user registered: ${email}`);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    emailVerified: user.emailVerified,
  };
};

const login = async (email, password, ipAddress, userAgent) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        success: false,
        failureReason: 'User not found',
      },
    });
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        success: false,
        failureReason: 'Account inactive',
      },
    });
    throw new Error('Account is inactive');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        success: false,
        failureReason: 'Invalid password',
      },
    });
    throw new Error('Invalid credentials');
  }

  // Log successful login
  await prisma.loginAttempt.create({
    data: {
      email,
      ipAddress,
      success: true,
    },
  });

  // Generate tokens
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  logger.info(`User logged in: ${email}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    token,
    refreshToken,
  };
};

const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new Error('Invalid verification token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  });

  logger.info(`Email verified: ${user.email}`);

  return { message: 'Email verified successfully' };
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists
    return { message: 'If email exists, password reset link has been sent' };
  }

  const resetToken = generateResetToken();
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires,
    },
  });

  // TODO: Send password reset email

  logger.info(`Password reset requested: ${email}`);

  return { message: 'If email exists, password reset link has been sent' };
};

const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  logger.info(`Password reset: ${user.email}`);

  return { message: 'Password reset successfully' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });

  logger.info(`Password changed: ${user.email}`);

  return { message: 'Password changed successfully' };
};

const refreshToken = async (refreshToken) => {
  const session = await prisma.session.findFirst({
    where: {
      token: refreshToken,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!session || !session.user.isActive) {
    throw new Error('Invalid or expired refresh token');
  }

  const token = generateToken({
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  });

  return { token };
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  hashPassword,
  comparePassword,
};


