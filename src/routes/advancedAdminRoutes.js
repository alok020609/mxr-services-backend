const express = require('express');
const router = express.Router();
const advancedAdminController = require('../controllers/advancedAdminController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Advanced Admin
 *   description: Advanced admin features including order notes, task assignment, and activity feeds (Admin only)
 */

router.use(auth, admin);

// Order notes
/**
 * @swagger
 * /api/v1/admin/advanced/orders/{orderId}/notes:
 *   post:
 *     summary: Add order note
 *     description: Add a note to an order (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 description: Note content
 *               isInternal:
 *                 type: boolean
 *                 description: Internal note (not visible to customer)
 *     responses:
 *       201:
 *         description: Note added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/orders/:orderId/notes', advancedAdminController.addOrderNote);

/**
 * @swagger
 * /api/v1/admin/advanced/orders/{orderId}/notes:
 *   get:
 *     summary: Get order notes
 *     description: Retrieve all notes for an order (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId/notes', advancedAdminController.getOrderNotes);

// Task assignment
/**
 * @swagger
 * /api/v1/admin/advanced/orders/{orderId}/tasks:
 *   post:
 *     summary: Assign order task
 *     description: Assign a task to an admin user for an order (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *               - taskType
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign task to
 *               taskType:
 *                 type: string
 *                 enum: [REVIEW, FULFILL, CONTACT_CUSTOMER]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       201:
 *         description: Task assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/orders/:orderId/tasks', advancedAdminController.assignOrderTask);

// Activity feed
/**
 * @swagger
 * /api/v1/admin/advanced/activity:
 *   get:
 *     summary: Get admin activity feed
 *     description: Retrieve recent admin activity feed (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activities to retrieve
 *     responses:
 *       200:
 *         description: Activity feed retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/activity', advancedAdminController.getAdminActivityFeed);

// Notifications
/**
 * @swagger
 * /api/v1/admin/advanced/notifications:
 *   get:
 *     summary: Get admin notifications
 *     description: Retrieve admin-specific notifications (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications', advancedAdminController.getAdminNotifications);

/**
 * @swagger
 * /api/v1/admin/advanced/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read
 *     description: Mark an admin notification as read (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put('/notifications/:notificationId/read', advancedAdminController.markNotificationRead);

// Saved filters
/**
 * @swagger
 * /api/v1/admin/advanced/filters:
 *   get:
 *     summary: Get admin saved filters
 *     description: Retrieve saved filter configurations (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filters retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/filters', advancedAdminController.getAdminSavedFilters);

/**
 * @swagger
 * /api/v1/admin/advanced/filters:
 *   post:
 *     summary: Save admin filter
 *     description: Save a filter configuration for reuse (Admin only)
 *     tags: [Advanced Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - resource
 *               - filters
 *             properties:
 *               name:
 *                 type: string
 *                 description: Filter name
 *               resource:
 *                 type: string
 *                 enum: [orders, products, users]
 *               filters:
 *                 type: object
 *                 description: Filter criteria
 *     responses:
 *       201:
 *         description: Filter saved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/filters', advancedAdminController.saveAdminFilter);

module.exports = router;


