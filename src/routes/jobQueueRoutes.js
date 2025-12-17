const express = require('express');
const router = express.Router();
const jobQueueController = require('../controllers/jobQueueController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.get('/stats', jobQueueController.getQueueStats);
router.get('/:queueName/jobs/:jobId', jobQueueController.getJob);
router.post('/:queueName/jobs/:jobId/retry', jobQueueController.retryJob);
router.delete('/:queueName/jobs/:jobId', jobQueueController.removeJob);

module.exports = router;


