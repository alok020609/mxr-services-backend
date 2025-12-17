const express = require('express');
const router = express.Router();
const advancedAdminController = require('../controllers/advancedAdminController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

// Order notes
router.post('/orders/:orderId/notes', advancedAdminController.addOrderNote);
router.get('/orders/:orderId/notes', advancedAdminController.getOrderNotes);

// Task assignment
router.post('/orders/:orderId/tasks', advancedAdminController.assignOrderTask);

// Activity feed
router.get('/activity', advancedAdminController.getAdminActivityFeed);

// Notifications
router.get('/notifications', advancedAdminController.getAdminNotifications);
router.put('/notifications/:notificationId/read', advancedAdminController.markNotificationRead);

// Saved filters
router.get('/filters', advancedAdminController.getAdminSavedFilters);
router.post('/filters', advancedAdminController.saveAdminFilter);

module.exports = router;


