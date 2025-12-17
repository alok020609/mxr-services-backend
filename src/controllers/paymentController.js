const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentGatewayFactory = require('../services/payments/PaymentGatewayFactory');

const getGateways = asyncHandler(async (req, res) => {
  const gateways = await PaymentGatewayFactory.getAvailableGateways();
  res.json({
    success: true,
    data: gateways,
  });
});

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, gateway } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  if (order.status !== 'CREATED' && order.status !== 'PAYMENT_PENDING') {
    return res.status(400).json({
      success: false,
      error: 'Order cannot be paid',
    });
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      gateway,
      amount: order.total,
      currency: order.currency,
      status: 'PENDING',
    },
  });

  // Get gateway instance
  const gatewayInstance = await PaymentGatewayFactory.createGateway(gateway);

  // Create payment intent
  const paymentIntent = await gatewayInstance.createPayment({
    amount: order.total,
    currency: order.currency,
    orderId: order.id,
    metadata: {
      userId: req.user.id,
      orderNumber: order.orderNumber,
    },
  });

  // Update payment with transaction ID
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      transactionId: paymentIntent.paymentIntentId || paymentIntent.orderId,
      gatewayTransactionId: paymentIntent.paymentIntentId || paymentIntent.orderId,
      metadata: paymentIntent,
    },
  });

  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PAYMENT_PENDING' },
  });

  res.json({
    success: true,
    data: {
      paymentId: payment.id,
      ...paymentIntent,
    },
  });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId, verificationData } = req.body;

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      order: {
        userId: req.user.id,
      },
    },
    include: {
      order: true,
    },
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found',
    });
  }

  // Get gateway instance
  const gatewayInstance = await PaymentGatewayFactory.createGateway(payment.gateway);

  // Confirm payment
  const confirmation = await gatewayInstance.confirmPayment(
    payment.transactionId,
    verificationData
  );

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: confirmation.status,
      gatewayTransactionId: confirmation.transactionId,
      metadata: confirmation.gatewayResponse,
    },
  });

  // Record transaction
  await prisma.paymentTransaction.create({
    data: {
      paymentId: payment.id,
      type: 'payment',
      amount: payment.amount,
      status: confirmation.status,
      gatewayResponse: confirmation.gatewayResponse,
    },
  });

  // Update order status if payment succeeded
  if (confirmation.status === 'SUCCEEDED') {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'PAID' },
    });

    // Record state history
    await prisma.orderStateHistory.create({
      data: {
        orderId: payment.orderId,
        fromState: payment.order.status,
        toState: 'PAID',
        userId: req.user.id,
      },
    });
  }

  res.json({
    success: true,
    data: updatedPayment,
  });
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await prisma.payment.findFirst({
    where: {
      orderId: req.params.orderId,
      order: {
        userId: req.user.id,
      },
    },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found',
    });
  }

  res.json({
    success: true,
    data: payment,
  });
});

const getPaymentHistory = asyncHandler(async (req, res) => {
  const payment = await prisma.payment.findFirst({
    where: {
      orderId: req.params.orderId,
      order: {
        userId: req.user.id,
      },
    },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found',
    });
  }

  res.json({
    success: true,
    data: payment.transactions,
  });
});

module.exports = {
  getGateways,
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  getPaymentHistory,
};


