const express = require('express');
const router = express.Router();
const jobQueueController = require('../controllers/jobQueueController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Job Queue
 *   description: Background job queue management endpoints (Admin only)
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/jobs/stats:
 *   get:
 *     summary: Get queue stats
 *     description: Retrieve job queue statistics (Admin only)
 *     tags: [Job Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', jobQueueController.getQueueStats);

/**
 * @swagger
 * /api/v1/jobs/{queueName}/jobs/{jobId}:
 *   get:
 *     summary: Get job
 *     description: Retrieve details of a specific job (Admin only)
 *     tags: [Job Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: queueName
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue name
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.get('/:queueName/jobs/:jobId', jobQueueController.getJob);

/**
 * @swagger
 * /api/v1/jobs/{queueName}/jobs/{jobId}/retry:
 *   post:
 *     summary: Retry job
 *     description: Retry a failed job (Admin only)
 *     tags: [Job Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: queueName
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue name
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job retry initiated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.post('/:queueName/jobs/:jobId/retry', jobQueueController.retryJob);

/**
 * @swagger
 * /api/v1/jobs/{queueName}/jobs/{jobId}:
 *   delete:
 *     summary: Remove job
 *     description: Remove a job from the queue (Admin only)
 *     tags: [Job Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: queueName
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue name
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.delete('/:queueName/jobs/:jobId', jobQueueController.removeJob);

module.exports = router;


