// Payments module exports
module.exports = {
  routes: require('../../routes/paymentRoutes'),
  controllers: require('../../controllers/paymentController'),
  services: require('../../services/payments/PaymentGatewayFactory'),
};


