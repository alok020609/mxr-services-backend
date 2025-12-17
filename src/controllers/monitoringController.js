const { asyncHandler } = require('../utils/asyncHandler');
const os = require('os');
const { getRedisClient } = require('../config/redis');
const prisma = require('../config/database');

const getSystemHealth = asyncHandler(async (req, res) => {
  const [dbStatus, redisStatus, memoryUsage, cpuUsage] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    getMemoryUsage(),
    getCpuUsage(),
  ]);

  const health = {
    status: dbStatus && redisStatus ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus ? 'up' : 'down',
      redis: redisStatus ? 'up' : 'down',
    },
    system: {
      memory: memoryUsage,
      cpu: cpuUsage,
      uptime: process.uptime(),
    },
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json({
    success: true,
    data: health,
  });
});

const checkDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
};

const checkRedis = async () => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    return false;
  }
};

const getMemoryUsage = () => {
  const used = process.memoryUsage();
  return {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
  };
};

const getCpuUsage = () => {
  const cpus = os.cpus();
  return {
    count: cpus.length,
    model: cpus[0]?.model || 'Unknown',
  };
};

const getMetrics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // TODO: Implement comprehensive metrics collection
  res.json({
    success: true,
    data: {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
      },
      responseTime: {
        average: 0,
        p95: 0,
        p99: 0,
      },
      errors: {
        total: 0,
        byType: {},
      },
    },
  });
});

module.exports = {
  getSystemHealth,
  getMetrics,
};

