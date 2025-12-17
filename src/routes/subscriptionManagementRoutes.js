const express = require('express');
const router = express.Router();
const subscriptionManagementController = require('../controllers/subscriptionManagementController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/:subscriptionId/pause', subscriptionManagementController.pauseSubscription);
router.post('/:subscriptionId/resume', subscriptionManagementController.resumeSubscription);
router.post('/:subscriptionId/skip', subscriptionManagementController.skipNextDelivery);
router.put('/:subscriptionId/frequency', subscriptionManagementController.changeFrequency);
router.post('/:subscriptionId/cancel', subscriptionManagementController.cancelSubscription);

module.exports = router;


