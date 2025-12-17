const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const adminUserController = require('../../controllers/admin/adminUserController');
const adminOrderController = require('../../controllers/admin/adminOrderController');
const { auth, admin } = require('../../middleware/auth');

router.use(auth, admin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminUserController.getUsers);
router.get('/users/:id', adminUserController.getUser);
router.post('/users', adminUserController.createUser);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);
router.put('/users/:id/verify', adminUserController.verifyUser);
router.put('/users/:id/activate', adminUserController.activateUser);
router.put('/users/:id/role', adminUserController.updateUserRole);
router.post('/users/:id/reset-password', adminUserController.resetUserPassword);

// Order Management
router.get('/orders', adminOrderController.getOrders);
router.get('/orders/:id', adminOrderController.getOrder);
router.put('/orders/:id/status', adminOrderController.updateOrderStatus);
router.post('/orders/:id/cancel', adminOrderController.cancelOrder);
router.post('/orders/:id/refund', adminOrderController.processRefund);

module.exports = router;


