# Consistency Guarantees

This document defines explicit consistency guarantees for each bounded context and data domain. It specifies where strong consistency is mandatory and where eventual consistency is acceptable.

## Consistency Levels

### Strong Consistency (Immediate)
- All reads return the most recent write
- No stale data visible
- Required for: Financial transactions, inventory, critical order operations

### Eventual Consistency (Acceptable Delay)
- Reads may return slightly stale data
- Updates propagate asynchronously
- Acceptable for: Search indexes, analytics, notifications, recommendations

## Context-Specific Consistency Rules

### 1. Auth Context

**Strong Consistency Required:**
- User authentication and authorization
- Password changes
- Session creation and termination
- 2FA enable/disable
- Device management
- API key management

**Implementation:**
- Direct database writes with transactions
- Immediate cache invalidation
- Synchronous operations
- No eventual consistency allowed

**Eventual Consistency Acceptable:**
- User profile updates (non-critical fields)
- Address updates (non-critical)
- Preference changes

**Example:**
```javascript
// Strong consistency for password change
async function changePassword(userId, oldPassword, newPassword) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    // Verify old password
    if (!await bcrypt.compare(oldPassword, user.password)) {
      throw new Error('Invalid password');
    }
    // Update password
    await tx.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(newPassword, 10) }
    });
    // Invalidate all sessions
    await tx.session.deleteMany({ where: { userId } });
    // Clear cache
    await redisClient.del(`user:${userId}`);
    return { success: true };
  });
}
```

---

### 2. Catalog Context

**Strong Consistency Required:**
- Product creation and deletion
- Product price updates
- Product availability status
- Category hierarchy changes

**Implementation:**
- Database transactions for critical updates
- Immediate cache invalidation
- Synchronous product updates
- Real-time search index updates (via outbox pattern)

**Eventual Consistency Acceptable:**
- Search index updates (acceptable delay: < 5 seconds)
- Product recommendations (acceptable delay: < 1 minute)
- Recently viewed products (acceptable delay: < 10 seconds)
- Product analytics (acceptable delay: < 5 minutes)

**Example:**
```javascript
// Strong consistency for product price update
async function updateProductPrice(productId, newPrice) {
  return await prisma.$transaction(async (tx) => {
    // Update product
    const product = await tx.product.update({
      where: { id: productId },
      data: { price: newPrice }
    });
    // Invalidate cache
    await redisClient.del(`product:${productId}`);
    await redisClient.del('products:list:*');
    // Publish event for search index update (eventual consistency)
    await outboxService.addEventToOutbox(tx, 'Product', productId, 'ProductPriceUpdated', {
      productId,
      oldPrice: product.price,
      newPrice
    });
    return product;
  });
}
```

---

### 3. Orders Context

**Strong Consistency Required:**
- Order creation
- Order state transitions
- Order cancellation
- Cart operations (add, update, remove)
- Order total calculations

**Implementation:**
- Database transactions for order creation
- Optimistic locking for state transitions
- Distributed locks for concurrent operations
- Immediate inventory reservation
- Synchronous payment initiation

**Eventual Consistency Acceptable:**
- Order tracking updates (acceptable delay: < 30 seconds)
- Order analytics (acceptable delay: < 1 minute)
- Abandoned cart detection (acceptable delay: < 5 minutes)
- Order recommendations (acceptable delay: < 1 minute)

**Example:**
```javascript
// Strong consistency for order creation
async function createOrder(userId, cartId) {
  return await prisma.$transaction(async (tx) => {
    // Get cart with lock
    const cart = await tx.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } }
    });
    
    // Calculate totals
    const totals = calculateOrderTotals(cart.items);
    
    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        status: 'CREATED',
        total: totals.total,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    });
    
    // Reserve inventory (strong consistency)
    await inventoryService.reserveInventory(order.id, cart.items);
    
    // Clear cart
    await tx.cart.delete({ where: { id: cartId } });
    
    // Publish event (eventual consistency for notifications)
    await outboxService.addEventToOutbox(tx, 'Order', order.id, 'OrderPlaced', {
      orderId: order.id,
      userId,
      items: cart.items
    });
    
    return order;
  });
}
```

---

### 4. Payments Context

**Strong Consistency Required:**
- Payment initiation
- Payment confirmation
- Payment refunds
- Wallet transactions
- Payment reconciliation

**Implementation:**
- Database transactions for all payment operations
- Idempotency keys for all payment operations
- Distributed locks for wallet operations
- Immediate payment status updates
- Synchronous payment gateway calls (with timeout)

**Eventual Consistency Acceptable:**
- Payment analytics (acceptable delay: < 5 minutes)
- Payment reports (acceptable delay: < 1 hour)
- Payment webhook processing (acceptable delay: < 30 seconds)

**Example:**
```javascript
// Strong consistency for payment confirmation
async function confirmPayment(paymentId, gatewayResponse) {
  const idempotencyKey = `payment-confirm-${paymentId}`;
  const lockKey = `payment:lock:${paymentId}`;
  
  // Acquire distributed lock
  const lockId = await acquireLock(lockKey, 10000);
  if (!lockId) {
    throw new Error('Could not acquire payment lock');
  }
  
  try {
    return await prisma.$transaction(async (tx) => {
      // Check idempotency
      const existing = await tx.idempotencyKey.findUnique({
        where: { key: idempotencyKey }
      });
      if (existing && existing.responseBody) {
        return JSON.parse(existing.responseBody);
      }
      
      // Get payment
      const payment = await tx.payment.findUnique({
        where: { id: paymentId }
      });
      
      if (payment.status !== 'PENDING') {
        throw new Error(`Payment already ${payment.status}`);
      }
      
      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCEEDED',
          gatewayTransactionId: gatewayResponse.transactionId,
          completedAt: new Date()
        }
      });
      
      // Update order payment status (via event)
      await outboxService.addEventToOutbox(tx, 'Payment', paymentId, 'PaymentConfirmed', {
        paymentId,
        orderId: payment.orderId,
        amount: payment.amount
      });
      
      // Store idempotency response
      await tx.idempotencyKey.upsert({
        where: { key: idempotencyKey },
        update: {
          responseBody: JSON.stringify(updatedPayment),
          responseStatus: 200
        },
        create: {
          key: idempotencyKey,
          requestBody: {},
          responseBody: JSON.stringify(updatedPayment),
          responseStatus: 200
        }
      });
      
      return updatedPayment;
    });
  } finally {
    await releaseLock(lockKey, lockId);
  }
}
```

---

### 5. Inventory Context

**Strong Consistency Required:**
- Stock reservation
- Stock deduction
- Stock reversion
- Warehouse transfers
- Low stock alerts

**Implementation:**
- Distributed locks for all stock operations
- Database transactions with optimistic locking
- Immediate stock updates
- Synchronous inventory checks
- Real-time stock availability

**Eventual Consistency Acceptable:**
- Inventory analytics (acceptable delay: < 5 minutes)
- Demand forecasting (acceptable delay: < 1 hour)
- Inventory reports (acceptable delay: < 15 minutes)
- Reorder point calculations (acceptable delay: < 1 hour)

**Example:**
```javascript
// Strong consistency for stock reservation
async function reserveInventory(orderId, items) {
  const locks = [];
  
  try {
    // Acquire locks for all variants
    for (const item of items) {
      const lockKey = `inventory:lock:${item.variantId}`;
      const lockId = await acquireInventoryLock(item.variantId);
      if (!lockId) {
        // Release all acquired locks
        for (const acquiredLock of locks) {
          await releaseInventoryLock(acquiredLock.variantId, acquiredLock.lockId);
        }
        throw new Error(`Could not reserve inventory for variant ${item.variantId}`);
      }
      locks.push({ variantId: item.variantId, lockId });
    }
    
    return await prisma.$transaction(async (tx) => {
      const reservations = [];
      
      for (const item of items) {
        // Check and reserve stock
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId }
        });
        
        if (inventory.availableQuantity < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }
        
        // Reserve stock
        const updated = await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            availableQuantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity },
            version: { increment: 1 } // Optimistic locking
          }
        });
        
        // Create movement record
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: 'RESERVED',
            quantity: item.quantity,
            orderId: orderId,
            reason: 'Order reservation'
          }
        });
        
        reservations.push(updated);
      }
      
      return reservations;
    });
  } finally {
    // Release all locks
    for (const lock of locks) {
      await releaseInventoryLock(lock.variantId, lock.lockId);
    }
  }
}
```

---

### 6. Notifications Context

**Strong Consistency Required:**
- Notification delivery status
- Email delivery tracking
- Notification preferences (critical)

**Implementation:**
- Database transactions for delivery tracking
- Immediate status updates
- Synchronous delivery for critical notifications

**Eventual Consistency Acceptable:**
- Email delivery (acceptable delay: < 1 minute)
- SMS delivery (acceptable delay: < 30 seconds)
- Push notifications (acceptable delay: < 10 seconds)
- In-app notifications (acceptable delay: < 5 seconds)
- Notification analytics (acceptable delay: < 5 minutes)

**Example:**
```javascript
// Eventual consistency for email delivery
async function sendOrderConfirmationEmail(orderId) {
  // Get order data (read from Orders context via event)
  const order = await getOrderData(orderId);
  
  // Send email asynchronously
  const job = await jobQueue.add('send-email', {
    type: 'order-confirmation',
    orderId,
    recipient: order.user.email,
    data: order
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
  
  // Create notification record (eventual consistency)
  await prisma.notification.create({
    data: {
      userId: order.userId,
      type: 'EMAIL',
      status: 'PENDING',
      subject: 'Order Confirmation',
      jobId: job.id
    }
  });
  
  // Job processor will update status when email is sent
  // This is eventually consistent
}
```

---

## Consistency Implementation Strategies

### 1. Strong Consistency Implementation

**Database Transactions:**
```javascript
await prisma.$transaction(async (tx) => {
  // Multiple operations in single transaction
  // All or nothing
});
```

**Optimistic Locking:**
```javascript
const result = await prisma.product.updateMany({
  where: {
    id: productId,
    version: expectedVersion // Check version
  },
  data: {
    price: newPrice,
    version: { increment: 1 }
  }
});

if (result.count === 0) {
  throw new Error('Concurrent modification detected');
}
```

**Distributed Locks:**
```javascript
const lockId = await acquireLock('resource:lock:key', 10000);
try {
  // Critical section
} finally {
  await releaseLock('resource:lock:key', lockId);
}
```

**Idempotency Keys:**
```javascript
// All payment operations use idempotency keys
const idempotencyKey = req.headers['idempotency-key'];
// Check if operation already performed
// Return cached result if exists
```

### 2. Eventual Consistency Implementation

**Outbox Pattern:**
```javascript
// Within transaction
await outboxService.addEventToOutbox(tx, 'Order', orderId, 'OrderPlaced', data);
// Event processed asynchronously by background worker
```

**Event Consumers:**
```javascript
eventService.subscribe('OrderPlaced', async (event) => {
  // Process asynchronously
  // Retry on failure
  // Eventually consistent
});
```

**Job Queues:**
```javascript
// Async job processing
await jobQueue.add('update-search-index', { productId });
// Processed by worker
// Eventually consistent
```

**Read Replicas:**
```javascript
// Read from replica for analytics
const analytics = await readReplica.analyticsEvent.findMany();
// Eventually consistent (replication lag)
```

---

## Idempotency Requirements

### Critical Operations (Must Be Idempotent)

1. **Payment Operations:**
   - Payment confirmation
   - Payment refunds
   - Wallet transactions

2. **Inventory Operations:**
   - Stock reservation
   - Stock deduction
   - Stock reversion

3. **Order Operations:**
   - Order creation
   - Order cancellation
   - Order state transitions

4. **Webhook Processing:**
   - All payment gateway webhooks
   - All shipping carrier webhooks

### Idempotency Implementation

```javascript
// Idempotency middleware
const idempotencyMiddleware = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) return next();
  
  // Check if already processed
  const existing = await prisma.idempotencyKey.findUnique({
    where: { key: idempotencyKey }
  });
  
  if (existing && existing.responseBody) {
    return res.status(existing.responseStatus).json(
      JSON.parse(existing.responseBody)
    );
  }
  
  // Process and cache response
  // ...
};
```

---

## Compensation Patterns

### Saga Pattern for Distributed Transactions

```javascript
// Order processing saga
class OrderProcessingSaga {
  async handleOrderPlaced(orderData) {
    try {
      // Step 1: Reserve inventory
      await inventoryService.reserveInventory(orderData);
      
      // Step 2: Process payment
      await paymentService.processPayment(orderData);
      
      // Step 3: Confirm order
      await orderService.confirmOrder(orderData);
    } catch (error) {
      // Compensate: Rollback all steps
      await this.compensate(orderData, error);
    }
  }
  
  async compensate(orderData, error) {
    // Compensate in reverse order
    if (orderData.paymentProcessed) {
      await paymentService.refundPayment(orderData.paymentId);
    }
    if (orderData.inventoryReserved) {
      await inventoryService.revertReservation(orderData.orderId);
    }
    await orderService.cancelOrder(orderData.orderId);
  }
}
```

### Retry with Exponential Backoff

```javascript
async function processWithRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

### Dead-Letter Queue

```javascript
// Failed events go to dead-letter queue
async function processEvent(event) {
  try {
    await handleEvent(event);
  } catch (error) {
    // Move to dead-letter queue
    await deadLetterQueue.add(event, {
      attempts: 0, // Don't retry
      error: error.message
    });
    // Alert operations team
    await alertService.sendAlert('Event processing failed', event);
  }
}
```

---

## Consistency Monitoring

### Metrics to Track

1. **Strong Consistency:**
   - Transaction success rate
   - Lock acquisition time
   - Concurrent modification conflicts
   - Idempotency key hit rate

2. **Eventual Consistency:**
   - Event processing lag
   - Search index update delay
   - Notification delivery time
   - Analytics data freshness

### Alerts

- Strong consistency violations (direct cross-context writes)
- Event processing failures
- High event processing lag
- Lock contention issues
- Idempotency key collisions

---

## Summary

| Context | Strong Consistency | Eventual Consistency | Implementation |
|---------|-------------------|---------------------|----------------|
| Auth | Authentication, passwords, sessions | Profile updates | Transactions, cache invalidation |
| Catalog | Product CRUD, prices | Search index, recommendations | Transactions, outbox pattern |
| Orders | Order creation, state transitions | Tracking, analytics | Transactions, locks, outbox |
| Payments | All payment operations | Analytics, reports | Transactions, idempotency, locks |
| Inventory | All stock operations | Analytics, forecasting | Transactions, distributed locks |
| Notifications | Delivery status | Email/SMS delivery | Job queues, async processing |

This ensures data integrity where critical while allowing performance optimizations through eventual consistency where acceptable.


