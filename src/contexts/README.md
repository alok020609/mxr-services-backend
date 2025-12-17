# Bounded Contexts & Service Boundaries

This directory defines the explicit bounded contexts for the e-commerce system. Each context represents a distinct domain with clear ownership, API boundaries, and communication rules.

## Context Structure

```
src/contexts/
├── auth/              # Authentication & Authorization Context
├── catalog/           # Product Catalog Context
├── orders/            # Order Management Context
├── payments/          # Payment Processing Context
├── inventory/         # Inventory Management Context
└── notifications/     # Notification Context
```

## Context Definitions

### 1. Auth Context (`/contexts/auth`)

**Ownership:**
- User accounts and authentication
- User profiles and addresses
- Sessions and device management
- Login attempts and security
- API keys and permissions
- 2FA/MFA management

**API Boundaries:**
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/users/profile/*` - User profile management
- `/api/v1/users/addresses/*` - Address management
- `/api/v1/security/*` - Security features (2FA, devices, sessions)

**Data Models Owned:**
- `User`, `Address`, `Device`, `LoginAttempt`, `Session`, `APIKey`, `AuditLog`

**Cross-Context Communication:**
- Publishes: `UserCreated`, `UserUpdated`, `UserVerified`, `PasswordChanged`, `LoginSucceeded`, `LoginFailed`
- Subscribes: None (auth is a foundational context)

**Rules:**
- Only Auth context can create/update/delete users
- Other contexts can READ user data via events or API calls
- No direct database writes to User table from other contexts

---

### 2. Catalog Context (`/contexts/catalog`)

**Ownership:**
- Products and product variants
- Categories and taxonomies
- Product search and indexing
- Product reviews and ratings
- Product recommendations
- Digital products and subscriptions
- Product bundles and customization

**API Boundaries:**
- `/api/v1/products/*` - Product CRUD operations
- `/api/v1/categories/*` - Category management
- `/api/v1/search/*` - Search and discovery
- `/api/v1/reviews/*` - Product reviews
- `/api/v1/recommendations/*` - Product recommendations

**Data Models Owned:**
- `Product`, `ProductVariant`, `Category`, `Review`, `ProductBundle`, `ProductRecommendation`, `DigitalProduct`, `Subscription`, `PreOrder`, `ProductCustomization`, `RecentlyViewed`, `SavedSearch`, `ProductQuestion`, `SizeGuide`, `ProductVideo`, `SocialProof`, `Waitlist`, `ProductAlert`

**Cross-Context Communication:**
- Publishes: `ProductCreated`, `ProductUpdated`, `ProductDeleted`, `ProductStockChanged`, `ReviewCreated`, `ReviewUpdated`
- Subscribes: `OrderPlaced` (to update recently viewed, recommendations)

**Rules:**
- Only Catalog context can create/update/delete products
- Inventory context can READ product data but not modify it
- Orders context can READ product data for order creation

---

### 3. Orders Context (`/contexts/orders`)

**Ownership:**
- Order creation and management
- Order state machine and transitions
- Order tracking and history
- Order returns and refunds
- Shopping cart
- Order splitting and partial fulfillment
- Scheduled deliveries
- Gift options

**API Boundaries:**
- `/api/v1/orders/*` - Order management
- `/api/v1/cart/*` - Shopping cart operations
- `/api/v1/order-tracking/*` - Order tracking
- `/api/v1/returns/*` - Return requests
- `/api/v1/order-enhancements/*` - Advanced order features

**Data Models Owned:**
- `Order`, `OrderItem`, `OrderReturn`, `OrderTracking`, `Cart`, `CartItem`, `OrderSplit`, `OrderNote`, `ScheduledDelivery`, `OrderPaymentPlan`

**Cross-Context Communication:**
- Publishes: `OrderPlaced`, `OrderCancelled`, `OrderShipped`, `OrderDelivered`, `OrderReturnRequested`, `OrderRefunded`, `CartUpdated`
- Subscribes: `PaymentConfirmed` (from Payments), `InventoryReserved` (from Inventory), `ProductUpdated` (from Catalog)

**Rules:**
- Only Orders context can create/update/delete orders
- Must coordinate with Payments context for payment processing
- Must coordinate with Inventory context for stock reservation
- Cannot directly modify product or inventory data

---

### 4. Payments Context (`/contexts/payments`)

**Ownership:**
- Payment processing and transactions
- Payment gateway integration
- Payment methods and saved cards
- Refunds and chargebacks
- Payment plans and installments
- Wallet and store credit
- Payment reconciliation

**API Boundaries:**
- `/api/v1/payments/*` - Payment processing
- `/api/v1/payment-methods/*` - Payment method management
- `/api/v1/wallet/*` - Wallet operations
- `/api/v1/webhooks/payments/*` - Payment webhooks
- `/api/v1/advanced-payments/*` - Advanced payment features

**Data Models Owned:**
- `Payment`, `PaymentGateway`, `PaymentTransaction`, `Wallet`, `WalletTransaction`, `StoreCredit`, `StoreCreditTransaction`, `PaymentPlan`, `OrderPaymentPlan`

**Cross-Context Communication:**
- Publishes: `PaymentInitiated`, `PaymentConfirmed`, `PaymentFailed`, `PaymentRefunded`, `PaymentCancelled`
- Subscribes: `OrderPlaced` (from Orders), `OrderCancelled` (from Orders)

**Rules:**
- Only Payments context can create/update payment transactions
- Must coordinate with Orders context for order payment status
- Cannot directly modify order data (only via events)
- Payment webhooks must be idempotent

---

### 5. Inventory Context (`/contexts/inventory`)

**Ownership:**
- Stock levels and availability
- Inventory movements and history
- Warehouse management
- Stock transfers
- Low stock alerts
- Demand forecasting
- Cycle counting and shrinkage

**API Boundaries:**
- `/api/v1/inventory/*` - Inventory management
- `/api/v1/warehouses/*` - Warehouse operations
- `/api/v1/inventory-movements/*` - Movement tracking
- `/api/v1/advanced-inventory/*` - Advanced inventory features

**Data Models Owned:**
- `Inventory`, `InventoryMovement`, `Warehouse`, `WarehouseStock`

**Cross-Context Communication:**
- Publishes: `InventoryReserved`, `InventoryDeducted`, `InventoryReverted`, `LowStockAlert`, `OutOfStock`, `StockUpdated`
- Subscribes: `OrderPlaced` (from Orders), `OrderCancelled` (from Orders), `ProductCreated` (from Catalog)

**Rules:**
- Only Inventory context can modify stock levels
- Must use distributed locks for concurrent stock updates
- Orders context can READ inventory but not modify it
- Catalog context can READ inventory for display purposes

---

### 6. Notifications Context (`/contexts/notifications`)

**Ownership:**
- Email notifications
- In-app notifications
- SMS notifications
- Push notifications
- Notification templates
- Notification preferences
- Notification delivery tracking

**API Boundaries:**
- `/api/v1/notifications/*` - Notification management
- `/api/v1/notification-preferences/*` - User preferences
- `/api/v1/email-templates/*` - Email template management

**Data Models Owned:**
- `Notification`, `NotificationTemplate`, `EmailTemplate`, `StockNotification`

**Cross-Context Communication:**
- Publishes: `NotificationSent`, `NotificationFailed`, `EmailDelivered`
- Subscribes: `OrderPlaced`, `OrderShipped`, `OrderDelivered`, `PaymentConfirmed`, `UserCreated`, `ProductCreated`, `LowStockAlert` (from all contexts)

**Rules:**
- Only Notifications context can send notifications
- Other contexts publish events, Notifications context handles delivery
- No direct database writes to notification tables from other contexts
- Notification delivery is eventually consistent

---

## Communication Rules

### 1. Within Context
- Direct function calls and database access allowed
- Shared services within the same context
- No restrictions on internal communication

### 2. Cross-Context Communication
- **MUST** use event-based communication only
- **MUST NOT** make direct database writes to other contexts' tables
- **MUST NOT** call other contexts' services directly
- **CAN** read other contexts' data via events or API calls (read-only)

### 3. Event Publishing
- Use `eventService.publishDomainEvent()` for domain events
- Include aggregate type, aggregate ID, and correlation ID
- Events must be idempotent and versioned

### 4. Event Subscribing
- Subscribe to events in service initialization
- Handle events asynchronously
- Implement retry logic for event processing
- Use outbox pattern for reliable event delivery

## API Boundary Enforcement

### Middleware
- Context-specific middleware validates API boundaries
- Rate limiting per context
- Authentication/authorization per context

### Database Access
- Row-level security enforces context boundaries
- Database views for cross-context read access
- No foreign key constraints across contexts (use events instead)

### Service Layer
- Services are scoped to their context
- Cross-context operations use event bus
- Shared utilities are context-agnostic

## Example: Order Placement Flow

```
1. Orders Context: Create order
   └─> Publishes: OrderPlaced event

2. Inventory Context: Subscribe to OrderPlaced
   └─> Reserve inventory
   └─> Publishes: InventoryReserved or InventoryReservationFailed

3. Payments Context: Subscribe to OrderPlaced
   └─> Initiate payment
   └─> Publishes: PaymentInitiated

4. Orders Context: Subscribe to InventoryReserved & PaymentInitiated
   └─> Update order status to CONFIRMED
   └─> Publishes: OrderConfirmed

5. Notifications Context: Subscribe to OrderConfirmed
   └─> Send order confirmation email
```

## Migration Strategy

1. **Phase 1**: Define contexts and boundaries (current)
2. **Phase 2**: Move code into context directories
3. **Phase 3**: Implement event-based communication
4. **Phase 4**: Enforce boundaries with middleware
5. **Phase 5**: Extract to microservices (optional future step)

## Benefits

1. **Clear Ownership**: Each context owns its data and logic
2. **Independent Evolution**: Contexts can evolve independently
3. **Scalability**: Contexts can be scaled independently
4. **Testability**: Clear boundaries make testing easier
5. **Maintainability**: Reduced coupling improves maintainability
6. **Microservices Ready**: Easy to extract contexts into microservices


