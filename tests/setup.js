// Test setup and teardown
const { PrismaClient } = require('@prisma/client');
const { redisClient } = require('../src/config/redis');

// Create test database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Connect to Redis if needed
  if (redisClient && !redisClient.isOpen) {
    await redisClient.connect();
  }
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
});

// Global test teardown
afterAll(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Disconnect from database
  await prisma.$disconnect();
  
  // Disconnect from Redis
  if (redisClient && redisClient.isOpen) {
    await redisClient.disconnect();
  }
});

// Clean up test data
async function cleanupTestData() {
  // Delete test data in reverse order of dependencies
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "OrderItem" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Order" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "CartItem" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Cart" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Payment" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Product" CASCADE`;
  } catch (error) {
    // Ignore errors if tables don't exist or are already empty
    console.warn('Cleanup warning:', error.message);
  }
}

// Make prisma available globally for tests
global.prisma = prisma;
global.redisClient = redisClient;

// Suppress console logs in tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}


