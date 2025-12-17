// Auth module exports
module.exports = {
  routes: require('../../routes/authRoutes'),
  controllers: require('../../controllers/authController'),
  services: require('../../services/authService'),
  middleware: require('../../middleware/auth'),
};


