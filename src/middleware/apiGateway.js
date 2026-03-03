const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');

// API Versioning middleware
const apiVersioning = (req, res, next) => {
  // Support both URL versioning (/api/v1/...) and header versioning (X-API-Version)
  const urlVersion = req.path.match(/\/v(\d+)\//)?.[1];
  const headerVersion = req.headers['x-api-version'];

  req.apiVersion = urlVersion || headerVersion || process.env.API_VERSION || 'v1';
  next();
};

// API Deprecation middleware
const apiDeprecation = (req, res, next) => {
  // Check if endpoint is deprecated
  const deprecatedEndpoints = {
    '/api/v1/old-endpoint': {
      deprecated: true,
      sunsetDate: '2024-12-31',
      replacement: '/api/v1/new-endpoint',
    },
  };

  const endpoint = req.path;
  const deprecationInfo = deprecatedEndpoints[endpoint];

  if (deprecationInfo && deprecationInfo.deprecated) {
    res.set('Deprecation', 'true');
    res.set('Sunset', deprecationInfo.sunsetDate);
    if (deprecationInfo.replacement) {
      res.set('Link', `<${deprecationInfo.replacement}>; rel="successor-version"`);
    }
    logger.warn(`Deprecated endpoint accessed: ${endpoint}`);
  }

  next();
};

// Request transformation middleware
const requestTransformation = (req, res, next) => {
  // Transform request based on API version
  if (req.apiVersion === 'v2') {
    // Example: Transform v1 request format to v2
    if (req.body && req.body.oldField) {
      req.body.newField = req.body.oldField;
      delete req.body.oldField;
    }
  }
  next();
};

// Tier-based rate limiting
const createTierRateLimiter = (tier, maxRequests, windowMs) => {
  return async (req, res, next) => {
    const client = getRedisClient();
    const identifier = req.user?.id || req.ip;
    const key = `ratelimit:${tier}:${identifier}`;

    try {
      const current = await client.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= maxRequests) {
        res.set('X-RateLimit-Limit', maxRequests.toString());
        res.set('X-RateLimit-Remaining', '0');
        res.set('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      const newCount = count + 1;
      await client.setEx(key, Math.ceil(windowMs / 1000), newCount.toString());

      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', (maxRequests - newCount).toString());
      res.set('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      next();
    } catch (error) {
      logger.error('Rate limit error:', error);
      next(); // Continue on error
    }
  };
};

// Rate limit tiers
const rateLimitTiers = {
  free: createTierRateLimiter('free', 100, 60 * 1000), // 100 requests per minute
  basic: createTierRateLimiter('basic', 500, 60 * 1000), // 500 requests per minute
  premium: createTierRateLimiter('premium', 2000, 60 * 1000), // 2000 requests per minute
  enterprise: createTierRateLimiter('enterprise', 10000, 60 * 1000), // 10000 requests per minute
};

// Burst allowance
const burstRateLimiter = async (req, res, next) => {
  const client = getRedisClient();
  const identifier = req.user?.id || req.ip;
  const key = `burst:${identifier}`;
  const maxBurst = 20; // Allow 20 requests in burst
  const windowMs = 1000; // 1 second window

  try {
    const current = await client.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= maxBurst) {
      return res.status(429).json({
        success: false,
        error: 'Burst rate limit exceeded',
      });
    }

    await client.setEx(key, Math.ceil(windowMs / 1000), (count + 1).toString());
    next();
  } catch (error) {
    logger.error('Burst rate limit error:', error);
    next();
  }
};

// Endpoint-specific rate limiting
const endpointRateLimits = {
  '/api/v1/payments': createTierRateLimiter('payment', 10, 60 * 1000), // 10 per minute
  '/api/v1/auth/login': createTierRateLimiter('login', 5, 15 * 60 * 1000), // 5 per 15 minutes
  '/api/v1/coupons': createTierRateLimiter('coupon', 20, 60 * 1000), // 20 per minute
};

const getEndpointRateLimiter = (path) => {
  for (const [endpoint, limiter] of Object.entries(endpointRateLimits)) {
    if (path.startsWith(endpoint)) {
      return limiter;
    }
  }
  return null;
};

module.exports = {
  apiVersioning,
  apiDeprecation,
  requestTransformation,
  rateLimitTiers,
  burstRateLimiter,
  getEndpointRateLimiter,
};


