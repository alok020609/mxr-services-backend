const prisma = require('../config/database');
const { verifyToken } = require('../utils/jwt');

/**
 * Authenticate request using Bearer JWT. Sets req.user (without password).
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization header missing or invalid' });
    }
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        isActive: true,
        apiTier: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account is inactive' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
    }
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

/**
 * Require req.user.role === 'ADMIN'. Use after auth.
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

/**
 * Require req.user.role === 'VENDOR'. Use after auth.
 */
const vendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (req.user.role !== 'VENDOR') {
    return res.status(403).json({ success: false, error: 'Vendor access required' });
  }
  next();
};

module.exports = {
  auth,
  admin,
  vendor,
};
