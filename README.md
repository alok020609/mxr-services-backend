# E-commerce Backend API

A production-ready, Dockerized e-commerce backend API built with Node.js, Express, PostgreSQL, and Redis. This comprehensive backend provides all the endpoints needed for a full-featured e-commerce platform.

## Features

### Setup & Deployment
- 🚀 **One-Click Setup** - Automated setup script with auto-generated secrets
- 🐳 **Docker Ready** - Complete Docker Compose configuration
- ☁️ **Cloud Platform Support** - Pre-configured for Render and Railway
- 🔒 **Secure by Default** - Auto-generated cryptographically secure secrets
- ✔️ **Pre-deploy check** - Run `npm run validate:deploy` before pushing to catch missing modules and syntax errors (Docker build + load test)

### Core Features
- ✅ **User Authentication & Authorization** - JWT-based auth, email verification, password reset
- ✅ **Product Management** - CRUD operations, variants, categories, search
- ✅ **Shopping Cart** - Add, update, remove items, coupon support
- ✅ **Order Management** - Order creation, tracking, cancellation, returns
- ✅ **Multi-Gateway Payment System** - Stripe, Razorpay, PayU, PayPal, UPI support
- ✅ **Inventory Management** - Stock tracking, low stock alerts, movement history
- ✅ **Reviews & Ratings** - Product reviews with moderation
- ✅ **Coupons & Discounts** - Coupon management and validation
- ✅ **Wishlist** - Save favorite products
- ✅ **Shipping & Tax** - Shipping zones, rates, tax calculation
- ✅ **Notifications** - In-app notifications system
- ✅ **Admin Dashboard** - Comprehensive admin panel with analytics

### Advanced Features (Database Schema Ready)
- Multi-currency support
- Multi-language/Internationalization
- Customer support system
- Loyalty & rewards program
- Advanced marketing (flash sales, bundles, recommendations)
- Digital products & subscriptions
- Gift cards
- Wallet & store credit
- Vendor/marketplace support
- Advanced analytics
- And 50+ more features...

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Payment Gateways**: Stripe, Razorpay (extensible)
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis (or use Docker)

## Quick Start

### One-Click Setup (Recommended)

Get everything set up with a single command:

```bash
git clone <repository-url>
cd ecommerce-backend
npm run setup
```

That's it! The setup script will:
- ✅ Check prerequisites (Node.js 18+, Docker, Docker Compose)
- ✅ Create `.env` file with auto-generated secure secrets
- ✅ Start PostgreSQL and Redis via Docker Compose
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Optionally seed the database

**Quick Setup (Skip Prompts):**
```bash
npm run setup:quick
```

**After setup, start the server:**
```bash
npm run dev
```

**Access the API:**
- API Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health
- Prisma Studio: `npm run prisma:studio`

## Installation (Manual)

If you prefer manual setup:

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Generate secrets: npm run generate:secrets
# Edit .env with your configuration
```

4. **Start with Docker Compose**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Seed the database**
```bash
npm run prisma:seed
```

7. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1
FRONTEND_URL=http://localhost:3000
# APP_URL: public URL of this API (e.g. https://your-app.onrender.com). Used by Swagger "Try it out" and links. Set in production.

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=redis://localhost:6379

# Admin
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=admin123

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-secret
```

## API Endpoints

**Base URL**: `http://localhost:3000/api/v1` (Development) | `https://api.yourdomain.com/api/v1` (Production)

**Authentication**: Most endpoints require Bearer token: `Authorization: Bearer <jwt_token>`

> 📖 **Complete API Documentation**: See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for comprehensive API reference with all 150+ endpoints.

### Authentication & User Management

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### POST /auth/login
Authenticate user and get access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```

---

#### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

---

#### POST /auth/logout
Logout user (requires auth).

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### POST /auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

#### POST /auth/reset-password
Reset password using token.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

#### POST /auth/verify-email
Verify email address.

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

#### GET /users/profile
Get current user profile (requires auth).

**Response (200):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "addresses": []
  }
}
```

---

#### PUT /users/profile
Update user profile (requires auth).

**Request:**
```json
{
  "name": "John Updated",
  "phone": "+1234567891"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Updated",
    "phone": "+1234567891"
  }
}
```

---

#### POST /users/change-password
Change user password (requires auth).

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

#### GET /users/addresses
Get all user addresses (requires auth).

**Response (200):**
```json
{
  "addresses": [
    {
      "id": "addr-123",
      "type": "SHIPPING",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US",
      "isDefault": true
    }
  ]
}
```

---

#### POST /users/addresses
Create new address (requires auth).

**Request:**
```json
{
  "type": "SHIPPING",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "US",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "address": {
    "id": "addr-123",
    "type": "SHIPPING",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "isDefault": false
  }
}
```

---

#### PUT /users/addresses/:id
Update address (requires auth).

**Request:**
```json
{
  "street": "456 Updated St",
  "city": "Boston"
}
```

**Response (200):**
```json
{
  "address": {
    "id": "addr-123",
    "street": "456 Updated St",
    "city": "Boston"
  }
}
```

---

#### DELETE /users/addresses/:id
Delete address (requires auth).

**Response (200):**
```json
{
  "message": "Address deleted successfully"
}
```

---

#### PUT /users/addresses/:id/default
Set address as default (requires auth).

**Response (200):**
```json
{
  "message": "Default address updated"
}
```

---

### Product Management

#### GET /products
Get list of products with filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Category ID
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `sort` (string): Sort field (price, name, createdAt)
- `order` (string): Sort order (asc, desc)

**Example:** `GET /products?page=1&limit=20&category=cat-123&minPrice=10&maxPrice=100&sort=price&order=asc`

**Response (200):**
```json
{
  "products": [
    {
      "id": "prod-123",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "sku": "SKU-123",
      "status": "ACTIVE",
      "stockQuantity": 100,
      "images": ["https://example.com/image1.jpg"],
      "category": {
        "id": "cat-123",
        "name": "Category Name"
      },
      "variants": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

#### GET /products/:id
Get product details.

**Response (200):**
```json
{
  "product": {
    "id": "prod-123",
    "name": "Product Name",
    "description": "Detailed product description",
    "price": 99.99,
    "sku": "SKU-123",
    "status": "ACTIVE",
    "stockQuantity": 100,
    "images": ["https://example.com/image1.jpg"],
    "category": {
      "id": "cat-123",
      "name": "Category Name"
    },
    "variants": [
      {
        "id": "var-123",
        "name": "Size",
        "value": "Large",
        "price": 10.00,
        "stockQuantity": 50
      }
    ],
    "reviews": {
      "averageRating": 4.5,
      "totalReviews": 25
    }
  }
}
```

---

#### POST /products
Create new product (Admin only, requires auth).

**Request:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "sku": "SKU-NEW",
  "categoryId": "cat-123",
  "stockQuantity": 100,
  "status": "ACTIVE"
}
```

**Response (201):**
```json
{
  "product": {
    "id": "prod-123",
    "name": "New Product",
    "price": 99.99,
    "sku": "SKU-NEW"
  }
}
```

---

#### PUT /products/:id
Update product (Admin only, requires auth).

**Request:**
```json
{
  "name": "Updated Product Name",
  "price": 89.99
}
```

**Response (200):**
```json
{
  "product": {
    "id": "prod-123",
    "name": "Updated Product Name",
    "price": 89.99
  }
}
```

---

#### DELETE /products/:id
Delete product (Admin only, requires auth).

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

---

#### GET /categories
Get all categories.

**Response (200):**
```json
{
  "categories": [
    {
      "id": "cat-123",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic products",
      "parentId": null,
      "children": []
    }
  ]
}
```

---

#### POST /categories
Create category (Admin only, requires auth).

**Request:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parentId": null
}
```

**Response (201):**
```json
{
  "category": {
    "id": "cat-123",
    "name": "New Category",
    "slug": "new-category"
  }
}
```

---

### Shopping Cart

#### GET /cart
Get current user's cart (requires auth).

**Response (200):**
```json
{
  "cart": {
    "id": "cart-123",
    "userId": "user-123",
    "items": [
      {
        "id": "item-123",
        "productId": "prod-123",
        "productName": "Product Name",
        "quantity": 2,
        "price": 99.99,
        "subtotal": 199.98
      }
    ],
    "subtotal": 199.98,
    "tax": 19.99,
    "total": 219.97,
    "discount": 0
  }
}
```

---

#### POST /cart/items
Add item to cart (requires auth).

**Request:**
```json
{
  "productId": "prod-123",
  "variantId": "var-123",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "cart": {
    "id": "cart-123",
    "items": [
      {
        "id": "item-123",
        "productId": "prod-123",
        "quantity": 2,
        "price": 99.99
      }
    ],
    "total": 199.98
  }
}
```

---

#### PUT /cart/items/:id
Update cart item quantity (requires auth).

**Request:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "cart": {
    "items": [
      {
        "id": "item-123",
        "quantity": 3
      }
    ],
    "total": 299.97
  }
}
```

---

#### DELETE /cart/items/:id
Remove item from cart (requires auth).

**Response (200):**
```json
{
  "message": "Item removed from cart",
  "cart": {
    "total": 0
  }
}
```

---

#### DELETE /cart
Clear entire cart (requires auth).

**Response (200):**
```json
{
  "message": "Cart cleared successfully"
}
```

---

#### POST /cart/apply-coupon
Apply coupon to cart (requires auth).

**Request:**
```json
{
  "code": "SAVE10"
}
```

**Response (200):**
```json
{
  "message": "Coupon applied successfully",
  "cart": {
    "discount": 10.00,
    "total": 189.98
  }
}
```

---

#### DELETE /cart/remove-coupon
Remove coupon from cart (requires auth).

**Response (200):**
```json
{
  "message": "Coupon removed",
  "cart": {
    "discount": 0,
    "total": 199.98
  }
}
```

---

### Orders

#### POST /orders
Create order from cart (requires auth).

**Request:**
```json
{
  "cartId": "cart-123",
  "shippingAddressId": "addr-123",
  "billingAddressId": "addr-123",
  "paymentMethod": "STRIPE",
  "notes": "Please deliver in the morning"
}
```

**Response (201):**
```json
{
  "order": {
    "id": "order-123",
    "userId": "user-123",
    "status": "CREATED",
    "items": [
      {
        "productId": "prod-123",
        "quantity": 2,
        "price": 99.99,
        "subtotal": 199.98
      }
    ],
    "subtotal": 199.98,
    "tax": 19.99,
    "shipping": 10.00,
    "discount": 10.00,
    "total": 219.97,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /orders
Get user's orders (requires auth).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response (200):**
```json
{
  "orders": [
    {
      "id": "order-123",
      "status": "DELIVERED",
      "total": 219.97,
      "createdAt": "2024-01-01T00:00:00Z",
      "items": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10
  }
}
```

---

#### GET /orders/:id
Get order details (requires auth).

**Response (200):**
```json
{
  "order": {
    "id": "order-123",
    "status": "DELIVERED",
    "items": [
      {
        "productId": "prod-123",
        "productName": "Product Name",
        "quantity": 2,
        "price": 99.99
      }
    ],
    "subtotal": 199.98,
    "tax": 19.99,
    "shipping": 10.00,
    "total": 219.97,
    "tracking": {
      "trackingNumber": "TRACK123",
      "carrier": "UPS",
      "status": "DELIVERED"
    },
    "payment": {
      "status": "SUCCEEDED",
      "method": "STRIPE"
    }
  }
}
```

---

#### PUT /orders/:id/cancel
Cancel order (requires auth).

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

**Response (200):**
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": "order-123",
    "status": "CANCELLED"
  }
}
```

---

#### GET /orders/:id/tracking
Get order tracking information (requires auth).

**Response (200):**
```json
{
  "tracking": {
    "trackingNumber": "TRACK123",
    "carrier": "UPS",
    "status": "IN_TRANSIT",
    "events": [
      {
        "timestamp": "2024-01-01T10:00:00Z",
        "location": "New York, NY",
        "description": "Package in transit"
      }
    ],
    "estimatedDelivery": "2024-01-05T00:00:00Z"
  }
}
```

---

### Payments

#### POST /payments/create-intent
Create payment intent (requires auth).

**Request:**
```json
{
  "orderId": "order-123",
  "amount": 219.97,
  "currency": "USD",
  "gateway": "STRIPE"
}
```

**Response (200):**
```json
{
  "paymentIntent": {
    "id": "pi_123",
    "clientSecret": "pi_123_secret_xyz",
    "amount": 21997,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

---

#### POST /payments/confirm
Confirm payment (requires auth).

**Request:**
```json
{
  "paymentIntentId": "pi_123",
  "paymentMethodId": "pm_123"
}
```

**Response (200):**
```json
{
  "payment": {
    "id": "pay-123",
    "orderId": "order-123",
    "amount": 219.97,
    "status": "SUCCEEDED",
    "gateway": "STRIPE",
    "transactionId": "txn_123"
  }
}
```

---

#### GET /payments/:orderId
Get payment status for order (requires auth).

**Response (200):**
```json
{
  "payment": {
    "id": "pay-123",
    "orderId": "order-123",
    "amount": 219.97,
    "status": "SUCCEEDED",
    "gateway": "STRIPE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST /payments/:id/refund
Process refund (requires auth).

**Request:**
```json
{
  "amount": 219.97,
  "reason": "Customer request"
}
```

**Response (200):**
```json
{
  "refund": {
    "id": "refund-123",
    "paymentId": "pay-123",
    "amount": 219.97,
    "status": "SUCCEEDED",
    "reason": "Customer request"
  }
}
```

---

### Inventory

#### GET /inventory
Get inventory list (Admin only, requires auth).

**Query Parameters:**
- `variantId` (string): Filter by variant
- `lowStock` (boolean): Show only low stock items

**Response (200):**
```json
{
  "inventory": [
    {
      "variantId": "var-123",
      "productName": "Product Name",
      "availableQuantity": 50,
      "reservedQuantity": 10,
      "totalQuantity": 60,
      "lowStockThreshold": 20,
      "isLowStock": false
    }
  ]
}
```

---

#### GET /inventory/:variantId
Get inventory for specific variant.

**Response (200):**
```json
{
  "inventory": {
    "variantId": "var-123",
    "availableQuantity": 50,
    "reservedQuantity": 10,
    "totalQuantity": 60
  }
}
```

---

#### PUT /inventory/:variantId
Update inventory (Admin only, requires auth).

**Request:**
```json
{
  "quantity": 100
}
```

**Response (200):**
```json
{
  "inventory": {
    "variantId": "var-123",
    "availableQuantity": 100
  }
}
```

---

### Reviews & Ratings

#### GET /products/:productId/reviews
Get product reviews.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `rating` (number): Filter by rating (1-5)

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "review-123",
      "userId": "user-123",
      "userName": "John Doe",
      "rating": 5,
      "comment": "Great product!",
      "helpful": 10,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "summary": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "ratingDistribution": {
      "5": 15,
      "4": 7,
      "3": 2,
      "2": 1,
      "1": 0
    }
  }
}
```

---

#### POST /products/:productId/reviews
Create product review (requires auth).

**Request:**
```json
{
  "rating": 5,
  "comment": "Excellent product, highly recommended!"
}
```

**Response (201):**
```json
{
  "review": {
    "id": "review-123",
    "productId": "prod-123",
    "userId": "user-123",
    "rating": 5,
    "comment": "Excellent product, highly recommended!",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT /reviews/:id
Update review (requires auth).

**Request:**
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Response (200):**
```json
{
  "review": {
    "id": "review-123",
    "rating": 4,
    "comment": "Updated review comment"
  }
}
```

---

#### DELETE /reviews/:id
Delete review (requires auth).

**Response (200):**
```json
{
  "message": "Review deleted successfully"
}
```

---

#### POST /reviews/:id/helpful
Mark review as helpful (requires auth).

**Response (200):**
```json
{
  "message": "Review marked as helpful",
  "review": {
    "id": "review-123",
    "helpful": 11
  }
}
```

---

### Coupons & Discounts

#### GET /coupons
Get available coupons.

**Query Parameters:**
- `code` (string): Filter by code

**Response (200):**
```json
{
  "coupons": [
    {
      "id": "coupon-123",
      "code": "SAVE10",
      "type": "PERCENTAGE",
      "value": 10,
      "minPurchase": 50,
      "maxDiscount": 100,
      "validFrom": "2024-01-01T00:00:00Z",
      "validUntil": "2024-12-31T23:59:59Z",
      "isActive": true
    }
  ]
}
```

---

#### POST /coupons
Create coupon (Admin only, requires auth).

**Request:**
```json
{
  "code": "SAVE20",
  "type": "PERCENTAGE",
  "value": 20,
  "minPurchase": 100,
  "maxDiscount": 50,
  "usageLimit": 100,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "coupon": {
    "id": "coupon-123",
    "code": "SAVE20",
    "type": "PERCENTAGE",
    "value": 20
  }
}
```

---

#### POST /coupons/validate
Validate coupon code.

**Request:**
```json
{
  "code": "SAVE10",
  "cartTotal": 100
}
```

**Response (200):**
```json
{
  "valid": true,
  "coupon": {
    "code": "SAVE10",
    "discount": 10
  }
}
```

---

### Wishlist

#### GET /wishlist
Get user's wishlist (requires auth).

**Response (200):**
```json
{
  "wishlist": {
    "id": "wishlist-123",
    "items": [
      {
        "id": "item-123",
        "productId": "prod-123",
        "product": {
          "id": "prod-123",
          "name": "Product Name",
          "price": 99.99,
          "images": []
        },
        "addedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "totalItems": 5
  }
}
```

---

#### POST /wishlist/items
Add product to wishlist (requires auth).

**Request:**
```json
{
  "productId": "prod-123"
}
```

**Response (201):**
```json
{
  "message": "Product added to wishlist",
  "item": {
    "id": "item-123",
    "productId": "prod-123"
  }
}
```

---

#### DELETE /wishlist/items/:id
Remove item from wishlist (requires auth).

**Response (200):**
```json
{
  "message": "Item removed from wishlist"
}
```

---

### Shipping

#### GET /shipping/methods
Get available shipping methods.

**Response (200):**
```json
{
  "methods": [
    {
      "id": "method-123",
      "name": "Standard Shipping",
      "description": "5-7 business days",
      "estimatedDays": 5,
      "price": 10.00
    }
  ]
}
```

---

#### POST /shipping/calculate
Calculate shipping cost.

**Request:**
```json
{
  "address": {
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2,
      "weight": 2.5
    }
  ]
}
```

**Response (200):**
```json
{
  "options": [
    {
      "methodId": "method-123",
      "name": "Standard Shipping",
      "cost": 10.00,
      "estimatedDays": 5
    }
  ]
}
```

---

### Tax

#### POST /tax/calculate
Calculate tax for order.

**Request:**
```json
{
  "address": {
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "items": [
    {
      "productId": "prod-123",
      "price": 99.99,
      "quantity": 2
    }
  ],
  "subtotal": 199.98
}
```

**Response (200):**
```json
{
  "tax": {
    "amount": 19.99,
    "rate": 0.10,
    "breakdown": [
      {
        "type": "SALES_TAX",
        "rate": 0.08,
        "amount": 15.99
      },
      {
        "type": "LOCAL_TAX",
        "rate": 0.02,
        "amount": 4.00
      }
    ]
  }
}
```

---

### Notifications

#### GET /notifications
Get user notifications (requires auth).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `unread` (boolean): Filter unread only

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "notif-123",
      "type": "ORDER_SHIPPED",
      "title": "Order Shipped",
      "message": "Your order #123 has been shipped",
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

---

#### PUT /notifications/:id/read
Mark notification as read (requires auth).

**Response (200):**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "notif-123",
    "read": true
  }
}
```

---

#### PUT /notifications/read-all
Mark all notifications as read (requires auth).

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

---

### Search

#### GET /search
Search products.

**Query Parameters:**
- `q` (string): Search query (required)
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price

**Example:** `GET /search?q=laptop&page=1&limit=20&minPrice=500&maxPrice=2000`

**Response (200):**
```json
{
  "results": [
    {
      "id": "prod-123",
      "name": "Laptop Computer",
      "price": 999.99,
      "images": [],
      "category": "Electronics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  },
  "filters": {
    "categories": [],
    "priceRange": {
      "min": 500,
      "max": 2000
    }
  }
}
```

---

#### GET /search/autocomplete
Get search autocomplete suggestions.

**Query Parameters:**
- `q` (string): Search query (required)

**Response (200):**
```json
{
  "suggestions": [
    "laptop",
    "laptop bag",
    "laptop stand"
  ]
}
```

---

### Admin Endpoints

#### GET /admin/dashboard
Get admin dashboard statistics (Admin only, requires auth).

**Response (200):**
```json
{
  "stats": {
    "totalOrders": 1000,
    "totalRevenue": 50000,
    "totalUsers": 500,
    "totalProducts": 200,
    "recentOrders": [],
    "topProducts": [],
    "revenueByPeriod": {
      "today": 1000,
      "week": 7000,
      "month": 30000
    }
  }
}
```

---

#### GET /admin/users
Get all users (Admin only, requires auth).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `search` (string): Search by email/name

**Response (200):**
```json
{
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500
  }
}
```

---

#### POST /admin/users
Create user (Admin only, requires auth).

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "name": "New User",
  "role": "CUSTOMER"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user-123",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "CUSTOMER"
  }
}
```

---

#### PUT /admin/users/:id
Update user (Admin only, requires auth).

**Request:**
```json
{
  "name": "Updated Name",
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-123",
    "name": "Updated Name",
    "role": "ADMIN"
  }
}
```

---

#### PUT /admin/users/:id/verify
Verify user email (Admin only, requires auth).

**Response (200):**
```json
{
  "message": "User verified successfully",
  "user": {
    "id": "user-123",
    "emailVerified": true
  }
}
```

---

#### PUT /admin/users/:id/activate
Activate/deactivate user (Admin only, requires auth).

**Request:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "message": "User deactivated",
  "user": {
    "id": "user-123",
    "isActive": false
  }
}
```

---

#### PUT /admin/users/:id/role
Update user role (Admin only, requires auth).

**Request:**
```json
{
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "message": "User role updated",
  "user": {
    "id": "user-123",
    "role": "ADMIN"
  }
}
```

---

#### POST /admin/users/:id/reset-password
Reset user password (Admin only, requires auth).

**Request:**
```json
{
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

#### GET /admin/orders
Get all orders (Admin only, requires auth).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `userId` (string): Filter by user

**Response (200):**
```json
{
  "orders": [
    {
      "id": "order-123",
      "userId": "user-123",
      "status": "DELIVERED",
      "total": 219.97,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000
  }
}
```

---

#### GET /admin/orders/:id
Get order details (Admin only, requires auth).

**Response (200):**
```json
{
  "order": {
    "id": "order-123",
    "userId": "user-123",
    "status": "DELIVERED",
    "total": 219.97,
    "items": [],
    "payment": {},
    "tracking": {}
  }
}
```

---

#### PUT /admin/orders/:id/status
Update order status (Admin only, requires auth).

**Request:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123",
  "carrier": "UPS"
}
```

**Response (200):**
```json
{
  "message": "Order status updated",
  "order": {
    "id": "order-123",
    "status": "SHIPPED"
  }
}
```

---

#### POST /admin/orders/:id/cancel
Cancel order (Admin only, requires auth).

**Request:**
```json
{
  "reason": "Customer request"
}
```

**Response (200):**
```json
{
  "message": "Order cancelled",
  "order": {
    "id": "order-123",
    "status": "CANCELLED"
  }
}
```

---

#### POST /admin/orders/:id/refund
Process refund (Admin only, requires auth).

**Request:**
```json
{
  "amount": 219.97,
  "reason": "Customer request"
}
```

**Response (200):**
```json
{
  "message": "Refund processed",
  "refund": {
    "id": "refund-123",
    "amount": 219.97
  }
}
```

---

### Additional Endpoints

#### Analytics
- `GET /analytics/dashboard` - Get analytics dashboard (Admin)
- `GET /analytics/revenue` - Get revenue analytics (Admin)

#### Support
- `GET /support/tickets` - Get user support tickets
- `POST /support/tickets` - Create support ticket
- `GET /support/tickets/:id` - Get ticket details
- `POST /support/tickets/:id/messages` - Add message to ticket

#### Loyalty & Rewards
- `GET /loyalty/points` - Get user loyalty points
- `GET /loyalty/transactions` - Get loyalty transactions
- `POST /loyalty/redeem` - Redeem loyalty points

#### Marketing
- `GET /marketing/flash-sales` - Get active flash sales
- `GET /marketing/recommendations` - Get product recommendations

#### Currency & Internationalization
- `GET /currencies` - Get available currencies
- `POST /currencies/convert` - Convert currency
- `GET /languages` - Get available languages
- `PUT /users/preferences/language` - Set language preference

#### Security
- `POST /security/2fa/enable` - Enable 2FA
- `POST /security/2fa/verify` - Verify 2FA
- `GET /security/devices` - Get trusted devices
- `DELETE /security/devices/:id` - Remove device
- `GET /security/sessions` - Get active sessions
- `POST /security/sessions/logout-all` - Logout all sessions

#### Mobile Backend
- `POST /mobile/push/register` - Register for push notifications
- `GET /mobile/app/version` - Get app version info

#### Social Commerce
- `POST /auth/social/login` - Social login (Google, Facebook, Apple)
- `POST /products/:id/share` - Share product on social media

#### Subscriptions
- `GET /subscriptions` - Get user subscriptions
- `POST /subscriptions` - Create subscription
- `PUT /subscriptions/:id/pause` - Pause subscription
- `PUT /subscriptions/:id/cancel` - Cancel subscription

#### Gift Features
- `POST /gifts/registry` - Create gift registry
- `POST /orders/:id/gift` - Add gift options to order

#### Wallet & Financial
- `GET /wallet` - Get wallet balance
- `POST /wallet/deposit` - Deposit to wallet
- `GET /store-credit` - Get store credit balance

#### Vendor/Marketplace
- `GET /vendors` - Get all vendors (Admin)
- `POST /vendors/register` - Register as vendor
- `GET /vendors/:id/products` - Get vendor products

#### Content Management
- `GET /cms/pages` - Get CMS pages
- `GET /cms/pages/:slug` - Get CMS page by slug
- `GET /blog/posts` - Get blog posts

#### Operational Features
- `POST /bulk/operations` - Perform bulk operation (Admin)
- `GET /jobs` - Get background jobs (Admin)

---

### Error Responses

All endpoints may return standard error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request data",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**422 Unprocessable Entity:**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

### Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per minute
- **Payment endpoints**: 10 requests per minute
- **Admin endpoints**: 200 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

### Pagination

List endpoints support pagination:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### API Documentation

- **Swagger UI**: `http://localhost:3000/api-docs` (Interactive API documentation)
- **Complete API Reference**: See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for all 150+ endpoints with detailed examples
- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)

## Database Schema

The database includes 100+ models covering:
- User management & authentication
- Products, variants, categories
- Orders, payments, shipping
- Inventory, reviews, coupons
- Notifications, analytics
- Admin, settings, logs
- And much more...

See `prisma/schema.prisma` for the complete schema.

## Docker

### Build and run
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop services
```bash
docker-compose down
```

### Pre-deploy validation
Before pushing (e.g. to trigger a Render deploy), run `npm run validate:deploy` to build the Docker image and verify the app loads without MODULE_NOT_FOUND or syntax errors. Optionally use `npm run validate:load` (no Docker) to test with tracked files only.

## Development

### Run migrations
```bash
npm run prisma:migrate
```

### Open Prisma Studio
```bash
npm run prisma:studio
```

### Run tests
```bash
npm test
```

### Lint code
```bash
npm run lint
```

## Project Structure

```
ecommerce-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Seed data
├── docker-compose.yml  # Docker configuration
├── Dockerfile          # Docker image
└── package.json        # Dependencies
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet.js security headers
- CORS configuration
- Input validation with Joi
- SQL injection protection (Prisma)

## Performance

- Redis caching
- Response compression
- Database query optimization
- Connection pooling
- Indexed database queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.
