# Data Ownership Matrix

This document defines data ownership rules for each bounded context. It specifies which context owns which data models and the rules for cross-context access.

## Ownership Rules

1. **Single Owner**: Each data model has exactly one owning context
2. **Write Access**: Only the owning context can create/update/delete records
3. **Read Access**: Other contexts can read data via events or API calls (read-only)
4. **Cross-Context Updates**: Must use events, never direct database writes

## Data Ownership Matrix

| Data Model | Owner Context | Read Access | Write Access | Notes |
|------------|---------------|-------------|--------------|-------|
| **Auth Context** |
| `User` | Auth | All contexts | Auth only | User identity and authentication |
| `Address` | Auth | All contexts | Auth only | User addresses |
| `Device` | Auth | Auth only | Auth only | Trusted devices |
| `LoginAttempt` | Auth | Auth only | Auth only | Login history |
| `Session` | Auth | Auth only | Auth only | Active sessions |
| `APIKey` | Auth | Auth only | Auth only | API keys |
| `AuditLog` | Auth | Auth, Admin | Auth only | Security audit logs |
| **Catalog Context** |
| `Product` | Catalog | All contexts | Catalog only | Product information |
| `ProductVariant` | Catalog | All contexts | Catalog only | Product variants |
| `Category` | Catalog | All contexts | Catalog only | Product categories |
| `Review` | Catalog | All contexts | Catalog only | Product reviews |
| `ProductBundle` | Catalog | All contexts | Catalog only | Product bundles |
| `ProductRecommendation` | Catalog | All contexts | Catalog only | Recommendations |
| `DigitalProduct` | Catalog | All contexts | Catalog only | Digital products |
| `Subscription` | Catalog | All contexts | Catalog only | Subscription products |
| `PreOrder` | Catalog | All contexts | Catalog only | Pre-orders |
| `ProductCustomization` | Catalog | All contexts | Catalog only | Customization options |
| `RecentlyViewed` | Catalog | Catalog only | Catalog only | Recently viewed products |
| `SavedSearch` | Catalog | Catalog only | Catalog only | Saved searches |
| `ProductQuestion` | Catalog | All contexts | Catalog only | Product Q&A |
| `SizeGuide` | Catalog | All contexts | Catalog only | Size guides |
| `ProductVideo` | Catalog | All contexts | Catalog only | Product videos |
| `SocialProof` | Catalog | All contexts | Catalog only | Social proof data |
| `Waitlist` | Catalog | Catalog only | Catalog only | Waitlist |
| `ProductAlert` | Catalog | Catalog only | Catalog only | Product alerts |
| **Orders Context** |
| `Order` | Orders | All contexts | Orders only | Orders |
| `OrderItem` | Orders | All contexts | Orders only | Order line items |
| `OrderReturn` | Orders | All contexts | Orders only | Return requests |
| `OrderTracking` | Orders | All contexts | Orders only | Order tracking |
| `Cart` | Orders | Orders only | Orders only | Shopping carts |
| `CartItem` | Orders | Orders only | Orders only | Cart items |
| `OrderSplit` | Orders | Orders only | Orders only | Split orders |
| `OrderNote` | Orders | Orders only | Orders only | Order notes |
| `ScheduledDelivery` | Orders | Orders only | Orders only | Scheduled deliveries |
| `OrderPaymentPlan` | Orders | Orders, Payments | Orders only | Payment plans |
| **Payments Context** |
| `Payment` | Payments | Orders, Payments | Payments only | Payment records |
| `PaymentGateway` | Payments | Payments only | Payments only | Gateway configs |
| `PaymentTransaction` | Payments | Payments only | Payments only | Transaction history |
| `Wallet` | Payments | Payments only | Payments only | User wallets |
| `WalletTransaction` | Payments | Payments only | Payments only | Wallet transactions |
| `StoreCredit` | Payments | Payments only | Payments only | Store credit |
| `StoreCreditTransaction` | Payments | Payments only | Payments only | Store credit transactions |
| `PaymentPlan` | Payments | Payments only | Payments only | Payment plans |
| **Inventory Context** |
| `Inventory` | Inventory | All contexts | Inventory only | Stock levels |
| `InventoryMovement` | Inventory | Inventory only | Inventory only | Movement history |
| `Warehouse` | Inventory | Inventory only | Inventory only | Warehouses |
| `WarehouseStock` | Inventory | Inventory only | Inventory only | Warehouse stock |
| **Notifications Context** |
| `Notification` | Notifications | Notifications only | Notifications only | In-app notifications |
| `NotificationTemplate` | Notifications | Notifications only | Notifications only | Notification templates |
| `EmailTemplate` | Notifications | Notifications only | Notifications only | Email templates |
| `StockNotification` | Notifications | Notifications only | Notifications only | Stock notifications |
| **Shared/System Models** |
| `Settings` | Admin | All contexts | Admin only | System settings |
| `Currency` | Admin | All contexts | Admin only | Currency data |
| `Language` | Admin | All contexts | Admin only | Language data |
| `Translation` | Admin | All contexts | Admin only | Translations |
| `Coupon` | Admin | Orders, Admin | Admin only | Coupons |
| `CouponUsage` | Orders | Orders, Admin | Orders only | Coupon usage |
| `Wishlist` | Orders | Orders only | Orders only | Wishlists |
| `ShippingMethod` | Admin | Orders, Admin | Admin only | Shipping methods |
| `ShippingZone` | Admin | Orders, Admin | Admin only | Shipping zones |
| `ShippingRate` | Admin | Orders, Admin | Admin only | Shipping rates |
| `TaxRule` | Admin | Orders, Admin | Admin only | Tax rules |
| `File` | Admin | All contexts | Admin only | File uploads |
| `ActivityLog` | Admin | Admin only | Admin only | Activity logs |
| `SystemLog` | Admin | Admin only | Admin only | System logs |
| `Backup` | Admin | Admin only | Admin only | Backups |
| `AdminPermission` | Admin | Admin only | Admin only | Admin permissions |

## Cross-Context Read Access Rules

### 1. Direct API Calls (Read-Only)
- Contexts can make read-only API calls to other contexts
- No write operations allowed via API calls
- Example: Orders context reads Product data from Catalog API

### 2. Event-Based Data Sharing
- Contexts publish events with relevant data
- Subscribing contexts receive data via events
- Example: Catalog publishes `ProductUpdated` event with product data

### 3. Database Views (Read-Only)
- Database views can be created for cross-context read access
- Views are read-only and owned by the owning context
- Example: `v_product_inventory` view for Catalog + Inventory data

## Cross-Context Write Access Rules

### 1. Event Publishing Only
- Contexts publish events to request changes
- Owning context processes events and updates data
- Example: Orders publishes `OrderPlaced`, Inventory subscribes and reserves stock

### 2. No Direct Database Writes
- Contexts MUST NOT write directly to other contexts' tables
- All cross-context updates must go through events
- Violations should be caught by database constraints or middleware

### 3. Idempotent Event Processing
- Event handlers must be idempotent
- Use idempotency keys for critical operations
- Example: Payment webhook processing with idempotency keys

## Source of Truth Definitions

| Domain | Source of Truth | Replication Strategy |
|--------|----------------|----------------------|
| User Identity | Auth Context (User table) | Events: UserCreated, UserUpdated |
| Product Data | Catalog Context (Product table) | Events: ProductCreated, ProductUpdated |
| Order Data | Orders Context (Order table) | Events: OrderPlaced, OrderUpdated |
| Payment Data | Payments Context (Payment table) | Events: PaymentConfirmed, PaymentRefunded |
| Inventory Data | Inventory Context (Inventory table) | Events: StockUpdated, InventoryDeducted |
| Notification Data | Notifications Context (Notification table) | Events: NotificationSent |

## Data Consistency Rules

### Strong Consistency (Immediate)
- **User Authentication**: Auth context must have immediate consistency
- **Order Creation**: Orders context must have immediate consistency
- **Payment Processing**: Payments context must have immediate consistency
- **Inventory Deduction**: Inventory context must have immediate consistency (with locks)

### Eventual Consistency (Acceptable Delay)
- **Product Search Index**: Catalog context can have eventual consistency
- **Analytics Data**: Can be eventually consistent
- **Notification Delivery**: Notifications context can have eventual consistency
- **Recommendations**: Catalog context can have eventual consistency

## Enforcement Mechanisms

### 1. Database Constraints
- Foreign key constraints within context only
- No foreign keys across contexts
- Use events for cross-context relationships

### 2. Middleware
- API boundary middleware validates context ownership
- Prevents unauthorized cross-context writes
- Logs violations for monitoring

### 3. Code Reviews
- Review process ensures context boundaries
- Static analysis tools can detect violations
- Documentation must specify context ownership

### 4. Testing
- Integration tests verify context boundaries
- Contract tests ensure event contracts
- E2E tests verify cross-context flows

## Migration Path

1. **Phase 1**: Define ownership (current)
2. **Phase 2**: Add middleware to enforce boundaries
3. **Phase 3**: Refactor direct writes to use events
4. **Phase 4**: Add database constraints
5. **Phase 5**: Extract to microservices (optional)

## Benefits

1. **Clear Ownership**: No ambiguity about who owns what
2. **Reduced Coupling**: Contexts are independent
3. **Easier Testing**: Clear boundaries make testing easier
4. **Scalability**: Contexts can be scaled independently
5. **Maintainability**: Changes are localized to owning context
6. **Microservices Ready**: Easy to extract contexts later


