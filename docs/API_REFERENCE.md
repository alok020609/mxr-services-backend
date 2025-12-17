# Complete API Reference

This document provides a comprehensive reference for all API endpoints in the e-commerce backend, organized by features and HTTP methods.

**Base URL**: `https://api.yourdomain.com/api/v1`

**Authentication**: Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Product Management](#product-management)
3. [Shopping Cart](#shopping-cart)
4. [Orders](#orders)
5. [Payments](#payments)
6. [Inventory](#inventory)
7. [Reviews & Ratings](#reviews--ratings)
8. [Coupons & Discounts](#coupons--discounts)
9. [Wishlist](#wishlist)
10. [Shipping](#shipping)
11. [Tax](#tax)
12. [Notifications](#notifications)
13. [Admin](#admin)
14. [Search](#search)
15. [Analytics](#analytics)
16. [Support](#support)
17. [Loyalty & Rewards](#loyalty--rewards)
18. [Marketing](#marketing)
19. [Advanced Features](#advanced-features)
20. [Currency & Internationalization](#currency--internationalization)
21. [Security](#security)
22. [Mobile Backend](#mobile-backend)
23. [Social Commerce](#social-commerce)
24. [Subscriptions](#subscriptions)
25. [Gift Features](#gift-features)
26. [Wallet & Financial](#wallet--financial)
27. [Vendor/Marketplace](#vendormarketplace)
28. [Content Management](#content-management)
29. [Operational Features](#operational-features)

---

## Authentication & User Management

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
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

**Error Responses:**
- `400 Bad Request`: Invalid input, email already exists
- `422 Unprocessable Entity`: Validation errors

---

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
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

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

---

### POST /auth/logout
Logout user and invalidate token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

---

### POST /auth/verify-email
Verify email address.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully"
}
```

---

### POST /auth/resend-verification
Resend email verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification email sent"
}
```

---

### GET /users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

### PUT /users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567891"
}
```

**Response (200 OK):**
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

### POST /users/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

### Address Management

#### GET /users/addresses
Get all user addresses.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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
Create new address.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
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

**Response (201 Created):**
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
Update address.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "street": "456 Updated St",
  "city": "Boston"
}
```

**Response (200 OK):**
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
Delete address.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Address deleted successfully"
}
```

---

#### GET /users/addresses/default
Get default address.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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
    "isDefault": true
  }
}
```

---

#### GET /users/addresses/:id
Get specific address.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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
    "isDefault": true
  }
}
```

---

#### PUT /users/addresses/:id/default
Set address as default.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Default address updated"
}
```

---

## Product Management

### GET /products
Get list of products with filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Category ID
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `sort` (string): Sort field (price, name, createdAt)
- `order` (string): Sort order (asc, desc)

**Example:**
```
GET /products?page=1&limit=20&category=cat-123&minPrice=10&maxPrice=100&sort=price&order=asc
```

**Response (200 OK):**
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

### GET /products/:id
Get product details.

**Response (200 OK):**
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
    "specifications": {},
    "reviews": {
      "averageRating": 4.5,
      "totalReviews": 25
    }
  }
}
```

---

### POST /products
Create new product (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
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

**Response (201 Created):**
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

### PUT /products/:id
Update product (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 89.99
}
```

**Response (200 OK):**
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

### DELETE /products/:id
Delete product (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "message": "Product deleted successfully"
}
```

---

### Categories

#### GET /categories
Get all categories.

**Response (200 OK):**
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

#### GET /products/categories/:id
Get category by ID.

**Response (200 OK):**
```json
{
  "category": {
    "id": "cat-123",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic products",
    "parentId": null,
    "children": []
  }
}
```

---

#### POST /products/categories
Create category (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parentId": null
}
```

**Response (201 Created):**
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

#### PUT /products/categories/:id
Update category (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Category",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "category": {
    "id": "cat-123",
    "name": "Updated Category"
  }
}
```

---

#### DELETE /products/categories/:id
Delete category (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "message": "Category deleted successfully"
}
```

---

## Shopping Cart

### GET /cart
Get current user's cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

### POST /cart/items
Add item to cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "variantId": "var-123",
  "quantity": 2
}
```

**Response (200 OK):**
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

### PUT /cart/items/:id
Update cart item quantity.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
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

### DELETE /cart/items/:id
Remove item from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Item removed from cart",
  "cart": {
    "total": 0
  }
}
```

---

### DELETE /cart
Clear entire cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Cart cleared successfully"
}
```

---

### GET /cart/calculate
Calculate cart totals (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "cart": {
    "subtotal": 199.98,
    "tax": 19.99,
    "shipping": 10.00,
    "discount": 10.00,
    "total": 219.97
  }
}
```

---

### POST /cart/apply-coupon
Apply coupon to cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "SAVE10"
}
```

**Response (200 OK):**
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

### DELETE /cart/remove-coupon
Remove coupon from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

## Orders

### POST /orders
Create order from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cartId": "cart-123",
  "shippingAddressId": "addr-123",
  "billingAddressId": "addr-123",
  "paymentMethod": "STRIPE",
  "notes": "Please deliver in the morning"
}
```

**Response (201 Created):**
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
    "shippingAddress": {},
    "billingAddress": {},
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /orders
Get user's orders.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response (200 OK):**
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

### GET /orders/:id
Get order details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

### PUT /orders/:id/cancel
Cancel order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response (200 OK):**
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

### GET /orders/:id/tracking
Get order tracking information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

## Payments

### GET /payments/gateways
Get available payment gateways.

**Response (200 OK):**
```json
{
  "gateways": [
    {
      "id": "STRIPE",
      "name": "Stripe",
      "isActive": true,
      "supportedCurrencies": ["USD", "EUR"],
      "supportedMethods": ["card", "bank_transfer"]
    },
    {
      "id": "RAZORPAY",
      "name": "Razorpay",
      "isActive": true,
      "supportedCurrencies": ["INR"],
      "supportedMethods": ["card", "upi", "netbanking"]
    }
  ]
}
```

---

### POST /payments/create-intent
Create payment intent.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order-123",
  "amount": 219.97,
  "currency": "USD",
  "gateway": "STRIPE"
}
```

**Response (200 OK):**
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

### POST /payments/confirm
Confirm payment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_123",
  "paymentMethodId": "pm_123"
}
```

**Response (200 OK):**
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

### GET /payments/:orderId
Get payment status for order.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

### GET /payments/:orderId/history
Get payment history for order (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "history": [
    {
      "id": "pay-123",
      "amount": 219.97,
      "status": "SUCCEEDED",
      "gateway": "STRIPE",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /payments/:id/refund
Process refund.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 219.97,
  "reason": "Customer request"
}
```

**Response (200 OK):**
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

## Inventory

### GET /inventory
Get inventory list (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `variantId` (string): Filter by variant
- `lowStock` (boolean): Show only low stock items

**Response (200 OK):**
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

### GET /inventory/:variantId
Get inventory for specific variant.

**Response (200 OK):**
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

### PUT /inventory/:productId
Update inventory (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "quantity": 100
}
```

**Response (200 OK):**
```json
{
  "inventory": {
    "productId": "prod-123",
    "availableQuantity": 100
  }
}
```

---

### GET /inventory/:productId/movements
Get inventory movement history (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "movements": [
    {
      "id": "mov-123",
      "type": "SALE",
      "quantity": -2,
      "reason": "Order #123",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Reviews & Ratings

### GET /products/:productId/reviews
Get product reviews.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `rating` (number): Filter by rating (1-5)

**Response (200 OK):**
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

### POST /products/:productId/reviews
Create product review.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent product, highly recommended!"
}
```

**Response (201 Created):**
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

### PUT /reviews/:id
Update review.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Response (200 OK):**
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

### DELETE /reviews/:id
Delete review.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Review deleted successfully"
}
```

---

### POST /reviews/:id/helpful
Mark review as helpful.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

### POST /reviews/:id/report
Report review (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "SPAM",
  "description": "This review appears to be spam"
}
```

**Response (200 OK):**
```json
{
  "message": "Review reported successfully"
}
```

---

## Coupons & Discounts

### GET /coupons
Get available coupons.

**Query Parameters:**
- `code` (string): Filter by code

**Response (200 OK):**
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

### POST /coupons
Create coupon (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
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

**Response (201 Created):**
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

### GET /coupons/:code
Get coupon by code.

**Response (200 OK):**
```json
{
  "coupon": {
    "id": "coupon-123",
    "code": "SAVE10",
    "type": "PERCENTAGE",
    "value": 10,
    "isActive": true
  }
}
```

---

### POST /coupons/validate
Validate coupon code.

**Request Body:**
```json
{
  "code": "SAVE10",
  "cartTotal": 100
}
```

**Response (200 OK):**
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

### GET /coupons/my-coupons
Get user's available coupons (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "coupons": [
    {
      "id": "coupon-123",
      "code": "SAVE10",
      "type": "PERCENTAGE",
      "value": 10,
      "validUntil": "2024-12-31T23:59:59Z"
    }
  ]
}
```

---

## Wishlist

### GET /wishlist
Get user's wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

### POST /wishlist/items
Add product to wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123"
}
```

**Response (201 Created):**
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

### DELETE /wishlist/remove/:productId
Remove item from wishlist by product ID (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Item removed from wishlist"
}
```

---

### GET /wishlist/check/:productId
Check if product is in wishlist (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "inWishlist": true,
  "item": {
    "id": "item-123",
    "productId": "prod-123",
    "addedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Shipping

### GET /shipping/methods
Get available shipping methods.

**Response (200 OK):**
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

### POST /shipping/calculate
Calculate shipping cost.

**Request Body:**
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

**Response (200 OK):**
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

## Tax

### POST /tax/calculate
Calculate tax for order.

**Request Body:**
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

**Response (200 OK):**
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

### GET /tax/rates
Get tax rates.

**Query Parameters:**
- `state` (string): State code
- `country` (string): Country code

**Response (200 OK):**
```json
{
  "rates": [
    {
      "state": "NY",
      "country": "US",
      "rate": 0.08,
      "type": "SALES_TAX"
    }
  ]
}
```

---

## Notifications

### GET /notifications
Get user notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `unread` (boolean): Filter unread only

**Response (200 OK):**
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

### PUT /notifications/:id/read
Mark notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

### PUT /notifications/read-all
Mark all notifications as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read"
}
```

---

### DELETE /notifications/:id
Delete notification (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

### GET /notifications/unread-count
Get unread notification count (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "unreadCount": 5
}
```

---

### PUT /notifications/preferences
Update notification preferences (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": true,
  "push": true,
  "sms": false,
  "types": {
    "ORDER_SHIPPED": true,
    "PROMOTION": false
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Preferences updated",
  "preferences": {
    "email": true,
    "push": true,
    "sms": false
  }
}
```

---

## Search

### GET /search
Search products.

**Query Parameters:**
- `q` (string): Search query (required)
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price

**Example:**
```
GET /search?q=laptop&page=1&limit=20&minPrice=500&maxPrice=2000
```

**Response (200 OK):**
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

### GET /search/autocomplete
Get search autocomplete suggestions.

**Query Parameters:**
- `q` (string): Search query (required)

**Response (200 OK):**
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

## Admin

### GET /admin/dashboard
Get admin dashboard statistics.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
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

### User Management (Admin)

#### GET /admin/users
Get all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `search` (string): Search by email/name

**Response (200 OK):**
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
Create user (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "name": "New User",
  "role": "CUSTOMER"
}
```

**Response (201 Created):**
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
Update user (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "ADMIN"
}
```

**Response (200 OK):**
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
Verify user email (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
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
Activate/deactivate user (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200 OK):**
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

### Order Management (Admin)

#### GET /admin/orders
Get all orders (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `userId` (string): Filter by user

**Response (200 OK):**
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

#### PUT /admin/orders/:id/status
Update order status (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123",
  "carrier": "UPS"
}
```

**Response (200 OK):**
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

#### POST /admin/orders/:id/refund
Process refund (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "amount": 219.97,
  "reason": "Customer request"
}
```

**Response (200 OK):**
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

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Resource already exists"
}
```

### 422 Unprocessable Entity
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

### 429 Too Many Requests
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API rate limits are applied per user/IP:
- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per minute
- **Payment endpoints**: 10 requests per minute
- **Admin endpoints**: 200 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination with the following query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

Pagination metadata is included in responses:
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

## API Versioning

The API uses URL versioning:
- Current version: `/api/v1`
- Future versions: `/api/v2`, `/api/v3`, etc.

Deprecated endpoints include a `Deprecation` header:
```
Deprecation: true
Sunset: Sat, 31 Dec 2024 23:59:59 GMT
Link: <https://api.yourdomain.com/api/v2/endpoint>; rel="successor-version"
```

---

## Webhooks

Payment gateway webhooks are available at:
- `POST /webhooks/payments/stripe`
- `POST /webhooks/payments/razorpay`
- `POST /webhooks/payments/paypal`
- `POST /webhooks/payments/payu`

Webhook payloads vary by gateway. See gateway-specific documentation.

---

## Additional Resources

- **Swagger Documentation**: `https://api.yourdomain.com/api-docs`
- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)

---

## Analytics

### GET /analytics/dashboard
Get analytics dashboard data (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `period` (string): Period (day, week, month, year)

**Response (200 OK):**
```json
{
  "revenue": {
    "total": 50000,
    "growth": 15.5,
    "byPeriod": []
  },
  "orders": {
    "total": 1000,
    "growth": 10.2,
    "averageOrderValue": 50
  },
  "customers": {
    "total": 500,
    "new": 50,
    "growth": 12.5
  },
  "topProducts": [],
  "salesByCategory": []
}
```

---

### GET /analytics/revenue
Get revenue analytics (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "revenue": {
    "total": 50000,
    "byPeriod": [
      {
        "period": "2024-01",
        "revenue": 30000,
        "orders": 600
      }
    ],
    "trend": "up"
  }
}
```

---

## Support

### GET /support/tickets
Get user support tickets.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "tickets": [
    {
      "id": "ticket-123",
      "subject": "Order issue",
      "status": "OPEN",
      "priority": "HIGH",
      "createdAt": "2024-01-01T00:00:00Z",
      "messages": []
    }
  ]
}
```

---

### POST /support/tickets
Create support ticket.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "subject": "Order issue",
  "message": "I haven't received my order",
  "priority": "HIGH",
  "orderId": "order-123"
}
```

**Response (201 Created):**
```json
{
  "ticket": {
    "id": "ticket-123",
    "subject": "Order issue",
    "status": "OPEN",
    "priority": "HIGH"
  }
}
```

---

### GET /support/tickets/:id
Get ticket details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "ticket": {
    "id": "ticket-123",
    "subject": "Order issue",
    "status": "OPEN",
    "messages": [
      {
        "id": "msg-123",
        "sender": "user",
        "message": "I haven't received my order",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST /support/tickets/:id/messages
Add message to ticket.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Any update on my order?"
}
```

**Response (201 Created):**
```json
{
  "message": {
    "id": "msg-124",
    "message": "Any update on my order?",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Loyalty & Rewards

### GET /loyalty/points
Get user loyalty points.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "points": {
    "balance": 500,
    "tier": "GOLD",
    "tierName": "Gold Member",
    "nextTier": "PLATINUM",
    "pointsToNextTier": 500
  }
}
```

---

### GET /loyalty/transactions
Get loyalty point transactions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "transactions": [
    {
      "id": "txn-123",
      "type": "EARNED",
      "points": 100,
      "description": "Order #123",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /loyalty/redeem
Redeem loyalty points.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "points": 100,
  "rewardId": "reward-123"
}
```

**Response (200 OK):**
```json
{
  "message": "Points redeemed successfully",
  "redemption": {
    "id": "redeem-123",
    "points": 100,
    "reward": {}
  }
}
```

---

## Marketing

### GET /marketing/flash-sales
Get active flash sales.

**Response (200 OK):**
```json
{
  "flashSales": [
    {
      "id": "sale-123",
      "name": "Summer Sale",
      "discount": 30,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-07T23:59:59Z",
      "products": []
    }
  ]
}
```

---

### GET /marketing/recommendations
Get product recommendations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "recommendations": [
    {
      "productId": "prod-123",
      "product": {},
      "reason": "Based on your purchase history"
    }
  ]
}
```

---

## Currency & Internationalization

### GET /currencies
Get available currencies.

**Response (200 OK):**
```json
{
  "currencies": [
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "rate": 1.0,
      "isDefault": true
    }
  ]
}
```

---

### POST /currencies/convert
Convert currency amount.

**Request Body:**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR"
}
```

**Response (200 OK):**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR",
  "convertedAmount": 85.50,
  "rate": 0.855
}
```

---

### GET /languages
Get available languages.

**Response (200 OK):**
```json
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "isDefault": true
    }
  ]
}
```

---

### PUT /users/preferences/language
Set user language preference.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "languageCode": "es"
}
```

**Response (200 OK):**
```json
{
  "message": "Language preference updated",
  "preference": {
    "languageCode": "es"
  }
}
```

---

## Security

### POST /security/2fa/enable
Enable two-factor authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..."
}
```

---

### POST /security/2fa/verify
Verify 2FA setup.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "2FA enabled successfully"
}
```

---

### GET /security/devices
Get trusted devices.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "devices": [
    {
      "id": "device-123",
      "name": "Chrome on Windows",
      "lastUsed": "2024-01-01T00:00:00Z",
      "isTrusted": true
    }
  ]
}
```

---

### DELETE /security/devices/:id
Remove trusted device.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Device removed"
}
```

---

### GET /security/sessions
Get active sessions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "sessions": [
    {
      "id": "session-123",
      "device": "Chrome on Windows",
      "ipAddress": "192.168.1.1",
      "lastActivity": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /security/sessions/logout-all
Logout from all sessions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out from all sessions"
}
```

---

## Mobile Backend

### POST /mobile/push/register
Register device for push notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deviceToken": "fcm_token_here",
  "platform": "ios",
  "deviceId": "device_unique_id"
}
```

**Response (200 OK):**
```json
{
  "message": "Device registered for push notifications"
}
```

---

### GET /mobile/app/version
Get app version information.

**Response (200 OK):**
```json
{
  "version": "1.0.0",
  "minVersion": "1.0.0",
  "updateRequired": false,
  "updateUrl": "https://apps.apple.com/app"
}
```

---

## Social Commerce

### POST /auth/social/login
Social login (Facebook, Google, Apple).

**Request Body:**
```json
{
  "provider": "google",
  "token": "social_provider_token"
}
```

**Response (200 OK):**
```json
{
  "user": {},
  "token": "jwt_token_here"
}
```

---

### POST /products/:id/share
Share product on social media.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "platform": "facebook",
  "message": "Check out this product!"
}
```

**Response (200 OK):**
```json
{
  "message": "Product shared successfully",
  "shareUrl": "https://example.com/share/abc123"
}
```

---

## Subscriptions

### GET /subscriptions
Get user subscriptions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "subscriptions": [
    {
      "id": "sub-123",
      "productId": "prod-123",
      "status": "ACTIVE",
      "nextBillingDate": "2024-02-01T00:00:00Z",
      "frequency": "MONTHLY"
    }
  ]
}
```

---

### POST /subscriptions
Create subscription.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "planId": "plan-123",
  "paymentMethodId": "pm_123"
}
```

**Response (201 Created):**
```json
{
  "subscription": {
    "id": "sub-123",
    "status": "ACTIVE",
    "nextBillingDate": "2024-02-01T00:00:00Z"
  }
}
```

---

### PUT /subscriptions/:id/pause
Pause subscription.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Subscription paused",
  "subscription": {
    "id": "sub-123",
    "status": "PAUSED"
  }
}
```

---

### PUT /subscriptions/:id/cancel
Cancel subscription.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

**Response (200 OK):**
```json
{
  "message": "Subscription cancelled",
  "subscription": {
    "id": "sub-123",
    "status": "CANCELLED"
  }
}
```

---

## Gift Features

### POST /gifts/registry
Create gift registry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "WEDDING",
  "eventDate": "2024-06-01T00:00:00Z",
  "name": "John & Jane Wedding Registry"
}
```

**Response (201 Created):**
```json
{
  "registry": {
    "id": "registry-123",
    "type": "WEDDING",
    "name": "John & Jane Wedding Registry",
    "shareUrl": "https://example.com/registry/abc123"
  }
}
```

---

### POST /orders/:id/gift
Add gift options to order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isGift": true,
  "giftMessage": "Happy Birthday!",
  "giftWrap": true
}
```

**Response (200 OK):**
```json
{
  "message": "Gift options added",
  "order": {
    "id": "order-123",
    "giftMessage": "Happy Birthday!",
    "giftWrap": true
  }
}
```

---

## Wallet & Financial

### GET /wallet
Get wallet balance.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "wallet": {
    "balance": 100.00,
    "currency": "USD",
    "transactions": []
  }
}
```

---

### POST /wallet/deposit
Deposit to wallet.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 50.00,
  "paymentMethodId": "pm_123"
}
```

**Response (200 OK):**
```json
{
  "message": "Deposit successful",
  "transaction": {
    "id": "txn-123",
    "amount": 50.00,
    "type": "DEPOSIT",
    "balance": 150.00
  }
}
```

---

### GET /store-credit
Get store credit balance.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "storeCredit": {
    "balance": 25.00,
    "currency": "USD",
    "expiryDate": "2024-12-31T23:59:59Z"
  }
}
```

---

## Vendor/Marketplace

### GET /vendors
Get all vendors (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "vendors": [
    {
      "id": "vendor-123",
      "name": "Vendor Name",
      "email": "vendor@example.com",
      "status": "ACTIVE",
      "commissionRate": 10.0
    }
  ]
}
```

---

### POST /vendors/register
Register as vendor.

**Request Body:**
```json
{
  "name": "Vendor Name",
  "email": "vendor@example.com",
  "businessName": "Business Name",
  "taxId": "TAX123"
}
```

**Response (201 Created):**
```json
{
  "vendor": {
    "id": "vendor-123",
    "name": "Vendor Name",
    "status": "PENDING"
  }
}
```

---

### GET /vendors/:id/products
Get vendor products.

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": "prod-123",
      "name": "Product Name",
      "vendorId": "vendor-123"
    }
  ]
}
```

---

## Content Management

### GET /cms/pages
Get CMS pages.

**Response (200 OK):**
```json
{
  "pages": [
    {
      "id": "page-123",
      "slug": "about-us",
      "title": "About Us",
      "content": "Page content here"
    }
  ]
}
```

---

### GET /cms/pages/:slug
Get CMS page by slug.

**Response (200 OK):**
```json
{
  "page": {
    "id": "page-123",
    "slug": "about-us",
    "title": "About Us",
    "content": "Page content here"
  }
}
```

---

### GET /blog/posts
Get blog posts.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post-123",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "excerpt": "Post excerpt",
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {}
}
```

---

## Operational Features

### POST /bulk/operations
Perform bulk operation (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "operation": "UPDATE_STATUS",
  "resource": "products",
  "filters": {
    "categoryId": "cat-123"
  },
  "data": {
    "status": "ACTIVE"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Bulk operation completed",
  "affected": 50
}
```

---

### GET /jobs
Get background jobs (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "job-123",
      "type": "EMAIL_SEND",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

---

## Webhooks

### POST /webhooks/payments/stripe
Stripe payment webhook endpoint.

**Note**: This endpoint is called by Stripe, not by your application. Configure it in your Stripe dashboard.

**Headers:**
```
Stripe-Signature: <stripe_signature>
```

**Response (200 OK):**
```json
{
  "received": true
}
```

---

### POST /webhooks/payments/razorpay
Razorpay payment webhook endpoint.

**Note**: This endpoint is called by Razorpay, not by your application. Configure it in your Razorpay dashboard.

**Headers:**
```
X-Razorpay-Signature: <razorpay_signature>
```

**Response (200 OK):**
```json
{
  "received": true
}
```

---

## Additional Missing Endpoints

### Search Advanced Features

#### GET /search/advanced
Advanced search with multiple filters.

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Category ID
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `rating` (number): Minimum rating
- `inStock` (boolean): In stock only
- `sort` (string): Sort field
- `order` (string): Sort order

**Response (200 OK):**
```json
{
  "results": [],
  "pagination": {},
  "filters": {}
}
```

---

#### GET /search/recommendations
Get product recommendations (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "recommendations": [
    {
      "productId": "prod-123",
      "product": {},
      "reason": "Based on your purchase history"
    }
  ]
}
```

---

#### GET /search/recently-viewed
Get recently viewed products (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": "prod-123",
      "name": "Product Name",
      "viewedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /search/saved
Save search query (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "query": "laptop",
  "filters": {
    "minPrice": 500,
    "maxPrice": 2000
  }
}
```

**Response (201 Created):**
```json
{
  "savedSearch": {
    "id": "search-123",
    "query": "laptop",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /search/saved
Get saved searches (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "savedSearches": [
    {
      "id": "search-123",
      "query": "laptop",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### DELETE /search/saved/:id
Delete saved search (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Saved search deleted"
}
```

---

### Analytics Additional Endpoints

#### GET /analytics/clv/:userId
Calculate Customer Lifetime Value (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "clv": {
    "userId": "user-123",
    "totalValue": 5000,
    "averageOrderValue": 100,
    "orderFrequency": 2.5,
    "predictedClv": 6000
  }
}
```

---

#### GET /analytics/cohort
Get cohort analysis (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "cohorts": [
    {
      "period": "2024-01",
      "users": 100,
      "retention": {
        "month1": 80,
        "month2": 70,
        "month3": 60
      }
    }
  ]
}
```

---

#### GET /analytics/funnel
Get funnel analysis (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "funnel": {
    "visitors": 10000,
    "cartAdds": 5000,
    "checkouts": 3000,
    "purchases": 2000,
    "conversionRate": 0.20
  }
}
```

---

#### GET /analytics/segments
Get customer segments (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "segments": [
    {
      "id": "segment-123",
      "name": "High Value Customers",
      "criteria": {},
      "customerCount": 500
    }
  ]
}
```

---

### Support Additional Endpoints

#### GET /support/faqs
Get frequently asked questions.

**Response (200 OK):**
```json
{
  "faqs": [
    {
      "id": "faq-123",
      "question": "How do I return an item?",
      "answer": "You can return items within 30 days...",
      "category": "RETURNS"
    }
  ]
}
```

---

#### PUT /support/tickets/:id/close
Close support ticket (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Ticket closed",
  "ticket": {
    "id": "ticket-123",
    "status": "CLOSED"
  }
}
```

---

### Loyalty Additional Endpoints

#### GET /loyalty/tiers
Get loyalty tiers (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "tiers": [
    {
      "id": "tier-123",
      "name": "Gold",
      "minPoints": 1000,
      "benefits": []
    }
  ]
}
```

---

#### GET /loyalty/rewards
Get available rewards (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "rewards": [
    {
      "id": "reward-123",
      "name": "$10 Discount",
      "pointsRequired": 500,
      "description": "Get $10 off your next purchase"
    }
  ]
}
```

---

#### GET /loyalty/referral
Get referral code (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "referralCode": "REF123",
  "referralLink": "https://example.com/ref/REF123",
  "totalReferrals": 5,
  "earnedPoints": 500
}
```

---

#### POST /loyalty/referral/apply
Apply referral code (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "REF123"
}
```

**Response (200 OK):**
```json
{
  "message": "Referral code applied",
  "pointsEarned": 100
}
```

---

### Marketing Additional Endpoints

#### GET /marketing/deals
Get active deals.

**Response (200 OK):**
```json
{
  "deals": [
    {
      "id": "deal-123",
      "name": "Summer Sale",
      "discount": 30,
      "products": [],
      "validUntil": "2024-12-31T23:59:59Z"
    }
  ]
}
```

---

#### GET /marketing/bundles
Get product bundles.

**Response (200 OK):**
```json
{
  "bundles": [
    {
      "id": "bundle-123",
      "name": "Laptop Bundle",
      "products": [],
      "discount": 15,
      "price": 999.99
    }
  ]
}
```

---

#### GET /marketing/abandoned-carts
Get abandoned carts (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "abandonedCarts": [
    {
      "userId": "user-123",
      "cartValue": 199.98,
      "abandonedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Currency Additional Endpoints

#### GET /currencies/:code
Get currency by code.

**Response (200 OK):**
```json
{
  "currency": {
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "rate": 1.0,
    "isDefault": true
  }
}
```

---

#### GET /currencies/convert
Convert currency amount.

**Query Parameters:**
- `amount` (number): Amount to convert
- `from` (string): From currency code
- `to` (string): To currency code

**Response (200 OK):**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR",
  "convertedAmount": 85.50,
  "rate": 0.855
}
```

---

#### PUT /currencies/rates
Update exchange rates (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "rates": [
    {
      "code": "EUR",
      "rate": 0.855
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Exchange rates updated"
}
```

---

### Language Additional Endpoints

#### GET /languages/:code
Get language by code.

**Response (200 OK):**
```json
{
  "language": {
    "code": "en",
    "name": "English",
    "isDefault": true
  }
}
```

---

#### GET /languages/translations
Get translations.

**Query Parameters:**
- `languageCode` (string): Language code
- `type` (string): Translation type (product, category, email)

**Response (200 OK):**
```json
{
  "translations": [
    {
      "key": "product.name",
      "value": "Product Name",
      "languageCode": "es"
    }
  ]
}
```

---

#### POST /languages/translations
Create translation (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "key": "product.name",
  "value": "Nombre del Producto",
  "languageCode": "es",
  "type": "product"
}
```

**Response (201 Created):**
```json
{
  "translation": {
    "id": "trans-123",
    "key": "product.name",
    "value": "Nombre del Producto"
  }
}
```

---

### Security Additional Endpoints

#### POST /security/2fa/setup
Setup 2FA (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..."
}
```

---

#### POST /security/2fa/disable
Disable 2FA (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "2FA disabled successfully"
}
```

---

#### DELETE /security/devices/:id
Remove trusted device (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Device removed"
}
```

---

#### DELETE /security/sessions/:id
Revoke specific session (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Session revoked"
}
```

---

#### DELETE /security/sessions
Revoke all sessions (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "All sessions revoked"
}
```

---

#### GET /security/login-attempts
Get login attempts (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "attempts": [
    {
      "id": "attempt-123",
      "ipAddress": "192.168.1.1",
      "success": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET /security/api-keys
Get API keys (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "apiKeys": [
    {
      "id": "key-123",
      "name": "Production API Key",
      "prefix": "sk_live_",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastUsed": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

#### POST /security/api-keys
Create API key (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Production API Key",
  "permissions": ["read", "write"]
}
```

**Response (201 Created):**
```json
{
  "apiKey": {
    "id": "key-123",
    "name": "Production API Key",
    "key": "sk_live_abc123...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE /security/api-keys/:id
Revoke API key (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "API key revoked"
}
```

---

### Mobile Backend Additional Endpoints

#### GET /mobile/version
Check app version.

**Response (200 OK):**
```json
{
  "version": "1.0.0",
  "minVersion": "1.0.0",
  "updateRequired": false,
  "updateUrl": "https://apps.apple.com/app"
}
```

---

#### POST /mobile/device/register
Register device for push notifications (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deviceToken": "fcm_token_here",
  "platform": "ios",
  "deviceId": "device_unique_id"
}
```

**Response (200 OK):**
```json
{
  "message": "Device registered for push notifications"
}
```

---

#### POST /mobile/deep-link
Create deep link (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "product",
  "targetId": "prod-123"
}
```

**Response (200 OK):**
```json
{
  "deepLink": "https://app.example.com/product/prod-123",
  "shortLink": "https://example.com/link/abc123"
}
```

---

#### POST /mobile/payment
Process mobile payment (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order-123",
  "paymentMethod": "apple_pay",
  "token": "payment_token"
}
```

**Response (200 OK):**
```json
{
  "payment": {
    "id": "pay-123",
    "status": "SUCCEEDED"
  }
}
```

---

#### POST /mobile/push
Send push notification (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "userId": "user-123",
  "title": "Order Shipped",
  "message": "Your order has been shipped",
  "data": {}
}
```

**Response (200 OK):**
```json
{
  "message": "Push notification sent"
}
```

---

### Social Commerce Additional Endpoints

#### GET /social/ugc
Get user-generated content.

**Response (200 OK):**
```json
{
  "ugc": [
    {
      "id": "ugc-123",
      "type": "REVIEW",
      "content": "Great product!",
      "userId": "user-123",
      "productId": "prod-123"
    }
  ]
}
```

---

#### POST /social/login
Social login (Google, Facebook, Apple).

**Request Body:**
```json
{
  "provider": "google",
  "token": "social_provider_token"
}
```

**Response (200 OK):**
```json
{
  "user": {},
  "token": "jwt_token_here"
}
```

---

#### POST /social/products/:productId/share
Share product on social media (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "platform": "facebook",
  "message": "Check out this product!"
}
```

**Response (200 OK):**
```json
{
  "message": "Product shared successfully",
  "shareUrl": "https://example.com/share/abc123"
}
```

---

#### POST /social/ugc
Submit user-generated content (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "REVIEW",
  "content": "Great product!",
  "productId": "prod-123",
  "images": []
}
```

**Response (201 Created):**
```json
{
  "ugc": {
    "id": "ugc-123",
    "type": "REVIEW",
    "content": "Great product!"
  }
}
```

---

#### GET /social/influencers
Get influencer tracking (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "influencers": [
    {
      "id": "inf-123",
      "name": "Influencer Name",
      "referrals": 100,
      "revenue": 5000
    }
  ]
}
```

---

### Subscriptions Additional Endpoints

#### POST /subscriptions/:subscriptionId/pause
Pause subscription (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Subscription paused",
  "subscription": {
    "id": "sub-123",
    "status": "PAUSED"
  }
}
```

---

#### POST /subscriptions/:subscriptionId/resume
Resume subscription (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Subscription resumed",
  "subscription": {
    "id": "sub-123",
    "status": "ACTIVE"
  }
}
```

---

#### POST /subscriptions/:subscriptionId/skip
Skip next delivery (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Next delivery skipped",
  "subscription": {
    "id": "sub-123",
    "nextBillingDate": "2024-03-01T00:00:00Z"
  }
}
```

---

#### PUT /subscriptions/:subscriptionId/frequency
Change subscription frequency (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "frequency": "WEEKLY"
}
```

**Response (200 OK):**
```json
{
  "message": "Frequency updated",
  "subscription": {
    "id": "sub-123",
    "frequency": "WEEKLY"
  }
}
```

---

### Wallet Additional Endpoints

#### POST /wallet/add
Add funds to wallet (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 50.00,
  "paymentMethodId": "pm_123"
}
```

**Response (200 OK):**
```json
{
  "message": "Funds added successfully",
  "transaction": {
    "id": "txn-123",
    "amount": 50.00,
    "balance": 150.00
  }
}
```

---

#### GET /wallet/store-credits
Get store credits (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "storeCredits": [
    {
      "id": "credit-123",
      "amount": 25.00,
      "expiryDate": "2024-12-31T23:59:59Z",
      "balance": 25.00
    }
  ]
}
```

---

#### GET /wallet/invoices
Get invoices (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "invoices": [
    {
      "id": "inv-123",
      "orderId": "order-123",
      "amount": 219.97,
      "status": "PAID",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET /wallet/invoices/:id
Get invoice details (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "invoice": {
    "id": "inv-123",
    "orderId": "order-123",
    "amount": 219.97,
    "items": [],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /wallet/invoices/:id/download
Download invoice PDF (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```
PDF file download
```

---

### Vendor Additional Endpoints

#### POST /vendor/register
Register as vendor (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Vendor Name",
  "email": "vendor@example.com",
  "businessName": "Business Name",
  "taxId": "TAX123"
}
```

**Response (201 Created):**
```json
{
  "vendor": {
    "id": "vendor-123",
    "name": "Vendor Name",
    "status": "PENDING"
  }
}
```

---

#### GET /vendor/dashboard
Get vendor dashboard (Vendor only, requires auth).

**Headers:**
```
Authorization: Bearer <vendor_token>
```

**Response (200 OK):**
```json
{
  "stats": {
    "totalProducts": 50,
    "totalOrders": 200,
    "totalRevenue": 10000,
    "pendingOrders": 10
  }
}
```

---

#### GET /vendor/products
Get vendor products (Vendor only, requires auth).

**Headers:**
```
Authorization: Bearer <vendor_token>
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": "prod-123",
      "name": "Product Name",
      "vendorId": "vendor-123"
    }
  ]
}
```

---

#### POST /vendor/products
Add vendor product (Vendor only, requires auth).

**Headers:**
```
Authorization: Bearer <vendor_token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "price": 99.99,
  "description": "Product description"
}
```

**Response (201 Created):**
```json
{
  "product": {
    "id": "prod-123",
    "name": "New Product",
    "status": "PENDING_APPROVAL"
  }
}
```

---

#### GET /vendor/payouts
Get vendor payouts (Vendor only, requires auth).

**Headers:**
```
Authorization: Bearer <vendor_token>
```

**Response (200 OK):**
```json
{
  "payouts": [
    {
      "id": "payout-123",
      "amount": 1000,
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### CMS Additional Endpoints

#### GET /cms/pages/:slug
Get CMS page by slug.

**Response (200 OK):**
```json
{
  "page": {
    "id": "page-123",
    "slug": "about-us",
    "title": "About Us",
    "content": "Page content here"
  }
}
```

---

#### GET /cms/blog
Get blog posts.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post-123",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "excerpt": "Post excerpt",
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {}
}
```

---

#### GET /cms/blog/:slug
Get blog post by slug.

**Response (200 OK):**
```json
{
  "post": {
    "id": "post-123",
    "title": "Blog Post Title",
    "slug": "blog-post-title",
    "content": "Full post content",
    "publishedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /cms/banners
Get active banners.

**Response (200 OK):**
```json
{
  "banners": [
    {
      "id": "banner-123",
      "title": "Summer Sale",
      "image": "https://example.com/banner.jpg",
      "link": "https://example.com/sale",
      "position": "HOME_TOP"
    }
  ]
}
```

---

### Operational Additional Endpoints

#### POST /operational/bulk/products
Bulk update products (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "productIds": ["prod-123", "prod-456"],
  "updates": {
    "status": "ACTIVE"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Bulk update completed",
  "affected": 2
}
```

---

#### POST /operational/bulk/orders
Bulk update orders (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "orderIds": ["order-123", "order-456"],
  "updates": {
    "status": "SHIPPED"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Bulk update completed",
  "affected": 2
}
```

---

#### POST /operational/import
Create import job (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "type": "PRODUCTS",
  "fileUrl": "https://example.com/products.csv"
}
```

**Response (201 Created):**
```json
{
  "job": {
    "id": "job-123",
    "type": "IMPORT",
    "status": "PENDING"
  }
}
```

---

#### GET /operational/import
Get import jobs (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "job-123",
      "type": "IMPORT",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /operational/export
Create export job (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "type": "ORDERS",
  "format": "CSV",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

**Response (201 Created):**
```json
{
  "job": {
    "id": "job-123",
    "type": "EXPORT",
    "status": "PENDING"
  }
}
```

---

#### GET /operational/export
Get export jobs (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "job-123",
      "type": "EXPORT",
      "status": "COMPLETED",
      "downloadUrl": "https://example.com/export.csv",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET /operational/cron
Get cron jobs (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "cronJobs": [
    {
      "id": "cron-123",
      "name": "Daily Report",
      "schedule": "0 0 * * *",
      "isActive": true,
      "lastRun": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### PUT /operational/cron/:id
Update cron job (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200 OK):**
```json
{
  "message": "Cron job updated",
  "cronJob": {
    "id": "cron-123",
    "isActive": false
  }
}
```

---

#### GET /operational/webhooks
Get webhooks (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "webhooks": [
    {
      "id": "webhook-123",
      "url": "https://example.com/webhook",
      "events": ["order.created", "payment.succeeded"],
      "isActive": true
    }
  ]
}
```

---

#### POST /operational/webhooks
Create webhook (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["order.created", "payment.succeeded"],
  "secret": "webhook_secret"
}
```

**Response (201 Created):**
```json
{
  "webhook": {
    "id": "webhook-123",
    "url": "https://example.com/webhook",
    "events": ["order.created", "payment.succeeded"]
  }
}
```

---

#### GET /operational/webhooks/logs
Get webhook logs (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": "log-123",
      "webhookId": "webhook-123",
      "event": "order.created",
      "status": "SUCCESS",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Feature Flags Additional Endpoints

#### GET /feature-flags/:flagKey/evaluate
Evaluate feature flag (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "enabled": true,
  "value": "variant-a",
  "reason": "user_override"
}
```

---

#### GET /feature-flags/:flagKey
Get feature flag (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "flag": {
    "key": "new_checkout",
    "name": "New Checkout",
    "enabled": true,
    "rolloutPercentage": 50
  }
}
```

---

#### POST /feature-flags
Create feature flag (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "key": "new_checkout",
  "name": "New Checkout",
  "enabled": false,
  "rolloutPercentage": 0
}
```

**Response (201 Created):**
```json
{
  "flag": {
    "id": "flag-123",
    "key": "new_checkout",
    "name": "New Checkout"
  }
}
```

---

#### PUT /feature-flags/:flagKey
Update feature flag (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "enabled": true,
  "rolloutPercentage": 50
}
```

**Response (200 OK):**
```json
{
  "flag": {
    "key": "new_checkout",
    "enabled": true,
    "rolloutPercentage": 50
  }
}
```

---

#### GET /feature-flags/:flagKey/stats
Get feature flag usage statistics (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "stats": {
    "totalEvaluations": 1000,
    "enabledCount": 500,
    "disabledCount": 500,
    "byVariant": {
      "variant-a": 300,
      "variant-b": 200
    }
  }
}
```

---

#### POST /feature-flags/:flagKey/rules
Create feature flag rule (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "condition": {
    "field": "userId",
    "operator": "IN",
    "value": ["user-123", "user-456"]
  },
  "action": "ENABLE"
}
```

**Response (201 Created):**
```json
{
  "rule": {
    "id": "rule-123",
    "condition": {},
    "action": "ENABLE"
  }
}
```

---

#### POST /feature-flags/:flagKey/overrides
Create feature flag override (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "userId": "user-123",
  "enabled": true,
  "value": "variant-a"
}
```

**Response (201 Created):**
```json
{
  "override": {
    "id": "override-123",
    "userId": "user-123",
    "enabled": true
  }
}
```

---

### Gift Features Additional Endpoints

#### GET /gifts/registry
Get gift registries (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "registries": [
    {
      "id": "registry-123",
      "type": "WEDDING",
      "name": "John & Jane Wedding Registry",
      "eventDate": "2024-06-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /gifts/registry/items
Add item to gift registry (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "registryId": "registry-123",
  "productId": "prod-123",
  "quantity": 2,
  "priority": "HIGH"
}
```

**Response (201 Created):**
```json
{
  "item": {
    "id": "item-123",
    "registryId": "registry-123",
    "productId": "prod-123",
    "quantity": 2
  }
}
```

---

#### POST /gifts/send
Send order as gift (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order-123",
  "recipientName": "Jane Doe",
  "recipientEmail": "jane@example.com",
  "giftMessage": "Happy Birthday!"
}
```

**Response (200 OK):**
```json
{
  "message": "Gift sent successfully",
  "gift": {
    "id": "gift-123",
    "orderId": "order-123"
  }
}
```

---

#### POST /gifts/schedule
Schedule gift delivery (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order-123",
  "deliveryDate": "2024-12-25T00:00:00Z",
  "recipientName": "Jane Doe",
  "giftMessage": "Merry Christmas!"
}
```

**Response (200 OK):**
```json
{
  "message": "Gift scheduled",
  "gift": {
    "id": "gift-123",
    "deliveryDate": "2024-12-25T00:00:00Z"
  }
}
```

---

#### GET /gifts/track/:trackingNumber
Track gift by tracking number (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "gift": {
    "id": "gift-123",
    "trackingNumber": "TRACK123",
    "status": "SHIPPED",
    "deliveryDate": "2024-12-25T00:00:00Z"
  }
}
```

---

### CRM Additional Endpoints

#### GET /crm/customers/:userId/360
Get 360° customer view (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "customer": {
    "id": "user-123",
    "profile": {},
    "orders": [],
    "loyalty": {},
    "supportTickets": [],
    "totalSpent": 5000
  }
}
```

---

#### GET /crm/customers/:userId/rfm
Get RFM analysis (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "rfm": {
    "recency": 5,
    "frequency": 4,
    "monetary": 5,
    "segment": "CHAMPION"
  }
}
```

---

#### POST /crm/customers/:userId/tags
Add customer tag (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "tags": ["VIP", "High Value"]
}
```

**Response (200 OK):**
```json
{
  "message": "Tags added",
  "tags": ["VIP", "High Value"]
}
```

---

#### POST /crm/customers/:userId/notes
Add customer note (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "note": "Customer prefers email communication",
  "type": "GENERAL"
}
```

**Response (201 Created):**
```json
{
  "note": {
    "id": "note-123",
    "content": "Customer prefers email communication",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /crm/segments
Get customer segments (Admin only, requires auth).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "segments": [
    {
      "id": "segment-123",
      "name": "High Value Customers",
      "criteria": {},
      "customerCount": 500
    }
  ]
}
```

---

### Advanced Products Additional Endpoints

#### GET /advanced-products/digital/:productId
Get digital product details.

**Response (200 OK):**
```json
{
  "product": {
    "id": "prod-123",
    "name": "Digital Product",
    "type": "DIGITAL",
    "downloadUrl": "https://example.com/download",
    "fileSize": 1024000
  }
}
```

---

#### GET /advanced-products/digital/:productId/download/:orderId
Download digital product (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```
File download
```

---

#### GET /advanced-products/subscriptions
Get subscriptions (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "subscriptions": [
    {
      "id": "sub-123",
      "productId": "prod-123",
      "status": "ACTIVE",
      "nextBillingDate": "2024-02-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /advanced-products/subscriptions
Create subscription (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "planId": "plan-123",
  "paymentMethodId": "pm_123"
}
```

**Response (201 Created):**
```json
{
  "subscription": {
    "id": "sub-123",
    "status": "ACTIVE"
  }
}
```

---

#### POST /advanced-products/pre-orders
Create pre-order (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "quantity": 1,
  "expectedDeliveryDate": "2024-06-01T00:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "preOrder": {
    "id": "preorder-123",
    "productId": "prod-123",
    "status": "PENDING"
  }
}
```

---

#### GET /advanced-products/pre-orders
Get pre-orders (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "preOrders": [
    {
      "id": "preorder-123",
      "productId": "prod-123",
      "status": "PENDING",
      "expectedDeliveryDate": "2024-06-01T00:00:00Z"
    }
  ]
}
```

---

#### GET /advanced-products/gift-cards
Get gift cards (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "giftCards": [
    {
      "id": "card-123",
      "code": "GIFT123",
      "balance": 50.00,
      "expiryDate": "2024-12-31T23:59:59Z"
    }
  ]
}
```

---

#### POST /advanced-products/gift-cards/purchase
Purchase gift card (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 50.00,
  "recipientEmail": "recipient@example.com",
  "message": "Happy Birthday!"
}
```

**Response (201 Created):**
```json
{
  "giftCard": {
    "id": "card-123",
    "code": "GIFT123",
    "amount": 50.00
  }
}
```

---

#### POST /advanced-products/gift-cards/redeem
Redeem gift card (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "GIFT123"
}
```

**Response (200 OK):**
```json
{
  "message": "Gift card redeemed",
  "balance": 50.00
}
```

---

### Order Enhancements Additional Endpoints

#### POST /order-enhancements/notes
Add order note (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order-123",
  "note": "Please deliver in the morning",
  "type": "CUSTOMER"
}
```

**Response (201 Created):**
```json
{
  "note": {
    "id": "note-123",
    "orderId": "order-123",
    "note": "Please deliver in the morning",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /order-enhancements/:orderId/notes
Get order notes (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "notes": [
    {
      "id": "note-123",
      "orderId": "order-123",
      "note": "Please deliver in the morning",
      "type": "CUSTOMER",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /order-enhancements/schedule-delivery
Schedule delivery (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order-123",
  "deliveryDate": "2024-01-15T10:00:00Z",
  "timeSlot": "MORNING"
}
```

**Response (200 OK):**
```json
{
  "message": "Delivery scheduled",
  "delivery": {
    "orderId": "order-123",
    "deliveryDate": "2024-01-15T10:00:00Z"
  }
}
```

---

#### GET /order-enhancements/:orderId/splits
Get order splits (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "splits": [
    {
      "id": "split-123",
      "orderId": "order-123",
      "items": [],
      "shipment": {}
    }
  ]
}
```

---

### Customer Experience Additional Endpoints

#### GET /experience/products/:productId/questions
Get product questions.

**Response (200 OK):**
```json
{
  "questions": [
    {
      "id": "q-123",
      "question": "What is the warranty period?",
      "answer": "1 year warranty",
      "askedBy": "user-123",
      "answeredAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET /experience/products/:productId/size-guide
Get size guide.

**Response (200 OK):**
```json
{
  "sizeGuide": {
    "productId": "prod-123",
    "sizes": [
      {
        "size": "S",
        "measurements": {
          "chest": "36",
          "waist": "30"
        }
      }
    ]
  }
}
```

---

#### GET /experience/products/:productId/videos
Get product videos.

**Response (200 OK):**
```json
{
  "videos": [
    {
      "id": "video-123",
      "url": "https://example.com/video.mp4",
      "type": "PRODUCT_DEMO",
      "thumbnail": "https://example.com/thumb.jpg"
    }
  ]
}
```

---

#### GET /experience/products/:productId/social-proof
Get social proof.

**Response (200 OK):**
```json
{
  "socialProof": {
    "recentPurchases": [
      {
        "userId": "user-123",
        "purchasedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "viewCount": 1000,
    "wishlistCount": 50
  }
}
```

---

#### POST /experience/products/questions
Ask product question (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "question": "What is the warranty period?"
}
```

**Response (201 Created):**
```json
{
  "question": {
    "id": "q-123",
    "productId": "prod-123",
    "question": "What is the warranty period?",
    "status": "PENDING"
  }
}
```

---

#### GET /experience/recently-viewed
Get recently viewed products (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": "prod-123",
      "name": "Product Name",
      "viewedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /experience/waitlist
Add to waitlist (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "variantId": "var-123"
}
```

**Response (201 Created):**
```json
{
  "message": "Added to waitlist",
  "waitlist": {
    "id": "waitlist-123",
    "productId": "prod-123",
    "position": 10
  }
}
```

---

#### GET /experience/waitlist
Get waitlist items (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "waitlist": [
    {
      "id": "waitlist-123",
      "productId": "prod-123",
      "position": 10,
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /experience/product-alerts
Create product alert (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "type": "BACK_IN_STOCK",
  "variantId": "var-123"
}
```

**Response (201 Created):**
```json
{
  "alert": {
    "id": "alert-123",
    "productId": "prod-123",
    "type": "BACK_IN_STOCK"
  }
}
```

---

#### GET /experience/product-alerts
Get product alerts (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "productId": "prod-123",
      "type": "BACK_IN_STOCK",
      "status": "ACTIVE"
    }
  ]
}
```

---

*Last Updated: 2024-01-01*
*API Version: 1.0.0*
*Total Endpoints: 300+*

