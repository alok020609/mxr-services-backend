const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/redis');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment endpoint rate limiter
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many payment attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Coupon/Code rate limiter (prevent brute force)
const couponLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many coupon attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Account creation rate limiter
const accountCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many account creation attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Redis-based distributed rate limiter
const createRedisRateLimiter = (keyPrefix, maxRequests, windowMs) => {
  return async (req, res, next) => {
    try {
      const client = getRedisClient();
      const identifier = req.user?.id || req.ip;
      const key = `${keyPrefix}:${identifier}`;

      const current = await client.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      await client.incr(key);
      await client.expire(key, Math.ceil(windowMs / 1000));

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - count - 1),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
      });

      next();
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      next(); // Fail open
    }
  };
};

// Tier-based rate limiter
const tierBasedLimiter = (tier) => {
  const limits = {
    FREE: { max: 100, windowMs: 15 * 60 * 1000 },
    BASIC: { max: 500, windowMs: 15 * 60 * 1000 },
    PREMIUM: { max: 2000, windowMs: 15 * 60 * 1000 },
    ENTERPRISE: { max: 10000, windowMs: 15 * 60 * 1000 },
  };

  const limit = limits[tier] || limits.FREE;

  return rateLimit({
    windowMs: limit.windowMs,
    max: limit.max,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  apiLimiter,
  strictLimiter,
  paymentLimiter,
  couponLimiter,
  accountCreationLimiter,
  createRedisRateLimiter,
  tierBasedLimiter,
};

