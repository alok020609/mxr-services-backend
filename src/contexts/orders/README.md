# Orders Context

## Overview
The Orders context manages order lifecycle, shopping cart, order tracking, and returns.

## API Endpoints

### Shopping Cart
- `GET /api/v1/cart` - Get current cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove item from cart
- `DELETE /api/v1/cart` - Clear cart
- `POST /api/v1/cart/apply-coupon` - Apply coupon to cart
- `DELETE /api/v1/cart/remove-coupon` - Remove coupon from cart

### Orders
- `POST /api/v1/orders` - Create order from cart
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/cancel` - Cancel order
- `POST /api/v1/orders/:id/return` - Request return

### Order Tracking
- `GET /api/v1/orders/:id/tracking` - Get order tracking
- `GET /api/v1/order-tracking/:trackingNumber` - Track by tracking number

### Order State
- `GET /api/v1/orders/:id/state` - Get order state
- `POST /api/v1/orders/:id/state/transition` - Transition order state (admin)

### Returns
- `GET /api/v1/returns` - List return requests
- `GET /api/v1/returns/:id` - Get return details
- `POST /api/v1/returns/:id/approve` - Approve return (admin)
- `POST /api/v1/returns/:id/reject` - Reject return (admin)

## Events Published

- `OrderPlaced` - When an order is created
- `OrderCancelled` - When an order is cancelled
- `OrderConfirmed` - When order is confirmed (payment + inventory reserved)
- `OrderShipped` - When order is shipped
- `OrderDelivered` - When order is delivered
- `OrderReturnRequested` - When a return is requested
- `OrderReturnApproved` - When a return is approved
- `OrderReturnRejected` - When a return is rejected
- `OrderRefunded` - When an order is refunded
- `CartUpdated` - When cart is updated
- `CartAbandoned` - When cart is abandoned (after timeout)

## Events Subscribed

- `PaymentConfirmed` (from Payments) - Confirm order payment
- `PaymentFailed` (from Payments) - Mark order payment as failed
- `PaymentRefunded` (from Payments) - Process refund
- `InventoryReserved` (from Inventory) - Confirm inventory reservation
- `InventoryReservationFailed` (from Inventory) - Handle inventory failure
- `ProductUpdated` (from Catalog) - Update cart/order if product changed

## Data Models

- `Order` - Orders
- `OrderItem` - Order line items
- `OrderReturn` - Return requests
- `OrderTracking` - Order tracking information
- `Cart` - Shopping carts
- `CartItem` - Cart items
- `OrderSplit` - Split orders
- `OrderNote` - Order notes (customer/admin)
- `ScheduledDelivery` - Scheduled deliveries
- `OrderPaymentPlan` - Payment plans for orders

## Dependencies

- Database: PostgreSQL (Prisma)
- State Machine: Order state machine service
- Cache: Redis (cart storage)
- Event Bus: For cross-context communication

## Cross-Context Rules

- Must coordinate with Payments context for payment processing
- Must coordinate with Inventory context for stock reservation
- Cannot directly modify product or inventory data
- Order creation triggers events for Payments and Inventory contexts
- Order status updates are published as events

## Order State Machine

States:
- `CREATED` - Order created, awaiting payment
- `PAYMENT_PENDING` - Payment initiated
- `PAYMENT_FAILED` - Payment failed
- `PAID` - Payment confirmed
- `PACKED` - Order packed
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled
- `RETURN_REQUESTED` - Return requested
- `RETURNED` - Return completed
- `REFUNDED` - Refund processed

Transitions are managed by the order state machine service with guards and actions.


