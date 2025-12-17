const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// 2FA/MFA
const setup2FA = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const secret = speakeasy.generateSecret({
    name: `${user.email} (E-commerce)`,
  });

  // Store temporary secret (user needs to verify before enabling)
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
    },
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    data: {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    },
  });
});

const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user.twoFactorSecret) {
    return res.status(400).json({
      success: false,
      error: '2FA not set up',
    });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
  });

  if (verified) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: true,
      },
    });

    res.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

const disable2FA = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  res.json({
    success: true,
    message: '2FA disabled',
  });
});

// Device Management
const getDevices = asyncHandler(async (req, res) => {
  const devices = await prisma.device.findMany({
    where: { userId: req.user.id },
    orderBy: { lastUsedAt: 'desc' },
  });

  res.json({
    success: true,
    data: devices,
  });
});

const removeDevice = asyncHandler(async (req, res) => {
  await prisma.device.deleteMany({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  res.json({
    success: true,
    message: 'Device removed',
  });
});

// Session Management
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: { userId: req.user.id },
    orderBy: { lastActivityAt: 'desc' },
  });

  res.json({
    success: true,
    data: sessions,
  });
});

const revokeSession = asyncHandler(async (req, res) => {
  await prisma.session.deleteMany({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  res.json({
    success: true,
    message: 'Session revoked',
  });
});

const revokeAllSessions = asyncHandler(async (req, res) => {
  await prisma.session.deleteMany({
    where: { userId: req.user.id },
  });

  res.json({
    success: true,
    message: 'All sessions revoked',
  });
});

// Login Attempts
const getLoginAttempts = asyncHandler(async (req, res) => {
  const attempts = await prisma.loginAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    success: true,
    data: attempts,
  });
});

// API Keys
const getAPIKeys = asyncHandler(async (req, res) => {
  const apiKeys = await prisma.aPIKey.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      // Don't expose the actual key
    })),
  });
});

const createAPIKey = asyncHandler(async (req, res) => {
  const { name, expiresAt } = req.body;

  // Generate API key
  const apiKey = `sk_${require('crypto').randomBytes(32).toString('hex')}`;
  const hashedKey = require('crypto').createHash('sha256').update(apiKey).digest('hex');

  const key = await prisma.aPIKey.create({
    data: {
      userId: req.user.id,
      name,
      keyHash: hashedKey,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      id: key.id,
      apiKey, // Only show once
      name: key.name,
      expiresAt: key.expiresAt,
    },
    message: 'API key created. Store it securely - it will not be shown again.',
  });
});

const revokeAPIKey = asyncHandler(async (req, res) => {
  await prisma.aPIKey.deleteMany({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  res.json({
    success: true,
    message: 'API key revoked',
  });
});

module.exports = {
  setup2FA,
  verify2FA,
  disable2FA,
  getDevices,
  removeDevice,
  getSessions,
  revokeSession,
  revokeAllSessions,
  getLoginAttempts,
  getAPIKeys,
  createAPIKey,
  revokeAPIKey,
};


