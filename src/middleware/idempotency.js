const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const idempotencyMiddleware = asyncHandler(async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey;

  if (!idempotencyKey) {
    return next();
  }

  // Check if request was already processed
  const existingRequest = await prisma.idempotencyKey.findUnique({
    where: { key: idempotencyKey },
  });

  if (existingRequest) {
    // Return cached response
    if (existingRequest.response) {
      return res.status(existingRequest.statusCode || 200).json(existingRequest.response);
    }

    // Request is still processing
    if (existingRequest.status === 'PROCESSING') {
      return res.status(409).json({
        success: false,
        error: 'Request is already being processed',
      });
    }
  }

  // Create idempotency key record
  await prisma.idempotencyKey.upsert({
    where: { key: idempotencyKey },
    update: {
      status: 'PROCESSING',
      updatedAt: new Date(),
    },
    create: {
      key: idempotencyKey,
      method: req.method,
      path: req.path,
      status: 'PROCESSING',
    },
  });

  // Store original json function
  const originalJson = res.json.bind(res);
  const originalStatus = res.status.bind(res);

  let statusCode = 200;
  res.status = function (code) {
    statusCode = code;
    return originalStatus(code);
  };

  // Override json to cache response
  res.json = function (data) {
    // Cache the response
    prisma.idempotencyKey.update({
      where: { key: idempotencyKey },
      data: {
        status: 'COMPLETED',
        response: data,
        statusCode,
      },
    }).catch(console.error);

    return originalJson(data);
  };

  next();
});

module.exports = { idempotencyMiddleware };


