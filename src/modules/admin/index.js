// Admin module exports
module.exports = {
  routes: require('../../routes/admin/adminRoutes'),
  controllers: {
    admin: require('../../controllers/admin/adminController'),
    users: require('../../controllers/admin/adminUserController'),
    orders: require('../../controllers/admin/adminOrderController'),
  },
  middleware: require('../../middleware/auth'),
};


