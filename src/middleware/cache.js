const { cache } = require('../config/redis');

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await cache.get(key);
      if (cached) {
        return res.json(cached);
      }

      // Store original json function
      const originalJson = res.json.bind(res);

      // Override json function to cache response
      res.json = function (data) {
        cache.set(key, { success: true, data }, ttl);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

const invalidateCache = async (pattern) => {
  await cache.clear(pattern);
};

module.exports = { cacheMiddleware, invalidateCache };


