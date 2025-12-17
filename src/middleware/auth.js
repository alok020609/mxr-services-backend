const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token, authorization denied' });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
  }
};

const vendor = (req, res, next) => {
  if (req.user && (req.user.role === 'VENDOR' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access denied. Vendor or Admin only.' });
  }
};

module.exports = { auth, admin, vendor };


