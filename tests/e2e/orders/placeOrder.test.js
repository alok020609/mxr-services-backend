const request = require('supertest');
const app = require('../../../src/server');
const { createUser, createProduct, createCart } = require('../../helpers/factories');
const { generateTestToken } = require('../../helpers/testHelpers');

describe('Order Placement - E2E Tests', () => {
  let user;
  let product;
  let token;

  beforeAll(async () => {
    // Setup: Create user and product
    user = await createUser();
    product = await createProduct({ stockQuantity: 10 });
    token = generateTestToken(user.id);
  });

  describe('Complete Order Placement Flow', () => {
    it('should complete full order placement flow', async () => {
      // Step 1: Add product to cart
      const addToCartResponse = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product.id,
          quantity: 2,
        })
        .expect(200);

      expect(addToCartResponse.body).toHaveProperty('cart');
      expect(addToCartResponse.body.cart.items.length).toBe(1);

      // Step 2: Get cart
      const getCartResponse = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getCartResponse.body.cart.items.length).toBeGreaterThan(0);

      // Step 3: Create order from cart
      const createOrderResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cartId: getCartResponse.body.cart.id,
          shippingAddressId: user.addresses?.[0]?.id || null,
        })
        .expect(201);

      expect(createOrderResponse.body).toHaveProperty('order');
      expect(createOrderResponse.body.order.status).toBe('CREATED');
      expect(createOrderResponse.body.order.items.length).toBeGreaterThan(0);

      const orderId = createOrderResponse.body.order.id;

      // Step 4: Create payment intent
      const paymentIntentResponse = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId,
          amount: createOrderResponse.body.order.total,
          currency: 'USD',
        })
        .expect(200);

      expect(paymentIntentResponse.body).toHaveProperty('paymentIntent');
      expect(paymentIntentResponse.body.paymentIntent.status).toBe('PENDING');

      // Step 5: Confirm payment (mock)
      const confirmPaymentResponse = await request(app)
        .post('/api/v1/payments/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({
          paymentIntentId: paymentIntentResponse.body.paymentIntent.id,
          paymentMethodId: 'test_payment_method',
        })
        .expect(200);

      expect(confirmPaymentResponse.body.payment.status).toBe('SUCCEEDED');

      // Step 6: Verify order status updated
      const orderResponse = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(['PAID', 'CONFIRMED']).toContain(orderResponse.body.order.status);

      // Step 7: Verify inventory deducted
      const productResponse = await request(app)
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      // Stock should be reduced (original 10 - ordered 2 = 8)
      expect(productResponse.body.product.stockQuantity).toBeLessThanOrEqual(8);
    });

    it('should handle insufficient stock gracefully', async () => {
      // Create product with low stock
      const lowStockProduct = await createProduct({ stockQuantity: 1 });

      // Add more than available to cart
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: lowStockProduct.id,
          quantity: 5, // More than available
        })
        .expect(400); // Should fail
    });

    it('should handle payment failure and revert order', async () => {
      // This test would verify that if payment fails,
      // the order is properly cancelled and inventory is reverted
      // Implementation depends on payment gateway mocking
    });
  });
});


