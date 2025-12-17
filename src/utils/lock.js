const { getRedisClient } = require('../config/redis');

class DistributedLock {
  constructor(key, ttl = 30) {
    this.key = `lock:${key}`;
    this.ttl = ttl;
  }

  getClient() {
    return getRedisClient();
  }

  async acquire() {
    try {
      const client = this.getClient();
      const result = await client.setNX(this.key, '1');
      if (result) {
        await client.expire(this.key, this.ttl);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lock acquire error:', error);
      return false;
    }
  }

  async release() {
    try {
      const client = this.getClient();
      await client.del(this.key);
    } catch (error) {
      console.error('Lock release error:', error);
    }
  }

  async execute(fn) {
    const acquired = await this.acquire();
    if (!acquired) {
      throw new Error('Failed to acquire lock');
    }

    try {
      return await fn();
    } finally {
      await this.release();
    }
  }
}

const withLock = async (key, fn, ttl = 30) => {
  const lock = new DistributedLock(key, ttl);
  return lock.execute(fn);
};

module.exports = { DistributedLock, withLock };

