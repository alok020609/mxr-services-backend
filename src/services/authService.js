const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const jwksClient = require('jwks-rsa');
const prisma = require('../config/database');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

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
  const { email, password, firstName, lastName, phone, isAdmin } = userData;

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

  // Determine user role based on isAdmin flag
  const role = isAdmin === true ? 'ADMIN' : 'USER';

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
      role,
    },
  });

  // Send verification email
  await sendVerificationEmail(email, verificationToken, firstName || '');

  logger.info(`New user registered: ${email} with role: ${role}`);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
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

  // Send password reset email
  await sendPasswordResetEmail(email, resetToken, user.firstName || '');

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

const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists (security best practice)
    return { message: 'If email exists, verification email has been sent' };
  }

  // Generate new verification token if user doesn't have one or if already verified (allow re-verification)
  let verificationToken = user.verificationToken;
  
  if (!verificationToken) {
    verificationToken = generateVerificationToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        emailVerified: false, // Reset verification status when resending
      },
    });
  }

  // Send verification email
  await sendVerificationEmail(email, verificationToken, user.firstName || '');

  logger.info(`Verification email resent to: ${email}`);

  return { message: 'If email exists, verification email has been sent' };
};

/**
 * Create session and return same shape as login (used by social login).
 */
const createSessionAndReturnTokens = async (user, ipAddress, userAgent) => {
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
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

/**
 * Verify Google id_token and find or create user, then return tokens.
 */
const loginWithGoogle = async (idToken, ipAddress, userAgent) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const e = new Error('Google sign-in is not configured');
    e.statusCode = 503;
    throw e;
  }
  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    payload = ticket.getPayload();
  } catch (err) {
    logger.warn('Google id_token verification failed', { error: err.message });
    const e = new Error('Invalid Google token');
    e.statusCode = 401;
    throw e;
  }
  const { sub: googleId, email, name } = payload || {};
  if (!email) {
    const e = new Error('Invalid Google token: missing email');
    e.statusCode = 401;
    throw e;
  }

  let user = await prisma.user.findUnique({ where: { googleId } });
  if (user) {
    if (!user.isActive) {
      const e = new Error('Account is inactive');
      e.statusCode = 401;
      throw e;
    }
    logger.info(`User logged in with Google: ${email}`);
    return createSessionAndReturnTokens(user, ipAddress, userAgent);
  }

  user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    if (!user.isActive) {
      const e = new Error('Account is inactive');
      e.statusCode = 401;
      throw e;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { googleId },
    });
    logger.info(`User linked Google and logged in: ${email}`);
    return createSessionAndReturnTokens({ ...user, googleId }, ipAddress, userAgent);
  }

  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
  const randomPassword = crypto.randomBytes(32).toString('hex');
  const hashedPassword = await hashPassword(randomPassword);
  user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      googleId,
      role: 'USER',
      emailVerified: true,
    },
  });
  logger.info(`New user registered via Google: ${email}`);
  return createSessionAndReturnTokens(user, ipAddress, userAgent);
};

/**
 * Verify Microsoft id_token and find or create user, then return tokens.
 */
const loginWithMicrosoft = async (idToken, ipAddress, userAgent) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
  if (!clientId) {
    const e = new Error('Microsoft sign-in is not configured');
    e.statusCode = 503;
    throw e;
  }
  const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
  const client = jwksClient({ jwksUri, cache: true, rateLimit: true });

  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err);
        return;
      }
      const signingKey = key?.publicKey || key?.rsaPublicKey;
      callback(null, signingKey);
    });
  };

  const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
  let payload;
  try {
    payload = await new Promise((resolve, reject) => {
      jwt.verify(idToken, getKey, {
        audience: clientId,
        issuer,
        algorithms: ['RS256'],
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  } catch (err) {
    logger.warn('Microsoft id_token verification failed', { error: err.message });
    const e = new Error('Invalid Microsoft token');
    e.statusCode = 401;
    throw e;
  }

  const microsoftId = payload.oid || payload.sub;
  const email = payload.email || payload.preferred_username;
  if (!email) {
    const e = new Error('Invalid Microsoft token: missing email');
    e.statusCode = 401;
    throw e;
  }
  const name = payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(' ') || null;
  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

  let user = await prisma.user.findUnique({ where: { microsoftId } });
  if (user) {
    if (!user.isActive) {
      const e = new Error('Account is inactive');
      e.statusCode = 401;
      throw e;
    }
    logger.info(`User logged in with Microsoft: ${email}`);
    return createSessionAndReturnTokens(user, ipAddress, userAgent);
  }

  user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    if (!user.isActive) {
      const e = new Error('Account is inactive');
      e.statusCode = 401;
      throw e;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { microsoftId },
    });
    logger.info(`User linked Microsoft and logged in: ${email}`);
    return createSessionAndReturnTokens({ ...user, microsoftId }, ipAddress, userAgent);
  }

  const randomPassword = crypto.randomBytes(32).toString('hex');
  const hashedPassword = await hashPassword(randomPassword);
  user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      microsoftId,
      role: 'USER',
      emailVerified: true,
    },
  });
  logger.info(`New user registered via Microsoft: ${email}`);
  return createSessionAndReturnTokens(user, ipAddress, userAgent);
};

module.exports = {
  register,
  login,
  loginWithGoogle,
  loginWithMicrosoft,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  resendVerificationEmail,
  hashPassword,
  comparePassword,
};


