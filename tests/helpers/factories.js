const prisma = require('../../src/config/database');
const bcrypt = require('bcryptjs');

/**
 * Test data factories
 * Generate test data for different models
 */

/**
 * Create a test user
 */
async function createUser(overrides = {}) {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: await bcrypt.hash('password123', 10),
    name: 'Test User',
    role: 'CUSTOMER',
    emailVerified: true,
    isActive: true,
    ...overrides,
  };

  return await prisma.user.create({
    data: defaultUser,
  });
}

/**
 * Create a test admin user
 */
async function createAdmin(overrides = {}) {
  return await createUser({
    role: 'ADMIN',
    email: `admin-${Date.now()}@example.com`,
    ...overrides,
  });
}

/**
 * Create a test product
 */
async function createProduct(overrides = {}) {
  const defaultProduct = {
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    sku: `SKU-${Date.now()}`,
    status: 'ACTIVE',
    stockQuantity: 100,
    ...overrides,
  };

  return await prisma.product.create({
    data: defaultProduct,
  });
}

/**
 * Create a test category
 */
async function createCategory(overrides = {}) {
  const defaultCategory = {
    name: 'Test Category',
    slug: `test-category-${Date.now()}`,
    description: 'Test category description',
    isActive: true,
    ...overrides,
  };

  return await prisma.category.create({
    data: defaultCategory,
  });
}

/**
 * Create a test order
 */
async function createOrder(userId, overrides = {}) {
  const defaultOrder = {
    userId,
    status: 'CREATED',
    total: 99.99,
    subtotal: 89.99,
    tax: 9.00,
    shipping: 1.00,
    ...overrides,
  };

  return await prisma.order.create({
    data: defaultOrder,
    include: {
      items: true,
      user: true,
    },
  });
}

/**
 * Create a test cart
 */
async function createCart(userId, overrides = {}) {
  const defaultCart = {
    userId,
    ...overrides,
  };

  return await prisma.cart.create({
    data: defaultCart,
    include: {
      items: true,
    },
  });
}

/**
 * Create a test payment
 */
async function createPayment(orderId, overrides = {}) {
  const defaultPayment = {
    orderId,
    amount: 99.99,
    currency: 'USD',
    status: 'PENDING',
    gateway: 'STRIPE',
    ...overrides,
  };

  return await prisma.payment.create({
    data: defaultPayment,
  });
}

/**
 * Create a test coupon
 */
async function createCoupon(overrides = {}) {
  const defaultCoupon = {
    code: `TEST${Date.now()}`,
    type: 'PERCENTAGE',
    value: 10,
    minPurchase: 0,
    maxDiscount: 100,
    usageLimit: 100,
    usageCount: 0,
    isActive: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ...overrides,
  };

  return await prisma.coupon.create({
    data: defaultCoupon,
  });
}

/**
 * Create test address
 */
async function createAddress(userId, overrides = {}) {
  const defaultAddress = {
    userId,
    type: 'SHIPPING',
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'US',
    isDefault: false,
    ...overrides,
  };

  return await prisma.address.create({
    data: defaultAddress,
  });
}

module.exports = {
  createUser,
  createAdmin,
  createProduct,
  createCategory,
  createOrder,
  createCart,
  createPayment,
  createCoupon,
  createAddress,
};


