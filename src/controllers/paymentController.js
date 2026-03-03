const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentGatewayFactory = require('../services/payments/PaymentGatewayFactory');
const PayUGateway = require('../services/payments/PayUGateway');

function getAllowedRedirectOrigins() {
  const origins = new Set();
  try {
    if (process.env.FRONTEND_URL) {
      origins.add(new URL(process.env.FRONTEND_URL.trim()).origin);
    }
  } catch (_) {}
  const extra = process.env.ALLOWED_REDIRECT_ORIGINS || '';
  extra.split(',').forEach((entry) => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    try {
      origins.add(new URL(trimmed).origin);
    } catch (_) {}
  });
  return origins;
}

function isAllowedRedirectUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return getAllowedRedirectOrigins().has(parsed.origin);
  } catch (_) {
    return false;
  }
}

const getGateways = asyncHandler(async (req, res) => {
  const gateways = await PaymentGatewayFactory.getAvailableGateways();
  res.json({
    success: true,
    data: gateways,
  });
});

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, gateway, successRedirectUrl, failureRedirectUrl } = req.body;

  const orderInclude = {
    items: true,
    payments: { where: { status: 'SUCCEEDED' }, take: 1 },
    ...(gateway === 'PAYU' ? { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } : {}),
  };
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: req.user.id,
    },
    include: orderInclude,
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

  if (!order.items || order.items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Order has no items and cannot be paid',
    });
  }

  if (Number(order.total) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Order total must be greater than zero',
    });
  }

  if (order.payments && order.payments.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Order is already paid',
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

  // PayU: redirect flow – return redirectUrl + formData for client to POST to PayU
  if (gateway === 'PAYU') {
    if (successRedirectUrl && !isAllowedRedirectUrl(successRedirectUrl)) {
      return res.status(400).json({
        success: false,
        error: 'successRedirectUrl must be from an allowed origin (FRONTEND_URL or ALLOWED_REDIRECT_ORIGINS)',
      });
    }
    if (failureRedirectUrl && !isAllowedRedirectUrl(failureRedirectUrl)) {
      return res.status(400).json({
        success: false,
        error: 'failureRedirectUrl must be from an allowed origin (FRONTEND_URL or ALLOWED_REDIRECT_ORIGINS)',
      });
    }
    const callbackBase = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const callbackUrl = `${callbackBase.replace(/\/$/, '')}/api/v1/payments/payu/callback`;
    const firstname = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(' ') || 'Customer';
    const paymentIntent = await gatewayInstance.createPayment({
      amount: order.total,
      currency: order.currency,
      orderId: order.id,
      orderNumber: order.orderNumber,
      firstname,
      email: order.user?.email || req.user?.email || '',
      phone: order.user?.phone || '',
      surl: callbackUrl,
      furl: callbackUrl,
      txnid: payment.id,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: paymentIntent.transactionId || paymentIntent.formData?.txnid,
        metadata: {
          redirectUrl: paymentIntent.redirectUrl,
          formKeys: Object.keys(paymentIntent.formData || {}),
          ...(successRedirectUrl && { successRedirectUrl }),
          ...(failureRedirectUrl && { failureRedirectUrl }),
        },
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAYMENT_PENDING' },
    });

    return res.json({
      success: true,
      data: {
        paymentId: payment.id,
        redirectUrl: paymentIntent.redirectUrl,
        formData: paymentIntent.formData,
        message: 'Submit form to redirectUrl to complete payment',
      },
    });
  }

  // Create payment intent (Stripe/Razorpay etc.)
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

/** Build default order-page URL when no redirect URL is configured (backend-handled). */
function getPayuDefaultOrderRedirectUrl(orderId, status) {
  const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const path = (process.env.PAYU_ORDER_PATH || '/orders').replace(/^\//, '').replace(/\/$/, '');
  if (!base) return null;
  const pathPart = path ? `${base}/${path}/${orderId}` : `${base}/${orderId}`;
  return `${pathPart}?status=${status}`;
}

/**
 * PayU callback (surl/furl). Public – no auth. PayU POSTs form-urlencoded.
 * Verify hash, update payment and order, redirect to frontend success/failure URL.
 * Redirect resolution: 1) per-payment metadata (from frontend in create-intent), 2) gateway config, 3) env vars, 4) backend-built order page (FRONTEND_URL + PAYU_ORDER_PATH + orderId).
 */
const payuCallback = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const gatewayConfig = await prisma.paymentGateway.findUnique({
    where: { type: 'PAYU' },
  });
  if (!gatewayConfig || !gatewayConfig.config?.salt) {
    return res.status(502).send('PayU gateway not configured');
  }
  const salt = gatewayConfig.config.salt;
  if (!PayUGateway.verifyResponseHash(body, salt)) {
    return res.status(400).send('Invalid hash');
  }
  const txnid = body.txnid;
  const payment = await prisma.payment.findFirst({
    where: { transactionId: txnid },
    include: { order: true },
  });
  if (!payment) {
    const configFail = gatewayConfig.config.failureRedirectUrl || process.env.PAYU_FAILURE_REDIRECT_URL;
    const failUrl =
      (configFail && isAllowedRedirectUrl(configFail) ? configFail : null) ||
      getPayuDefaultOrderRedirectUrl(body.udf1 || '', 'failure') ||
      process.env.FRONTEND_URL ||
      '/';
    return res.redirect(`${failUrl}${failUrl.includes('?') ? '&' : '?'}status=failure&reason=payment_not_found`);
  }
  const isSuccess = (body.status || '').toLowerCase() === 'success';
  const meta = payment.metadata && typeof payment.metadata === 'object' ? payment.metadata : {};
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: isSuccess ? 'SUCCEEDED' : 'FAILED',
      gatewayTransactionId: body.mihpayid || payment.gatewayTransactionId,
      metadata: { ...meta, payuResponse: body },
    },
  });
  if (isSuccess) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'PAID' },
    });
    await prisma.orderStateHistory.create({
      data: {
        orderId: payment.orderId,
        fromState: payment.order.status,
        toState: 'PAID',
        userId: null,
        reason: 'PayU payment succeeded',
      },
    });
  }
  const status = isSuccess ? 'success' : 'failure';
  const perPaymentSuccess = meta.successRedirectUrl && isAllowedRedirectUrl(meta.successRedirectUrl) ? meta.successRedirectUrl : null;
  const perPaymentFail = meta.failureRedirectUrl && isAllowedRedirectUrl(meta.failureRedirectUrl) ? meta.failureRedirectUrl : null;
  const configSuccessRaw = gatewayConfig.config.successRedirectUrl || process.env.PAYU_SUCCESS_REDIRECT_URL;
  const configFailRaw = gatewayConfig.config.failureRedirectUrl || process.env.PAYU_FAILURE_REDIRECT_URL;
  const configSuccess = configSuccessRaw && isAllowedRedirectUrl(configSuccessRaw) ? configSuccessRaw : null;
  const configFail = configFailRaw && isAllowedRedirectUrl(configFailRaw) ? configFailRaw : null;
  const defaultOrderUrl = getPayuDefaultOrderRedirectUrl(payment.orderId, status);
  let redirectUrl =
    isSuccess
      ? (perPaymentSuccess || configSuccess || defaultOrderUrl || process.env.FRONTEND_URL || '/')
      : (perPaymentFail || configFail || defaultOrderUrl || process.env.FRONTEND_URL || '/');
  if (typeof redirectUrl === 'string' && redirectUrl.startsWith('http') && !isAllowedRedirectUrl(redirectUrl)) {
    redirectUrl = defaultOrderUrl || process.env.FRONTEND_URL || '/';
  }
  const separator = redirectUrl.includes('?') ? '&' : '?';
  const query = `orderId=${payment.orderId}&status=${status}`;
  return res.redirect(302, `${redirectUrl}${separator}${query}`);
});

module.exports = {
  getGateways,
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  getPaymentHistory,
  payuCallback,
};


