const redis = require('redis');

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.connect().catch(console.error);
  }

  return redisClient;
};

const cache = {
  get: async (key) => {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  set: async (key, value, ttl = 3600) => {
    try {
      const client = getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  del: async (key) => {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  clear: async (pattern) => {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern || '*');
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis CLEAR error:', error);
      return false;
    }
  },
};

module.exports = { getRedisClient, cache };
