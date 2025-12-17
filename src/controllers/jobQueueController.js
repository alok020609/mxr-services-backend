const jobQueueService = require('../services/jobQueueService');
const { asyncHandler } = require('../utils/asyncHandler');

const getQueueStats = asyncHandler(async (req, res) => {
  const [email, image, report, index] = await Promise.all([
    jobQueueService.getQueueStats(jobQueueService.emailQueue),
    jobQueueService.getQueueStats(jobQueueService.imageProcessingQueue),
    jobQueueService.getQueueStats(jobQueueService.reportQueue),
    jobQueueService.getQueueStats(jobQueueService.indexQueue),
  ]);

  res.json({
    success: true,
    data: {
      email,
      imageProcessing: image,
      reports: report,
      indexing: index,
    },
  });
});

const getJob = asyncHandler(async (req, res) => {
  const { queueName, jobId } = req.params;

  const queue = jobQueueService[`${queueName}Queue`];
  if (!queue) {
    return res.status(404).json({
      success: false,
      error: 'Queue not found',
    });
  }

  const job = await queue.getJob(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found',
    });
  }

  const state = await job.getState();
  const progress = job.progress();

  res.json({
    success: true,
    data: {
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress,
      attemptsMade: job.attemptsMade,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      failedReason: job.failedReason,
    },
  });
});

const retryJob = asyncHandler(async (req, res) => {
  const { queueName, jobId } = req.params;

  const queue = jobQueueService[`${queueName}Queue`];
  if (!queue) {
    return res.status(404).json({
      success: false,
      error: 'Queue not found',
    });
  }

  const job = await queue.getJob(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found',
    });
  }

  await job.retry();

  res.json({
    success: true,
    message: 'Job queued for retry',
  });
});

const removeJob = asyncHandler(async (req, res) => {
  const { queueName, jobId } = req.params;

  const queue = jobQueueService[`${queueName}Queue`];
  if (!queue) {
    return res.status(404).json({
      success: false,
      error: 'Queue not found',
    });
  }

  const job = await queue.getJob(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found',
    });
  }

  await job.remove();

  res.json({
    success: true,
    message: 'Job removed',
  });
});

module.exports = {
  getQueueStats,
  getJob,
  retryJob,
  removeJob,
};


