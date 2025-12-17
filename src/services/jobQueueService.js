const Queue = require('bull');
const { logger } = require('../utils/logger');

// Create job queues
const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

const imageProcessingQueue = new Queue('image-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

const reportQueue = new Queue('reports', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

const indexQueue = new Queue('indexing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Job priorities
const JOB_PRIORITIES = {
  LOW: 1,
  NORMAL: 5,
  HIGH: 10,
  CRITICAL: 20,
};

// Add email job
const addEmailJob = async (data, options = {}) => {
  return emailQueue.add('send-email', data, {
    priority: options.priority || JOB_PRIORITIES.NORMAL,
    attempts: options.attempts || 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    ...options,
  });
};

// Add image processing job
const addImageProcessingJob = async (data, options = {}) => {
  return imageProcessingQueue.add('process-image', data, {
    priority: options.priority || JOB_PRIORITIES.NORMAL,
    attempts: options.attempts || 3,
    ...options,
  });
};

// Add report generation job
const addReportJob = async (data, options = {}) => {
  return reportQueue.add('generate-report', data, {
    priority: options.priority || JOB_PRIORITIES.LOW,
    attempts: options.attempts || 2,
    ...options,
  });
};

// Add indexing job
const addIndexJob = async (data, options = {}) => {
  return indexQueue.add('update-index', data, {
    priority: options.priority || JOB_PRIORITIES.HIGH,
    attempts: options.attempts || 3,
    ...options,
  });
};

// Process jobs
emailQueue.process('send-email', async (job) => {
  logger.info('Processing email job', { jobId: job.id });
  // TODO: Implement email sending logic
  return { success: true };
});

imageProcessingQueue.process('process-image', async (job) => {
  logger.info('Processing image job', { jobId: job.id });
  // TODO: Implement image processing logic
  return { success: true };
});

reportQueue.process('generate-report', async (job) => {
  logger.info('Processing report job', { jobId: job.id });
  // TODO: Implement report generation logic
  return { success: true };
});

indexQueue.process('update-index', async (job) => {
  logger.info('Processing index job', { jobId: job.id });
  // TODO: Implement indexing logic
  return { success: true };
});

// Job monitoring
const getQueueStats = async (queue) => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};

module.exports = {
  emailQueue,
  imageProcessingQueue,
  reportQueue,
  indexQueue,
  addEmailJob,
  addImageProcessingJob,
  addReportJob,
  addIndexJob,
  getQueueStats,
  JOB_PRIORITIES,
};


