const jwt = require('jsonwebtoken');

/**
 * Test helper utilities
 */

/**
 * Generate a test JWT token
 */
function generateTestToken(userId, role = 'CUSTOMER') {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '1h' }
  );
}

/**
 * Generate admin test token
 */
function generateAdminToken(userId) {
  return generateTestToken(userId, 'ADMIN');
}

/**
 * Wait for async operation
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation
 */
async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await wait(delay * (i + 1));
    }
  }
}

/**
 * Mock event service
 */
function createMockEventService() {
  const events = [];
  return {
    publishEvent: jest.fn((eventType, payload) => {
      events.push({ eventType, payload, timestamp: new Date() });
      return Promise.resolve();
    }),
    subscribe: jest.fn(),
    getEvents: () => events,
    clearEvents: () => events.length = 0,
  };
}

/**
 * Mock payment gateway
 */
function createMockPaymentGateway() {
  return {
    createPaymentIntent: jest.fn().mockResolvedValue({
      id: 'test-payment-intent-id',
      clientSecret: 'test-client-secret',
      status: 'requires_payment_method',
    }),
    confirmPayment: jest.fn().mockResolvedValue({
      id: 'test-payment-id',
      status: 'succeeded',
    }),
    refundPayment: jest.fn().mockResolvedValue({
      id: 'test-refund-id',
      status: 'succeeded',
    }),
  };
}

/**
 * Create test request headers
 */
function createAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create test request with auth
 */
function createAuthenticatedRequest(app, token) {
  return require('supertest')(app)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');
}

/**
 * Assert error response
 */
function expectErrorResponse(response, statusCode, errorMessage) {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('error');
  if (errorMessage) {
    expect(response.body.error).toContain(errorMessage);
  }
}

/**
 * Assert success response
 */
function expectSuccessResponse(response, statusCode = 200) {
  expect(response.status).toBe(statusCode);
  expect(response.body).not.toHaveProperty('error');
}

/**
 * Clean up test data by pattern
 */
async function cleanupByPattern(pattern, model) {
  const prisma = require('../../src/config/database');
  const records = await prisma[model].findMany({
    where: pattern,
  });
  
  for (const record of records) {
    await prisma[model].delete({
      where: { id: record.id },
    });
  }
  
  return records.length;
}

module.exports = {
  generateTestToken,
  generateAdminToken,
  wait,
  retry,
  createMockEventService,
  createMockPaymentGateway,
  createAuthHeaders,
  createAuthenticatedRequest,
  expectErrorResponse,
  expectSuccessResponse,
  cleanupByPattern,
};


