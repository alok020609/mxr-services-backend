# Complete API Reference

This document provides a comprehensive reference for **ALL** API endpoints in the e-commerce backend, including complete request/response schemas, error responses, and permissions.

**Base URL**: `http://localhost:3000/api/v1` (or your production URL)

**Authentication**: Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

**How to get a token**: Use the `POST /api/v1/auth/login` endpoint to authenticate and receive a JWT token. Then use the "Authorize" button in Swagger UI or include the token in your API requests.

---

## Table of Contents

0. [Health Check](#0-health-check)
1. [Authentication & User Management](#1-authentication--user-management)
2. [Product Management](#product-management)
2.1. [Package Management](#21-package-management)
3. [Shopping Cart](#shopping-cart)
3.1. [Services](#31-services)
4. [Orders](#orders)
5. [Payments](#payments)
6. [Inventory](#inventory)
7. [Reviews & Ratings](#reviews-ratings)
8. [Wishlist](#wishlist)
9. [Coupons & Discounts](#coupons-discounts)
10. [Shipping](#shipping)
11. [Tax](#tax)
12. [Notifications](#notifications)
13. [Search](#search)
14. [Analytics](#analytics)
15. [Support](#support)
16. [Loyalty & Rewards](#loyalty-rewards)
17. [Marketing](#marketing)
18. [Wallet & Financial](#wallet-financial)
19. [Vendor/Marketplace](#vendor-marketplace)
20. [Gift Features](#gift-features)
21. [Currency Management](#currency-management)
21.1. [Admin Currency Settings](#211-admin-currency-settings)
22. [Language & Translation](#language-translation)
23. [Admin](#admin)
24. [Admin Payment Gateway Management](#admin-payment-gateway-management)
25. [Admin Email Service Management](#admin-email-service-management)
25.1. [Admin Mail Settings](#251-admin-mail-settings)
25.2. [Admin Invoices – Send by Email](#252-admin-invoices--send-by-email)
25.3. [Admin Services](#253-admin-services)
26. [Admin SMS Service Management](#admin-sms-service-management)
27. [Admin Logistics Provider Management](#admin-logistics-provider-management)
28. [Logistics Operations](#logistics-operations)
29. [Webhooks](#webhooks)
30. [Advanced Products](#advanced-products)
31. [Customer Experience](#customer-experience)
32. [Order Enhancements](#order-enhancements)
33. [CMS](#cms)
34. [Order State](#order-state)
35. [Operational](#operational)
36. [Media & Image Upload](#media--image-upload)
37. [Product Image Management](#product-image-management)
38. [Batch Requests](#batch-requests)
39. [Security](#security)
40. [Job Queue](#job-queue)
41. [Feature Flags](#feature-flags)
42. [CRM](#crm)
43. [Subscriptions](#subscriptions)
44. [Product Management Advanced](#product-management-advanced)
45. [Monitoring](#monitoring)
46. [Search Index](#search-index)
47. [Advanced Inventory](#advanced-inventory)
48. [Customer Service Enhanced](#customer-service-enhanced)
49. [Social Commerce](#social-commerce)
50. [Advanced Admin](#advanced-admin)
51. [Advanced Analytics](#advanced-analytics)
52. [Mobile Backend](#mobile-backend)
53. [Internationalization](#internationalization)
54. [Advanced Payments](#advanced-payments)
55. [Shipping Carriers](#shipping-carriers)
56. [Advanced Shipping](#advanced-shipping)
57. [Integrations](#integrations)
58. [Compliance](#compliance)
59. [API Gateway](#api-gateway)
60. [API Deprecation](#api-deprecation)
61. [Observability](#observability)
62. [Multi-Tenant](#multi-tenant)
63. [Migrations](#migrations)
64. [Disaster Recovery](#disaster-recovery)

---

## 0. Health Check

### GET /health

Health check endpoint to verify server status.

**Permissions**: Public

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-28T10:00:00.000Z",
  "uptime": 12345.67
}
```

**No error responses** - This endpoint always returns 200 OK.

---

## 1. Authentication & User Management

### POST /api/v1/auth/register

Register a new user

Register a new user account. Set isAdmin to true to create an admin user (admin token required).

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address. |
| password | string | Yes | Min 6 characters. |
| firstName | string | No | User's first name. |
| lastName | string | No | User's last name. |
| phone | string | No | Phone number. |
| isAdmin | boolean | No | Default false. Set true to create an admin user (admin token required). |

Example:
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isAdmin": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "USER",
    "emailVerified": false
  },
  "message": "Registration successful. Please verify your email."
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/login

Authenticate with email and password; returns user and tokens. Use the returned `token` as `Authorization: Bearer <token>` on protected routes.

**Permissions**: Public

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address. |
| password | string | Yes | User's password. |

Example:
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "USER",
      "emailVerified": true
    },
    "token": "<JWT access token>",
    "refreshToken": "<refresh token>"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - Invalid credentials or account inactive
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### Social Login (Google and Microsoft)

The backend accepts an **id_token** from the frontend (obtained via Google Sign-In or MSAL.js). Send the token in the request body; the backend verifies it with the provider, finds or creates a user, and returns the same shape as email login (`user`, `token`, `refreshToken`).

**Endpoints:**
- `POST /api/v1/auth/google` – body: `{ "idToken": "<Google id_token>" }`
- `POST /api/v1/auth/microsoft` – body: `{ "idToken": "<Microsoft id_token>" }`

**Success response (200):** Same as `POST /api/v1/auth/login`:
```json
{
  "success": true,
  "data": {
    "user": { "id", "email", "firstName", "lastName", "role", "emailVerified" },
    "token": "<JWT access token>",
    "refreshToken": "<refresh token>"
  }
}
```

**Error responses:** 400 (validation, e.g. missing idToken), 401 (invalid token or account inactive), 503 (provider not configured).

---

### POST /api/v1/auth/google

Login with Google. Send the Google id_token (from Google Sign-In, e.g. `google.accounts.id` credential callback) in the request body. Either `idToken` or `id_token` (snake_case) is accepted.

**Permissions**: Public

**Request Body (application/json):**
```json
{
  "idToken": "<Google id_token>"
}
```
(`id_token` is also accepted.)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "USER",
      "emailVerified": true
    },
    "token": "<JWT access token>",
    "refreshToken": "<refresh token>"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error (e.g. missing idToken)
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - Invalid Google token or account inactive
```json
{
  "success": false,
  "error": "Invalid Google token"
}
```

**503 Service Unavailable** - Google sign-in not configured
```json
{
  "success": false,
  "error": "Google sign-in not configured"
}
```

---

### POST /api/v1/auth/microsoft

Login with Microsoft (Azure AD / Entra ID). Send the Microsoft id_token from MSAL.js in the request body. Either `idToken` or `id_token` (snake_case) is accepted.

**Permissions**: Public

**Request Body (application/json):**
```json
{
  "idToken": "<Microsoft id_token>"
}
```
(`id_token` is also accepted.)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "USER",
      "emailVerified": true
    },
    "token": "<JWT access token>",
    "refreshToken": "<refresh token>"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error (e.g. missing idToken)
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - Invalid Microsoft token or account inactive
```json
{
  "success": false,
  "error": "Invalid Microsoft token"
}
```

**503 Service Unavailable** - Microsoft sign-in not configured
```json
{
  "success": false,
  "error": "Microsoft sign-in not configured"
}
```

---

### GET /api/v1/auth/verify-email/:token

Verify the user's email address using the token sent by email. The verification email (sent after register and resend-verification) contains a link to the **frontend** (e.g. `{FRONTEND_URL}/verify-email?token=...`). When the user opens that link, the frontend should call this backend endpoint with the token (e.g. `GET /api/v1/auth/verify-email/{token}`) and show success or error based on the response.

**Permissions**: Public

**Success (200):** e.g. `{ "success": true, "message": "Email verified successfully" }`

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/resend-verification

User already exists

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/forgot-password

Login user

Authenticate user and receive access token. Use the token in the "Authorize" button at the top of this page.

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/reset-password

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/refresh

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/change-password

User already exists

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/auth/profile

Login successful

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/auth/profile

User already exists

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/auth/addresses

Login successful

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/addresses

User already exists

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/auth/addresses/default

Login successful

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/auth/addresses/:id

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/auth/addresses/:id

User already exists

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/auth/addresses/:id

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/auth/addresses/:id/set-default

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 2. Product Management

### Product API Endpoints Summary

| Method | Endpoint | Description | Permissions | Key Parameters/Fields |
|--------|----------|------------|-------------|----------------------|
| GET | `/api/v1/products` | Get list of products with filters | Public | Query: `page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`, `isActive` |
| GET | `/api/v1/products/search` | Search products | Public | Query: `q` (required) |
| GET | `/api/v1/products/categories` | Get all categories | Public | None |
| GET | `/api/v1/products/categories/:id` | Get category by ID | Public | Path: `id` |
| GET | `/api/v1/products/:id` | Get product details | Public | Path: `id` |
| POST | `/api/v1/products` | Create new product | Admin | Body: `name`, `price`, `sku` (required) + all optional fields |
| PUT | `/api/v1/products/:id` | Update product | Admin | Path: `id`, Body: All fields optional |
| DELETE | `/api/v1/products/:id` | Delete product (soft delete) | Admin | Path: `id` |

### Product Field Reference Table

| Field Name | Type | Required | Format/Constraints | Example Value | Description |
|------------|------|----------|-------------------|---------------|-------------|
| `name` | string | ✅ Yes | - | `"Premium Wireless Headphones"` | Product name |
| `price` | number (decimal) | ✅ Yes | Minimum: 0 | `199.99` | Current selling price |
| `sku` | string | ✅ Yes | Must be unique | `"SKU-HEAD-001"` | Stock Keeping Unit |
| `stock` | integer | ❌ No | Minimum: 0, Default: 0 | `100` | Current stock quantity |
| `description` | string | ❌ No | - | `"High-quality headphones"` | Product description |
| `slug` | string | ❌ No | URL-friendly | `"premium-wireless-headphones"` | Auto-generated if not provided |
| `compareAtPrice` | number (decimal) | ❌ No | Minimum: 0 | `249.99` | MSRP or "was" price |
| `originalPrice` | number (decimal) | ❌ No | Minimum: 0 | `219.99` | Original price before discounts |
| `images` | array of strings | ❌ No | Each item must be valid URI | `["https://example.com/img1.jpg"]` | Product image URLs |
| `categoryId` | string | ❌ No | - | `"cat_123"` | Category ID |
| `badges` | array of strings | ❌ No | - | `["New", "Featured"]` | Product badges |
| `specifications` | object (JSON) | ❌ No | Free-form JSON | `{"color": "Black"}` | Product specifications |
| `certifications` | array of strings | ❌ No | - | `["CE", "FCC"]` | Product certifications |
| `warrantyInfo` | string | ❌ No | - | `"1 year warranty"` | Warranty information |
| `returnPolicy` | object (JSON) | ❌ No | See structure below | See JSON structure | Return policy details |
| `refundPolicy` | object (JSON) | ❌ No | See structure below | See JSON structure | Refund policy details |
| `shippingPolicy` | object (JSON) | ❌ No | See structure below | See JSON structure | Shipping policy details |
| `exchangePolicy` | object (JSON) | ❌ No | See structure below | See JSON structure | Exchange policy details |
| `cancellationPolicy` | object (JSON) | ❌ No | See structure below | See JSON structure | Cancellation policy details |
| `careInstructions` | string | ❌ No | - | `"Clean with soft cloth"` | Care instructions |
| `countryOfOrigin` | string | ❌ No | - | `"China"` | Country of origin |
| `manufacturerInfo` | object (JSON) | ❌ No | See structure below | See JSON structure | Manufacturer information |
| `brand` | string | ❌ No | - | `"TechBrand"` | Product brand |
| `modelNumber` | string | ❌ No | - | `"TB-HEAD-2024"` | Model number |
| `weightDimensions` | object (JSON) | ❌ No | See structure below | See JSON structure | Weight and dimensions |
| `minOrderQuantity` | integer | ❌ No | Minimum: 1, Default: 1 | `1` | Minimum order quantity |
| `maxOrderQuantity` | integer | ❌ No | Minimum: 1 | `10` | Maximum order quantity |
| `isActive` | boolean | ❌ No | - | `true` | Product active status (PUT only) |

### Product JSON Field Structures Reference

Before using the product APIs, understand the JSON structures for complex fields:

#### returnPolicy (JSON Object)
```json
{
  "window": "30 days",                           // string: Return window (e.g., "30 days", "14 days", "7 days")
  "conditions": "Item must be unused...",        // string: Return conditions
  "process": "Contact support to initiate...",   // string: Return process instructions
  "shippingCost": "Customer pays return..."      // string: Return shipping cost information
}
```

#### refundPolicy (JSON Object)
```json
{
  "method": "original payment method",           // string: Refund method (e.g., "original payment method", "store credit")
  "timeline": "7-14 business days",              // string: Refund processing timeline
  "conditions": "Refund processed after..."     // string: Refund conditions
}
```

#### shippingPolicy (JSON Object)
```json
{
  "deliveryTime": "3-5 business days",           // string: Expected delivery time
  "methods": ["standard", "express"],            // array of strings: Available shipping methods
  "costs": {                                     // object: Shipping costs by method
    "standard": 5.99,                            // number: Standard shipping cost
    "express": 12.99,                            // number: Express shipping cost
    "overnight": 19.99                          // number: Overnight shipping cost (optional)
  },
  "freeShippingThreshold": 50.00               // number: Minimum order amount for free shipping
}
```

#### exchangePolicy (JSON Object)
```json
{
  "window": "30 days",                           // string: Exchange window
  "conditions": "Item must be unused...",       // string: Exchange conditions
  "process": "Contact support for exchange"     // string: Exchange process
}
```

#### cancellationPolicy (JSON Object)
```json
{
  "window": "24 hours",                          // string: Cancellation window
  "terms": "Full refund if cancelled..."        // string: Cancellation terms
}
```

#### manufacturerInfo (JSON Object)
```json
{
  "name": "Manufacturer Name",                   // string: Manufacturer name
  "contact": "support@manufacturer.com",        // string (email): Contact email
  "address": "123 Street, City, Country",       // string: Manufacturer address
  "website": "https://manufacturer.com"        // string (URI): Manufacturer website
}
```

#### weightDimensions (JSON Object)
```json
{
  "weight": {                                    // object: Weight information
    "value": 1.5,                               // number: Weight value
    "unit": "kg"                                // string: Weight unit (kg, g, lb, oz)
  },
  "dimensions": {                               // object: Dimension information
    "length": 10,                               // number: Length
    "width": 5,                                 // number: Width
    "height": 3,                                // number: Height
    "unit": "cm"                                // string: Dimension unit (cm, m, in, ft)
  }
}
```

#### specifications (JSON Object)
Free-form JSON object that can contain any key-value pairs:
```json
{
  "color": "Black",
  "material": "Plastic",
  "connectivity": "Bluetooth 5.0",
  "battery": "20 hours",
  "weight": "250g"
}
```

---

### GET /api/v1/products/

Get list of products with filters

Retrieve a paginated list of products with optional filtering and sorting

**Permissions**: Public

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
  - Type: integer
  - Minimum: 1
  - Example: `1`
- `limit` (integer, optional): Items per page (default: 20)
  - Type: integer
  - Minimum: 1
  - Maximum: 100 (recommended)
  - Example: `20`
- `search` (string, optional): Search query to filter products by name, description, or SKU
  - Type: string
  - Case-insensitive search
  - Example: `"wireless"`
- `category` (string, optional): Category ID filter
  - Type: string
  - Example: `"cat_123"`
- `minPrice` (number, optional): Minimum price filter
  - Type: number (decimal)
  - Example: `10.00`
- `maxPrice` (number, optional): Maximum price filter
  - Type: number (decimal)
  - Example: `100.00`
- `sortBy` (string, optional): Sort field (default: `createdAt`)
  - Type: string
  - Allowed values: `price`, `name`, `createdAt`, `updatedAt`
  - Example: `"price"`
- `sortOrder` (string, optional): Sort order (default: `desc`)
  - Type: string
  - Allowed values: `asc`, `desc`
  - Example: `"asc"`
- `isActive` (boolean, optional): Filter by active status (default: `true`)
  - Type: boolean (as string: `"true"` or `"false"`)
  - Example: `"true"`

**Example Requests:**
```
GET /api/v1/products?page=1&limit=20
GET /api/v1/products?category=cat_123&minPrice=10&maxPrice=100&sortBy=price&sortOrder=asc
GET /api/v1/products?search=wireless&isActive=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1234567890",
      "name": "Premium Wireless Headphones",
      "description": "High-quality wireless headphones",
      "slug": "premium-wireless-headphones",
      "price": "199.99",
      "compareAtPrice": "249.99",
      "originalPrice": "219.99",
      "sku": "SKU-HEAD-001",
      "images": ["https://example.com/image1.jpg"],
      "categoryId": "cat_123",
      "isActive": true,
      "badges": ["New", "Featured"],
      "specifications": {
        "color": "Black",
        "material": "Plastic"
      },
      "certifications": ["CE", "FCC"],
      "warrantyInfo": "1 year manufacturer warranty",
      "returnPolicy": {
        "window": "30 days",
        "conditions": "Item must be unused, in original packaging"
      },
      "refundPolicy": {
        "method": "original payment method",
        "timeline": "7-14 business days"
      },
      "shippingPolicy": {
        "deliveryTime": "3-5 business days",
        "methods": ["standard", "express"]
      },
      "exchangePolicy": {
        "window": "30 days",
        "conditions": "Item must be unused"
      },
      "cancellationPolicy": {
        "window": "24 hours",
        "terms": "Full refund if cancelled within 24 hours"
      },
      "careInstructions": "Clean with soft cloth",
      "countryOfOrigin": "China",
      "manufacturerInfo": {
        "name": "Manufacturer Name",
        "contact": "support@manufacturer.com"
      },
      "brand": "TechBrand",
      "modelNumber": "TB-HEAD-2024",
      "weightDimensions": {
        "weight": {
          "value": 1.5,
          "unit": "kg"
        },
        "dimensions": {
          "length": 10,
          "width": 5,
          "height": 3,
          "unit": "cm"
        }
      },
      "minOrderQuantity": 1,
      "maxOrderQuantity": 10,
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of Product objects (or `products` in some implementations)
  - Each product includes all fields as documented in GET /api/v1/products/:id
- `pagination` (object): Pagination information
  - `page` (integer): Current page number
  - `limit` (integer): Items per page
  - `total` (integer): Total number of products
  - `pages` (integer): Total number of pages (or `totalPages` in some implementations)
```

**Error Responses:**

**400 Bad Request** - Validation error (invalid query parameters)
```json
{
  "success": false,
  "error": "Validation error - invalid query parameters",
  "errors": [
    {
      "field": "page",
      "message": "\"page\" must be a number"
    },
    {
      "field": "sort",
      "message": "\"sort\" must be one of [price, name, createdAt]"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/products/search

Search products

Search products by query string

**Permissions**: Public

**Query Parameters:**
- `q` (string, **required**): Search query string
  - Description: Search query to match against product name, description, SKU, brand, etc.
  - Example: `"wireless headphones"` or `"SKU-HEAD"`

**Example Request:**
```
GET /api/v1/products/search?q=wireless headphones
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1234567890",
      "name": "Premium Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "slug": "premium-wireless-headphones",
      "price": "199.99",
      "compareAtPrice": "249.99",
      "originalPrice": "219.99",
      "sku": "SKU-HEAD-001",
      "images": ["https://example.com/image1.jpg"],
      "categoryId": "cat_123",
      "isActive": true,
      "badges": ["New", "Featured"],
      "specifications": {
        "color": "Black",
        "material": "Plastic"
      },
      "certifications": ["CE", "FCC"],
      "warrantyInfo": "1 year manufacturer warranty",
      "returnPolicy": {
        "window": "30 days",
        "conditions": "Item must be unused, in original packaging"
      },
      "refundPolicy": {
        "method": "original payment method",
        "timeline": "7-14 business days"
      },
      "shippingPolicy": {
        "deliveryTime": "3-5 business days",
        "methods": ["standard", "express"]
      },
      "exchangePolicy": {
        "window": "30 days",
        "conditions": "Item must be unused"
      },
      "cancellationPolicy": {
        "window": "24 hours",
        "terms": "Full refund if cancelled within 24 hours"
      },
      "careInstructions": "Clean with soft cloth",
      "countryOfOrigin": "China",
      "manufacturerInfo": {
        "name": "Manufacturer Name",
        "contact": "support@manufacturer.com"
      },
      "brand": "TechBrand",
      "modelNumber": "TB-HEAD-2024",
      "weightDimensions": {
        "weight": {
          "value": 1.5,
          "unit": "kg"
        },
        "dimensions": {
          "length": 10,
          "width": 5,
          "height": 3,
          "unit": "cm"
        }
      },
      "minOrderQuantity": 1,
      "maxOrderQuantity": 10,
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of Product objects matching the search query
  - Each product includes all fields as documented in GET /api/v1/products/:id
- `pagination` (object): Pagination information
  - `page` (integer): Current page number
  - `limit` (integer): Items per page
  - `total` (integer): Total number of matching products
  - `totalPages` (integer): Total number of pages

**Error Responses:**

**400 Bad Request** - Validation error (missing or invalid query parameter)
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "q",
      "message": "\"q\" is required"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/products/categories

Get all categories

Retrieve all product categories

**Permissions**: Public

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Electronics",
      "description": "Electronic products",
      "slug": "electronics",
      "image": "https://example.com/category-image.jpg",
      "parentId": null,
      "order": 0,
      "isActive": true,
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:00:00.000Z",
      "_count": {
        "products": 25
      }
    }
  ]
}
```

**Error Responses:**

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/products/categories/:id

Get category by ID

Retrieve a specific category by its ID

**Permissions**: Public

**Path Parameters:**
- `id` (string, **required**): Category ID

**Example Request:**
```
GET /api/v1/products/categories/cat_123
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cat_123",
    "name": "Electronics",
    "description": "Electronic products",
    "slug": "electronics",
    "image": "https://example.com/category-image.jpg",
    "parentId": null,
    "order": 0,
    "isActive": true,
    "createdAt": "2025-12-31T05:00:00.000Z",
    "updatedAt": "2025-12-31T05:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found** - Category not found
```json
{
  "success": false,
  "error": "Not Found - /api/v1/products/categories/cat-123"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/products/:id

Get product details

**Permissions**: Public

**Path Parameters:**
- `id` (string, **required**): Product ID
  - Example: `"prod_1234567890"`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "prod_1234567890",
    "name": "Premium Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "slug": "premium-wireless-headphones",
    "price": "199.99",
    "compareAtPrice": "249.99",
    "originalPrice": "219.99",
    "sku": "SKU-HEAD-001",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "categoryId": "cat_123",
    "isActive": true,
    "badges": ["New", "Featured"],
    "specifications": {
      "color": "Black",
      "material": "Plastic",
      "connectivity": "Bluetooth 5.0"
    },
    "certifications": ["CE", "FCC", "RoHS"],
    "warrantyInfo": "1 year manufacturer warranty",
    "returnPolicy": {
      "window": "30 days",
      "conditions": "Item must be unused, in original packaging",
      "process": "Contact support to initiate return",
      "shippingCost": "Customer pays return shipping"
    },
    "refundPolicy": {
      "method": "original payment method",
      "timeline": "7-14 business days",
      "conditions": "Refund processed after item inspection"
    },
    "shippingPolicy": {
      "deliveryTime": "3-5 business days",
      "methods": ["standard", "express"],
      "costs": {
        "standard": 5.99,
        "express": 12.99
      },
      "freeShippingThreshold": 50.00
    },
    "exchangePolicy": {
      "window": "30 days",
      "conditions": "Item must be unused",
      "process": "Contact support for exchange"
    },
    "cancellationPolicy": {
      "window": "24 hours",
      "terms": "Full refund if cancelled within 24 hours of order"
    },
    "careInstructions": "Clean with soft cloth. Do not immerse in water.",
    "countryOfOrigin": "China",
    "manufacturerInfo": {
      "name": "Manufacturer Name",
      "contact": "support@manufacturer.com",
      "address": "123 Street, City, Country",
      "website": "https://manufacturer.com"
    },
    "brand": "TechBrand",
    "modelNumber": "TB-HEAD-2024",
    "weightDimensions": {
      "weight": {
        "value": 1.5,
        "unit": "kg"
      },
      "dimensions": {
        "length": 10,
        "width": 5,
        "height": 3,
        "unit": "cm"
      }
    },
    "minOrderQuantity": 1,
    "maxOrderQuantity": 10,
    "createdAt": "2025-12-31T05:00:00.000Z",
    "updatedAt": "2025-12-31T05:00:00.000Z",
    "category": {
      "id": "cat_123",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic products",
      "image": "https://example.com/category-image.jpg",
      "isActive": true
    },
    "variants": [
      {
        "id": "var_123",
        "name": "Color: Black",
        "sku": "SKU-HEAD-001-BLK",
        "price": "199.99",
        "stock": 50,
        "attributes": {
          "color": "Black",
          "size": "Standard"
        },
        "images": ["https://example.com/variant-image.jpg"],
        "isActive": true,
        "createdAt": "2025-12-31T05:00:00.000Z",
        "updatedAt": "2025-12-31T05:00:00.000Z"
      }
    ],
    "inventory": {
      "id": "inv_123",
      "productId": "prod_1234567890",
      "stock": 50,
      "reserved": 5,
      "lowStockThreshold": 10,
      "version": 0,
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:00:00.000Z"
    },
    "reviews": [
      {
        "id": "rev_123",
        "userId": "user_123",
        "productId": "prod_1234567890",
        "rating": 5,
        "comment": "Excellent product!",
        "status": "APPROVED",
        "helpfulCount": 10,
        "createdAt": "2025-12-31T05:00:00.000Z",
        "updatedAt": "2025-12-31T05:00:00.000Z",
        "user": {
          "id": "user_123",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "_count": {
      "reviews": 25
    }
  }
}
```

**Response Fields:**
- All product fields as documented above
- `category` (object): Category details including id, name, slug, description, image, isActive
- `variants` (array): Array of active product variants
  - Each variant includes: id, name, sku, price, stock, attributes (JSON), images, isActive, timestamps
- `inventory` (object): Inventory information
  - Includes: id, productId, stock, reserved, lowStockThreshold, version, timestamps
- `reviews` (array): Up to 10 most recent approved reviews
  - Each review includes: id, userId, productId, rating (1-5), comment, status, helpfulCount, timestamps, user (id, firstName, lastName)
- `_count` (object): Count of related entities
  - `reviews` (integer): Total number of reviews

**Error Responses:**

**404 Not Found** - Product not found
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Product not found
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/products

Create new product (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "name": "Premium Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "slug": "premium-wireless-headphones",
  "price": 199.99,
  "compareAtPrice": 249.99,
  "originalPrice": 219.99,
  "sku": "SKU-HEAD-001",
  "stock": 100,
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "categoryId": "cat_123",
  "badges": ["New", "Featured"],
  "specifications": {
    "color": "Black",
    "material": "Plastic",
    "connectivity": "Bluetooth 5.0"
  },
  "certifications": ["CE", "FCC", "RoHS"],
  "warrantyInfo": "1 year manufacturer warranty",
  "returnPolicy": {
    "window": "30 days",
    "conditions": "Item must be unused, in original packaging",
    "process": "Contact support to initiate return",
    "shippingCost": "Customer pays return shipping"
  },
  "refundPolicy": {
    "method": "original payment method",
    "timeline": "7-14 business days",
    "conditions": "Refund processed after item inspection"
  },
  "shippingPolicy": {
    "deliveryTime": "3-5 business days",
    "methods": ["standard", "express"],
    "costs": {
      "standard": 5.99,
      "express": 12.99
    },
    "freeShippingThreshold": 50.00
  },
  "exchangePolicy": {
    "window": "30 days",
    "conditions": "Item must be unused",
    "process": "Contact support for exchange"
  },
  "cancellationPolicy": {
    "window": "24 hours",
    "terms": "Full refund if cancelled within 24 hours of order"
  },
  "careInstructions": "Clean with soft cloth. Do not immerse in water.",
  "countryOfOrigin": "China",
  "manufacturerInfo": {
    "name": "Manufacturer Name",
    "contact": "support@manufacturer.com",
    "address": "123 Street, City, Country",
    "website": "https://manufacturer.com"
  },
  "brand": "TechBrand",
  "modelNumber": "TB-HEAD-2024",
  "weightDimensions": {
    "weight": {
      "value": 1.5,
      "unit": "kg"
    },
    "dimensions": {
      "length": 10,
      "width": 5,
      "height": 3,
      "unit": "cm"
    }
  },
  "minOrderQuantity": 1,
  "maxOrderQuantity": 10
}
```

**Required Fields:**
- `name` (string, required): Product name
  - Example: `"Premium Wireless Headphones"`
- `price` (number, decimal, required, minimum: 0): Current selling price
  - Example: `199.99`
  - Format: decimal number
  - Validation: Must be >= 0
- `sku` (string, required): Stock Keeping Unit (unique identifier)
  - Example: `"SKU-HEAD-001"`
  - Must be unique across all products

- `stock` (integer, optional, default: 0, minimum: 0): Initial stock quantity
  - Example: `100`
  - Type: integer
  - Default: 0 if not provided
  - Validation: Must be >= 0

**Optional Fields:**

- `description` (string, optional): Product description
  - Example: `"High-quality wireless headphones with noise cancellation"`
  - Type: string

- `slug` (string, optional): URL-friendly product slug
  - Example: `"premium-wireless-headphones"`
  - Auto-generated from name if not provided
  - Format: lowercase, hyphens instead of spaces

- `compareAtPrice` (number, decimal, optional, minimum: 0): Manufacturer's suggested retail price (MSRP) or "was" price for display
  - Example: `249.99`
  - Format: decimal number
  - Validation: Must be >= 0

- `originalPrice` (number, decimal, optional, minimum: 0): Original selling price before any discounts or promotions
  - Example: `219.99`
  - Format: decimal number
  - Validation: Must be >= 0

- `images` (array of strings, optional): Array of product image URLs
  - Example: `["https://example.com/image1.jpg", "https://example.com/image2.jpg"]`
  - Type: array of URI strings
  - Format: Each item must be a valid URI

- `categoryId` (string, optional): Category ID
  - Example: `"cat_123"`
  - Type: string

- `badges` (array of strings, optional): Product badges
  - Example: `["New", "Featured", "Sale"]`
  - Type: array of strings
  - Common values: "New", "Sale", "Featured", "Bestseller", "Limited"

- `specifications` (object, optional): Product specifications as JSON object
  - Example: `{"color": "Black", "material": "Plastic", "connectivity": "Bluetooth 5.0"}`
  - Type: JSON object
  - Can contain any key-value pairs

- `certifications` (array of strings, optional): Product certifications
  - Example: `["CE", "FCC", "RoHS"]`
  - Type: array of strings
  - Common values: "CE", "FCC", "RoHS", "ISO", "FDA"

- `warrantyInfo` (string, optional): Warranty information
  - Example: `"1 year manufacturer warranty"`
  - Type: string

- `returnPolicy` (object, optional): Return policy details (JSON object)
  - Structure:
    ```json
    {
      "window": "30 days",                    // string: Return window
      "conditions": "Item must be unused...", // string: Return conditions
      "process": "Contact support...",        // string: Return process
      "shippingCost": "Customer pays..."      // string: Shipping cost info
    }
    ```
  - Example:
    ```json
    {
      "window": "30 days",
      "conditions": "Item must be unused, in original packaging",
      "process": "Contact support to initiate return",
      "shippingCost": "Customer pays return shipping"
    }
    ```

- `refundPolicy` (object, optional): Refund policy details (JSON object)
  - Structure:
    ```json
    {
      "method": "original payment method",    // string: Refund method
      "timeline": "7-14 business days",      // string: Refund timeline
      "conditions": "Refund processed..."    // string: Refund conditions
    }
    ```
  - Example:
    ```json
    {
      "method": "original payment method",
      "timeline": "7-14 business days",
      "conditions": "Refund processed after item inspection"
    }
    ```

- `shippingPolicy` (object, optional): Shipping policy details (JSON object)
  - Structure:
    ```json
    {
      "deliveryTime": "3-5 business days",   // string: Delivery time
      "methods": ["standard", "express"],     // array: Available shipping methods
      "costs": {                              // object: Shipping costs by method
        "standard": 5.99,                     // number: Standard shipping cost
        "express": 12.99                      // number: Express shipping cost
      },
      "freeShippingThreshold": 50.00         // number: Minimum order for free shipping
    }
    ```
  - Example:
    ```json
    {
      "deliveryTime": "3-5 business days",
      "methods": ["standard", "express"],
      "costs": {
        "standard": 5.99,
        "express": 12.99
      },
      "freeShippingThreshold": 50.00
    }
    ```

- `exchangePolicy` (object, optional): Exchange policy details (JSON object)
  - Structure:
    ```json
    {
      "window": "30 days",                    // string: Exchange window
      "conditions": "Item must be unused",    // string: Exchange conditions
      "process": "Contact support..."         // string: Exchange process
    }
    ```
  - Example:
    ```json
    {
      "window": "30 days",
      "conditions": "Item must be unused",
      "process": "Contact support for exchange"
    }
    ```

- `cancellationPolicy` (object, optional): Cancellation policy details (JSON object)
  - Structure:
    ```json
    {
      "window": "24 hours",                   // string: Cancellation window
      "terms": "Full refund if..."           // string: Cancellation terms
    }
    ```
  - Example:
    ```json
    {
      "window": "24 hours",
      "terms": "Full refund if cancelled within 24 hours of order"
    }
    ```

- `careInstructions` (string, optional): Care and maintenance instructions
  - Example: `"Clean with soft cloth. Do not immerse in water."`
  - Type: string

- `countryOfOrigin` (string, optional): Country where the product was manufactured
  - Example: `"China"` or `"United States"`
  - Type: string

- `manufacturerInfo` (object, optional): Manufacturer information (JSON object)
  - Structure:
    ```json
    {
      "name": "Manufacturer Name",           // string: Manufacturer name
      "contact": "support@manufacturer.com",  // string (email): Contact email
      "address": "123 Street, City...",      // string: Manufacturer address
      "website": "https://manufacturer.com"  // string (URI): Manufacturer website
    }
    ```
  - Example:
    ```json
    {
      "name": "Manufacturer Name",
      "contact": "support@manufacturer.com",
      "address": "123 Street, City, Country",
      "website": "https://manufacturer.com"
    }
    ```

- `brand` (string, optional): Product brand name
  - Example: `"TechBrand"`
  - Type: string

- `modelNumber` (string, optional): Product model number
  - Example: `"TB-HEAD-2024"`
  - Type: string

- `weightDimensions` (object, optional): Weight and dimensions (JSON object)
  - Structure:
    ```json
    {
      "weight": {                            // object: Weight information
        "value": 1.5,                        // number: Weight value
        "unit": "kg"                         // string: Weight unit (kg, g, lb, oz)
      },
      "dimensions": {                        // object: Dimension information
        "length": 10,                        // number: Length
        "width": 5,                          // number: Width
        "height": 3,                         // number: Height
        "unit": "cm"                         // string: Dimension unit (cm, m, in, ft)
      }
    }
    ```
  - Example:
    ```json
    {
      "weight": {
        "value": 1.5,
        "unit": "kg"
      },
      "dimensions": {
        "length": 10,
        "width": 5,
        "height": 3,
        "unit": "cm"
      }
    }
    ```

- `minOrderQuantity` (integer, optional, default: 1, minimum: 1): Minimum order quantity
  - Example: `1`
  - Type: integer
  - Default: 1
  - Validation: Must be >= 1

- `maxOrderQuantity` (integer, optional, minimum: 1): Maximum order quantity
  - Example: `10`
  - Type: integer
  - Validation: Must be >= 1

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "prod_1234567890",
    "name": "Premium Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "slug": "premium-wireless-headphones",
    "price": "199.99",
    "compareAtPrice": "249.99",
    "originalPrice": "219.99",
    "sku": "SKU-HEAD-001",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "categoryId": "cat_123",
    "isActive": true,
    "badges": ["New", "Featured"],
    "specifications": {
      "color": "Black",
      "material": "Plastic",
      "connectivity": "Bluetooth 5.0"
    },
    "certifications": ["CE", "FCC", "RoHS"],
    "warrantyInfo": "1 year manufacturer warranty",
    "returnPolicy": {
      "window": "30 days",
      "conditions": "Item must be unused, in original packaging",
      "process": "Contact support to initiate return",
      "shippingCost": "Customer pays return shipping"
    },
    "refundPolicy": {
      "method": "original payment method",
      "timeline": "7-14 business days",
      "conditions": "Refund processed after item inspection"
    },
    "shippingPolicy": {
      "deliveryTime": "3-5 business days",
      "methods": ["standard", "express"],
      "costs": {
        "standard": 5.99,
        "express": 12.99
      },
      "freeShippingThreshold": 50.00
    },
    "exchangePolicy": {
      "window": "30 days",
      "conditions": "Item must be unused",
      "process": "Contact support for exchange"
    },
    "cancellationPolicy": {
      "window": "24 hours",
      "terms": "Full refund if cancelled within 24 hours of order"
    },
    "careInstructions": "Clean with soft cloth. Do not immerse in water.",
    "countryOfOrigin": "China",
    "manufacturerInfo": {
      "name": "Manufacturer Name",
      "contact": "support@manufacturer.com",
      "address": "123 Street, City, Country",
      "website": "https://manufacturer.com"
    },
    "brand": "TechBrand",
    "modelNumber": "TB-HEAD-2024",
    "weightDimensions": {
      "weight": {
        "value": 1.5,
        "unit": "kg"
      },
      "dimensions": {
        "length": 10,
        "width": 5,
        "height": 3,
        "unit": "cm"
      }
    },
    "minOrderQuantity": 1,
    "maxOrderQuantity": 10,
    "createdAt": "2025-12-31T05:00:00.000Z",
    "updatedAt": "2025-12-31T05:00:00.000Z",
    "category": {
      "id": "cat_123",
      "name": "Electronics",
      "slug": "electronics"
    }
  }
}
```

**Response Fields:**
- All fields from the request body are returned in the response
- `id` (string): Generated product ID
- `isActive` (boolean): Product active status (default: true)
- `createdAt` (string, ISO 8601): Creation timestamp
- `updatedAt` (string, ISO 8601): Last update timestamp
- `category` (object): Category details if categoryId was provided

**Error Responses:**

**400 Bad Request** - Validation error or SKU already exists
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "\"name\" is required"
    },
    {
      "field": "price",
      "message": "\"price\" must be a number"
    },
    {
      "field": "sku",
      "message": "\"sku\" is required"
    },
    {
      "field": "price",
      "message": "\"price\" must be >= 0"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Insufficient permissions (not admin)
```json
{
  "success": false,
  "error": "Forbidden - Insufficient permissions"
}
```

**409 Conflict** - SKU already exists
```json
{
  "success": false,
  "error": "SKU already exists"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/products/:id

Update product (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, **required**): Product ID
  - Example: `"prod_1234567890"`

**Request Body:**
All fields are optional for updates. Only include fields you want to update. All fields from POST endpoint are available, plus `isActive`.

**Request Body Schema (All Fields Optional):**
```json
{
  "name": "Updated Product Name",
  "description": "Updated product description",
  "slug": "updated-product-slug",
  "price": 189.99,
  "compareAtPrice": 239.99,
  "originalPrice": 209.99,
  "sku": "SKU-UPDATED-001",
  "images": ["https://example.com/new-image.jpg"],
  "categoryId": "cat_456",
  "badges": ["Sale", "Featured"],
  "specifications": {
    "color": "White",
    "material": "Metal"
  },
  "certifications": ["CE", "FCC"],
  "warrantyInfo": "2 year manufacturer warranty",
  "returnPolicy": {
    "window": "45 days",
    "conditions": "Updated return conditions",
    "process": "Updated return process",
    "shippingCost": "Free return shipping"
  },
  "refundPolicy": {
    "method": "original payment method",
    "timeline": "5-10 business days",
    "conditions": "Updated refund conditions"
  },
  "shippingPolicy": {
    "deliveryTime": "2-4 business days",
    "methods": ["standard", "express", "overnight"],
    "costs": {
      "standard": 4.99,
      "express": 10.99,
      "overnight": 19.99
    },
    "freeShippingThreshold": 75.00
  },
  "exchangePolicy": {
    "window": "45 days",
    "conditions": "Updated exchange conditions",
    "process": "Updated exchange process"
  },
  "cancellationPolicy": {
    "window": "48 hours",
    "terms": "Updated cancellation terms"
  },
  "careInstructions": "Updated care instructions",
  "countryOfOrigin": "United States",
  "manufacturerInfo": {
    "name": "Updated Manufacturer",
    "contact": "newcontact@manufacturer.com",
    "address": "456 New Street, City, Country",
    "website": "https://newmanufacturer.com"
  },
  "brand": "UpdatedBrand",
  "modelNumber": "TB-HEAD-2025",
  "weightDimensions": {
    "weight": {
      "value": 1.2,
      "unit": "kg"
    },
    "dimensions": {
      "length": 12,
      "width": 6,
      "height": 4,
      "unit": "cm"
    }
  },
  "minOrderQuantity": 2,
  "maxOrderQuantity": 20,
  "isActive": true
}
```

**Available Fields (All Optional for Updates):**

All fields from POST endpoint are available, with the same data types, formats, and validation rules:

- `name` (string, optional): Product name
- `description` (string, optional): Product description
- `slug` (string, optional): URL-friendly product slug
- `price` (number, decimal, optional, minimum: 0): Current selling price
- `compareAtPrice` (number, decimal, optional, minimum: 0): MSRP or "was" price
- `originalPrice` (number, decimal, optional, minimum: 0): Original selling price before discounts
- `sku` (string, optional): Stock Keeping Unit (must be unique if provided)
- `stock` (integer, optional, minimum: 0): Stock quantity
  - Example: `100`
  - Type: integer
  - Validation: Must be >= 0
- `images` (array of strings, optional): Array of product image URLs
- `categoryId` (string, optional): Category ID
- `badges` (array of strings, optional): Product badges
- `specifications` (object, optional): Product specifications (JSON object)
- `certifications` (array of strings, optional): Product certifications
- `warrantyInfo` (string, optional): Warranty information
- `returnPolicy` (object, optional): Return policy (JSON object with `window`, `conditions`, `process`, `shippingCost`)
- `refundPolicy` (object, optional): Refund policy (JSON object with `method`, `timeline`, `conditions`)
- `shippingPolicy` (object, optional): Shipping policy (JSON object with `deliveryTime`, `methods`, `costs`, `freeShippingThreshold`)
- `exchangePolicy` (object, optional): Exchange policy (JSON object with `window`, `conditions`, `process`)
- `cancellationPolicy` (object, optional): Cancellation policy (JSON object with `window`, `terms`)
- `careInstructions` (string, optional): Care and maintenance instructions
- `countryOfOrigin` (string, optional): Country where the product was manufactured
- `manufacturerInfo` (object, optional): Manufacturer information (JSON object with `name`, `contact`, `address`, `website`)
- `brand` (string, optional): Product brand name
- `modelNumber` (string, optional): Product model number
- `weightDimensions` (object, optional): Weight and dimensions (JSON object with `weight` {`value`, `unit`} and `dimensions` {`length`, `width`, `height`, `unit`})
- `minOrderQuantity` (integer, optional, minimum: 1): Minimum order quantity
- `maxOrderQuantity` (integer, optional, minimum: 1): Maximum order quantity
- `isActive` (boolean, optional): Whether the product is active

**JSON Field Structures (Same as POST):**

All JSON fields (`returnPolicy`, `refundPolicy`, `shippingPolicy`, `exchangePolicy`, `cancellationPolicy`, `manufacturerInfo`, `weightDimensions`, `specifications`) follow the same structure as documented in the POST endpoint above.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "prod_1234567890",
    "name": "Updated Product Name",
    "description": "Updated product description",
    "slug": "updated-product-slug",
    "price": "189.99",
    "compareAtPrice": "239.99",
    "originalPrice": "209.99",
    "sku": "SKU-UPDATED-001",
    "stock": 150,
    "images": ["https://example.com/new-image.jpg"],
    "categoryId": "cat_456",
    "isActive": true,
    "badges": ["Sale", "Featured"],
    "specifications": {
      "color": "White",
      "material": "Metal"
    },
    "returnPolicy": {
      "window": "45 days",
      "conditions": "Updated return conditions"
    },
    "brand": "UpdatedBrand",
    "weightDimensions": {
      "weight": {
        "value": 1.2,
        "unit": "kg"
      }
    },
    "updatedAt": "2025-12-31T05:30:00.000Z",
    "category": {
      "id": "cat_456",
      "name": "Updated Category"
    },
    "variants": []
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "price",
      "message": "\"price\" must be a positive number"
    },
    {
      "field": "minOrderQuantity",
      "message": "\"minOrderQuantity\" must be >= 1"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Insufficient permissions (not admin)
```json
{
  "success": false,
  "error": "Forbidden - Insufficient permissions"
}
```

**404 Not Found** - Product not found
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/products/:id

Delete product (Admin only)

Soft delete - sets product `isActive` to `false` instead of permanently deleting

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Product ID
  - Example: `"prod_1234567890"`

**Example Request:**
```
DELETE /api/v1/products/prod_1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted"
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Insufficient permissions (not admin)
```json
{
  "success": false,
  "error": "Forbidden - Insufficient permissions"
}
```

**404 Not Found** - Product not found
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/products/categories

Search results retrieved successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/products/categories/:id

Validation error - missing or invalid query parameter

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/products/categories/:id

Validation error - missing or invalid query parameter

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 2.1 Package Management

Package Management provides configurable **packages** (e.g. CCTV plans, solar kits) with a **taxonomy** (industry → segment → subcategory) and **customization options** that affect price. Packages can be used for any industry; taxonomy and options are admin-configurable.

**Base path**: `/api/v1/packages`

### Taxonomy (configurable segments / subcategories)

#### GET /api/v1/packages/taxonomy

Get taxonomy tree or flat list. Used to build segment/subcategory filters (e.g. Home, Office, Industrial or custom verticals).

**Permissions**: Public

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| parentId | string | Optional. Return only children of this node (use empty or `null` for roots). |
| flat | string | Optional. `"true"` for flat list; otherwise returns nested tree. |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tax_xxx",
      "name": "Home",
      "slug": "home",
      "level": 1,
      "parentId": "tax_parent",
      "sortOrder": 0,
      "isActive": true,
      "metadata": null,
      "children": []
    }
  ]
}
```

---

#### GET /api/v1/packages/taxonomy/:id

Get a single taxonomy node with parent and children.

**Permissions**: Public

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "tax_xxx",
    "name": "Home",
    "slug": "home",
    "level": 1,
    "parentId": "tax_parent",
    "sortOrder": 0,
    "isActive": true,
    "parent": { ... },
    "children": [ ... ],
    "_count": { "packages": 4 }
  }
}
```

**404 Not Found** – Taxonomy node not found.

---

#### POST /api/v1/packages/taxonomy

Create a taxonomy node (industry, segment, or subcategory).

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Display name (e.g. "Home", "Office"). |
| slug | string | No | URL-friendly slug; auto-generated from name if omitted. |
| level | integer | No | Depth level (0 = root/industry, 1 = segment, etc.). Default 0. |
| parentId | string | No | Parent node ID; omit or null for root. |
| sortOrder | integer | No | Display order. Default 0. |
| metadata | object | No | Optional industry-specific data. |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "tax_xxx",
    "name": "Home",
    "slug": "home",
    "level": 1,
    "parentId": "tax_parent",
    "sortOrder": 0,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### PUT /api/v1/packages/taxonomy/:id

Update a taxonomy node.

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):** Same fields as POST (all optional).

**Response (200 OK):** `{ "success": true, "data": <updated taxonomy node> }`

---

#### DELETE /api/v1/packages/taxonomy/:id

Delete a taxonomy node (cascades to children if applicable).

**Permissions**: Admin (Bearer token required)

**Response (200 OK):** `{ "success": true, "message": "Taxonomy node deleted" }`

---

### Packages

#### GET /api/v1/packages

List packages with optional filters. Returns only active packages by default; admin can pass `isActive=false` to include inactive.

**Permissions**: Public (read); active-only by default.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number. Default 1. |
| limit | integer | Items per page. Default 20. |
| taxonomyId | string | Filter by taxonomy node ID (segment/subcategory). |
| segmentId | string | Alias for taxonomyId. |
| isActive | string | `"true"` or `"false"`. Default `"true"`. |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pkg_xxx",
      "name": "Starter Setup",
      "slug": "starter-setup",
      "description": "...",
      "basePrice": "12999.00",
      "defaultFeatures": ["2x 2.4 MP HD Cameras", "500 GB Storage", "..."],
      "isPopular": false,
      "isActive": true,
      "taxonomyId": "tax_xxx",
      "categoryId": null,
      "taxonomy": { "id": "tax_xxx", "name": "Small Homes", "slug": "small-homes" },
      "category": null,
      "options": [
        {
          "id": "opt_xxx",
          "key": "camera_count",
          "label": "Number of cameras",
          "type": "NUMBER",
          "config": { "min": 2, "max": 8, "step": 1, "default": 2, "pricePerUnit": 1500 },
          "sortOrder": 0,
          "isRequired": true
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 12, "pages": 1 }
}
```

---

#### GET /api/v1/packages/slug/:slug

Get a package by slug.

**Permissions**: Public

**Response (200 OK):** `{ "success": true, "data": <package with taxonomy, category, options> }`

**404 Not Found** – Package not found or inactive.

---

#### GET /api/v1/packages/:id

Get a package by ID.

**Permissions**: Public

**Response (200 OK):** `{ "success": true, "data": <package with taxonomy, category, options> }`

**404 Not Found** – Package not found.

---

#### POST /api/v1/packages/:id/calculate-price

Calculate the price for a package with given customization (e.g. for live UI updates).

**Permissions**: Public

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customization | object | No | Key-value map of option keys to chosen values. Can also send keys at top level. |

Example:
```json
{
  "customization": {
    "camera_count": 4,
    "camera_type": "5MP",
    "storage": "1TB",
    "ups": true
  }
}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| includeBreakdown | string | `"true"` to include per-option price deltas in response. |

**Response (200 OK):**
```json
{
  "success": true,
  "price": 18999.50,
  "breakdown": [
    { "key": "camera_count", "label": "Number of cameras", "delta": 3000 },
    { "key": "camera_type", "label": "Camera type", "delta": 500 }
  ]
}
```

**400 Bad Request** – Invalid customization (e.g. invalid option values):
```json
{
  "success": false,
  "error": "Invalid customization: ..."
}
```

---

#### GET /api/v1/packages/:id/options

List customization options for a package.

**Permissions**: Public

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "opt_xxx",
      "packageId": "pkg_xxx",
      "key": "camera_count",
      "label": "Number of cameras",
      "type": "NUMBER",
      "config": { "min": 2, "max": 8, "step": 1, "default": 2, "pricePerUnit": 1500 },
      "sortOrder": 0,
      "isRequired": true,
      "isActive": true
    }
  ]
}
```

**Option types and config:**

- **NUMBER**: `config`: `{ min, max, step?, default?, pricePerUnit? }` – e.g. camera count; price delta = (value - base) × pricePerUnit.
- **SELECT**: `config`: `{ options: [ { value, label, priceDelta? } ], default? }` – e.g. camera type.
- **BOOLEAN**: `config`: `{ priceWhenTrue? }` – e.g. UPS add-on.

---

#### POST /api/v1/packages

Create a package (admin).

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Package name (e.g. "Starter Setup"). |
| slug | string | No | Auto-generated from name if omitted. |
| description | string | No | Description text. |
| basePrice | number | Yes | Base price (decimal). |
| defaultFeatures | array | No | Array of feature strings. Default `[]`. |
| isPopular | boolean | No | Default false. |
| isActive | boolean | No | Default true. |
| taxonomyId | string | No | Taxonomy node ID (segment/subcategory). |
| categoryId | string | No | Optional Category ID from main catalog. |

**Response (201 Created):** `{ "success": true, "data": <package with taxonomy, category, options> }`

---

#### PUT /api/v1/packages/:id

Update a package (admin).

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):** Same fields as POST (all optional).

**Response (200 OK):** `{ "success": true, "data": <updated package> }`

---

#### DELETE /api/v1/packages/:id

Deactivate a package (soft delete: sets `isActive: false`).

**Permissions**: Admin (Bearer token required)

**Response (200 OK):** `{ "success": true, "message": "Package deactivated" }`

---

#### POST /api/v1/packages/:id/options

Create a package option (admin).

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | string | Yes | Option key (e.g. `camera_count`, `camera_type`, `storage`, `ups`). |
| label | string | No | Display label; defaults to key. |
| type | string | Yes | One of: `NUMBER`, `SELECT`, `BOOLEAN`. |
| config | object | No | Schema depends on type (see GET options above). Default `{}`. |
| sortOrder | integer | No | Display order. Default 0. |
| isRequired | boolean | No | Default false. |

**Response (201 Created):** `{ "success": true, "data": <package option> }`

---

#### PUT /api/v1/packages/:id/options/:optionId

Update a package option (admin).

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):** Same as POST options (all optional). Can include `isActive`.

**Response (200 OK):** `{ "success": true, "data": <updated option> }`

---

#### DELETE /api/v1/packages/:id/options/:optionId

Delete a package option (admin).

**Permissions**: Admin (Bearer token required)

**Response (200 OK):** `{ "success": true, "message": "Option deleted" }`

---

### POST /api/v1/packages/selection

Package selection fallback (no customization)

Submit the selected package JSON from the frontend when you don't want to use the dynamic/customizable packages flow yet. The backend saves it as a lead and emails the logged-in user (and internal team if configured).

**Permissions**: Authenticated (Bearer token required)

**Request Body (application/json)**:
```json
{
  "category": "Small Homes",
  "name": "Starter Setup",
  "price": "12,999",
  "isPopular": false,
  "features": ["..."]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": { "id": "contact_submission_id", "createdAt": "..." },
  "message": "Package selection received. Our team will contact you shortly."
}
```

---

## 3. Shopping Cart

The cart can contain **product lines**, **service lines**, and **package lines** (see [Services](#31-services) and [Package Management](#21-package-management)). Checkout creates one order with one combined payment for all items. Package lines include a computed `lineTotal`; product/service lines use stored or variant price.

### GET /api/v1/cart/

Get current user's cart

Retrieve the authenticated user's shopping cart with all items. Each cart item is one of:

- **Product line**: `productId`, `variantId?`, `product`, `variant` – use `item.product` / `item.variant` for price.
- **Service line**: `serviceId`, `service` – use `item.service.price`.
- **Package line**: `packageId`, `packageCustomization`, `package` (with `options`, `taxonomy`) – use `item.lineTotal` (computed from package base price + option deltas).

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/cart/add

Add item to cart

Add a **product**, **service**, or **package** to the user's shopping cart. Send exactly one of `productId`, `serviceId`, or `packageId`.

**Permissions**: Authenticated (Bearer token required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | string | No* | Product ID (use with product lines). |
| variantId | string | No | Variant ID when adding a product variant. |
| serviceId | string | No* | Service ID (use with service lines). |
| packageId | string | No* | Package ID (use with package lines). |
| quantity | integer | Yes | Quantity; min 1. Default 1. |
| customization | object | No | For **package** lines only. Key-value map of option keys to chosen values (e.g. `camera_count`, `camera_type`, `storage`, `ups`). Must be valid per package options. |

*Exactly one of `productId`, `serviceId`, or `packageId` is required.

**Examples:**

Add a product (optional variant):
```json
{ "productId": "prod_abc", "variantId": "var_xyz", "quantity": 2 }
```

Add a service:
```json
{ "serviceId": "svc_123", "quantity": 1 }
```

Add a package with customization:
```json
{
  "packageId": "pkg_xxx",
  "quantity": 1,
  "customization": {
    "camera_count": 4,
    "camera_type": "5MP",
    "storage": "1TB",
    "ups": true
  }
}
```

**Response (200 OK):** `{ "success": true, "data": <cart> }` – cart includes `items` with `product`, `variant`, `service`, or `package` and computed `lineTotal` for each item.

**Error Responses:**

**400 Bad Request** – Missing or invalid body (e.g. none or multiple of productId/serviceId/packageId)
```json
{ "success": false, "error": "productId, serviceId, or packageId is required" }
```

**400 Bad Request** – Invalid package customization
```json
{ "success": false, "error": "Invalid customization", "errors": ["Missing required option: ...", "..."] }
```

**404 Not Found** - Product or service not found
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** – Product, service, or package not found
```json
{ "success": false, "error": "Product not found" }
```
or
```json
{ "success": false, "error": "Service not found" }
```
or
```json
{ "success": false, "error": "Package not found" }
```

**422 Unprocessable Entity** – Insufficient stock (product only)
```json
{ "success": false, "error": "Insufficient stock available" }
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/cart/update/:itemId

Update cart item quantity and, for **package** items, optionally update customization.

**Permissions**: Authenticated (Bearer token required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quantity | integer | Yes | New quantity; min 1. |
| customization | object | No | For **package** items only. New option key-value map; validated against package options. |

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/cart/remove/:itemId

Insufficient stock available

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/cart/clear

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/cart/calculate

Insufficient stock available

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 3.1 Services

Public service catalog (Consulting, Repair, Installation). Services can be standalone, linked to a product (`productId`), or linked to a category (`categoryId`) (e.g. "Installation for Cameras" – price per unit; customer adds with quantity). No authentication required for list/get.

### GET /api/v1/services

List services with optional filters.

**Permissions**: Public

**Query Parameters:**
- `page` (integer, optional): Page number. Default 1.
- `limit` (integer, optional): Items per page. Default 20.
- `type` (string, optional): Filter by service type. One of: `CONSULTING`, `REPAIR`, `INSTALLATION`.
- `productId` (string, optional): Return only services linked to this product.
- `categoryId` (string, optional): Return only services linked to this category (e.g. services for "Cameras").
- `isActive` (string, optional): `"true"` or `"false"`. Default `"true"` (only active services).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "Home Installation",
      "slug": "home-installation",
      "description": "Professional installation service",
      "price": "99.00",
      "type": "INSTALLATION",
      "productId": null,
      "durationMinutes": 60,
      "isActive": true,
      "image": null,
      "metadata": null,
      "createdAt": "...",
      "updatedAt": "...",
      "product": null
    },
    {
      "id": "cly...",
      "name": "TV Installation",
      "slug": "tv-installation",
      "price": "49.00",
      "type": "INSTALLATION",
      "productId": "prod_abc",
      "categoryId": null,
      "image": null,
      "product": { "id": "prod_abc", "name": "Smart TV", "slug": "smart-tv" },
      "category": null
    },
    {
      "id": "clz...",
      "name": "Camera Installation",
      "slug": "camera-installation",
      "price": "25.00",
      "type": "INSTALLATION",
      "productId": null,
      "categoryId": "cat_cameras",
      "image": "https://example.com/camera-install.jpg",
      "product": null,
      "category": { "id": "cat_cameras", "name": "Cameras", "slug": "cameras" }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "pages": 1 }
}
```

Response items include `product` and/or `category` when the service is scoped to a product or category. Service objects may include an optional `image` (string, URL or path) when the service has an image.

**404 Not Found** - Not used for list.

---

### GET /api/v1/services/:id

Get a single service by ID.

**Permissions**: Public

**Path Parameters:**
- `id` (string, **required**): Service ID.

**Response (200 OK):** `{ "success": true, "data": <service> }` with same shape as list items, including `product` and/or `category` when the service is linked to a product or category.

**404 Not Found** - Service not found
```json
{ "success": false, "error": "Service not found" }
```

---

## 4. Orders

Order management endpoints. All require authentication (Bearer token). Orders can contain **product lines**, **service lines**, and **package lines** (combined checkout). One order has one total and one payment for all lines. Order item responses include `product`, `variant`, `service`, or `package` and, for package items, `packageCustomizationSnapshot`.

---

### POST /api/v1/orders/

Create order from cart

Create a new order from the user's current shopping cart. The cart may contain **products**, **services**, and/or **packages**. One order is created with one combined total and one payment for all lines. Stock is decremented only for product/variant items; service and package lines do not affect inventory. Order items include: `productId`/`variantId` for product lines, `serviceId` for service lines, and `packageId` with `packageCustomizationSnapshot` for package lines (price is computed at checkout and stored on the order item). The authenticated user's **email must be verified** (`emailVerified === true`); otherwise the API returns 403.

**Permissions**: Authenticated (Bearer token required); user must have verified email

**Request Body (application/json):**
```json
{
  "shippingAddressId": "addr_id",
  "billingAddressId": "addr_id_optional",
  "couponCode": "SAVE10",
  "paymentMethod": "cod"
}
```

- `shippingAddressId` (string, **required**): ID of the user's saved address to use for shipping.
- `billingAddressId` (string, optional): ID of the billing address. If omitted, shipping address is used.
- `couponCode` (string, optional): Coupon code to apply for discount.
- `paymentMethod` (string, optional): Payment method/gateway. Allowed values: `cod`, `cash_on_delivery`, `stripe`, `razorpay`, `paypal`, `upi`, `phonepe`, `gpay`, `paytm`, `payu`, `bank_transfer`, `crypto`, or the enum value in uppercase (e.g. `COD`, `STRIPE`). Default if omitted: COD.

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "CREATED",
    "total": 139,
    "subtotal": 139,
    "tax": 0,
    "shipping": 0,
    "discount": 0,
    "currency": "USD",
    "shippingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
    "billingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:01:52.787Z",
    "items": [
      {
        "id": "item_id",
        "productId": "prod_id",
        "variantId": null,
        "serviceId": null,
        "quantity": 1,
        "price": 90,
        "total": 90,
        "product": { "id": "prod_id", "name": "Product Name", "images": [] },
        "variant": null,
        "service": null
      },
      {
        "id": "item_id_2",
        "productId": null,
        "variantId": null,
        "serviceId": "svc_id",
        "quantity": 1,
        "price": 49,
        "total": 49,
        "product": null,
        "variant": null,
        "service": { "id": "svc_id", "name": "Installation", "type": "INSTALLATION", "price": "49.00" }
      }
    ],
    "payments": [
      {
        "id": "pay_cuid",
        "gateway": "COD",
        "paymentMethod": "cod",
        "amount": 139,
        "currency": "USD",
        "status": "PENDING",
        "createdAt": "2026-02-11T02:01:52.787Z"
      }
    ]
  }
}
```

Order items may be **product** lines (`productId`, `product`, `variant`) or **service** lines (`serviceId`, `service`). One payment covers the full order total.

**Error Responses:**

**400 Bad Request** - Cart empty, invalid address, or insufficient stock
```json
{
  "success": false,
  "error": "Cart is empty"
}
```
or
```json
{
  "success": false,
  "error": "Invalid address"
}
```
or
```json
{
  "success": false,
  "error": "Insufficient stock for one or more items"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Email not verified
```json
{
  "success": false,
  "error": "Email must be verified to place an order."
}
```

**404 Not Found** - Cart or address not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/orders/

Get user's orders

Retrieve a paginated list of the authenticated user's orders. Each order includes items that may be **product** lines (`productId`, `product`, `variant`) or **service** lines (`serviceId`, `service`). Payments show gateway and status for the single combined payment per order.

**Permissions**: Authenticated (Bearer token required)

**Query Parameters:**
- `page` (integer, optional): Page number. Default 1.
- `limit` (integer, optional): Items per page. Default 20.
- `status` (string, optional): Filter by order status (e.g. CREATED, PAID, DELIVERED, CANCELLED).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmlhdwfwz000834y2hdo54gtr",
      "userId": "cmje71jzx00005gwn4evdcx6n",
      "orderNumber": "ORD-1770775312785-75442D6C",
      "status": "CREATED",
      "total": 90,
      "subtotal": 90,
      "tax": 0,
      "shipping": 0,
      "discount": 0,
      "currency": "USD",
      "shippingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
      "billingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
      "createdAt": "2026-02-11T02:01:52.787Z",
      "updatedAt": "2026-02-11T02:01:52.787Z",
      "items": [
        {
          "id": "item_id",
          "productId": "prod_id",
          "variantId": null,
          "serviceId": null,
          "quantity": 1,
          "price": 90,
          "total": 90,
          "product": { "id": "prod_id", "name": "Product Name", "images": [] },
          "variant": null,
          "service": null
        }
      ],
      "payments": [
        {
          "id": "pay_id",
          "status": "SUCCEEDED",
          "amount": 90,
          "gateway": "STRIPE",
          "paymentMethod": "card",
          "currency": "USD",
          "createdAt": "2026-02-11T02:05:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

Payment method comes from each item in `data[].payments`: `gateway` (e.g. STRIPE, COD, RAZORPAY) and `paymentMethod` (e.g. card, upi). Orders with no completed payment may have an empty `payments` array.

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/orders/:id

Get order details

Retrieve detailed information for a specific order. The order must belong to the authenticated user. Includes items (with product and variant), payments (with gateway, paymentMethod, and transactions), tracking, returns, notes, and state history.

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "CREATED",
    "total": 90,
    "subtotal": 90,
    "tax": 0,
    "shipping": 0,
    "discount": 0,
    "currency": "USD",
    "shippingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
    "billingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:01:52.787Z",
    "items": [
      {
        "id": "item_id",
        "productId": "prod_id",
        "variantId": null,
        "quantity": 1,
        "price": 90,
        "total": 90,
        "product": { "id": "prod_id", "name": "Product Name", "images": [] },
        "variant": null
      }
    ],
    "payments": [
      {
        "id": "pay_id",
        "orderId": "cmlhdwfwz000834y2hdo54gtr",
        "gateway": "STRIPE",
        "amount": 90,
        "currency": "USD",
        "status": "SUCCEEDED",
        "paymentMethod": "card",
        "transactionId": "txn_xxx",
        "createdAt": "2026-02-11T02:05:00.000Z",
        "transactions": []
      }
    ],
    "tracking": [],
    "returns": [],
    "notes": [],
    "stateHistory": [
      {
        "id": "hist_id",
        "orderId": "cmlhdwfwz000834y2hdo54gtr",
        "fromState": "CREATED",
        "toState": "PAID",
        "reason": null,
        "userId": "admin_user_id",
        "createdAt": "2026-02-11T02:05:00.000Z",
        "user": { "id": "admin_user_id", "firstName": "Admin", "lastName": "User", "email": "admin@example.com" }
      }
    ]
  }
}
```

Payment method is in `data.payments[].gateway` and `data.payments[].paymentMethod`. Payment `data.payments[].status` is `PENDING` until payment is completed; it becomes `SUCCEEDED` when the order is transitioned to PAID (e.g. via POST order-state/:orderId/transition for COD, or after gateway confirmation for online payment).

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Order belongs to another user
```json
{
  "success": false,
  "error": "Order not found"
}
```

**404 Not Found** - Order does not exist or does not belong to the user
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/orders/:id/cancel

Cancel order

Cancel an order that is in CREATED or PAYMENT_PENDING status. The order must belong to the authenticated user.

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Request Body:** Optional. No body required; the controller does not use request body for cancellation.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "CANCELLED",
    "total": 90,
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:10:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Order cannot be cancelled (e.g. already paid or shipped)
```json
{
  "success": false,
  "error": "Order cannot be cancelled"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Order not found or not owned by user
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/orders/:id/return

Request return

Request a return for an order in DELIVERED or COMPLETED status. The order must belong to the authenticated user.

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Request Body (application/json):**
```json
{
  "reason": "Defective product",
  "items": ["order_item_id_1", "order_item_id_2"]
}
```

- `reason` (string, **required**): Reason for the return.
- `items` (array of strings, optional): Order item IDs to return. If omitted, the entire order may be considered for return (implementation-dependent).

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "return_id",
    "orderId": "cmlhdwfwz000834y2hdo54gtr",
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "reason": "Defective product",
    "status": "PENDING",
    "items": ["order_item_id_1"],
    "refundAmount": null,
    "createdAt": "2026-02-11T02:15:00.000Z",
    "updatedAt": "2026-02-11T02:15:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Order not eligible for return (e.g. not DELIVERED or COMPLETED)
```json
{
  "success": false,
  "error": "Order cannot be returned"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Order not found or not owned by user
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/orders/:id/tracking

Get order tracking

Retrieve tracking information for an order. The order must belong to the authenticated user.

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "track_id",
      "orderId": "cmlhdwfwz000834y2hdo54gtr",
      "carrier": "DHL",
      "trackingNumber": "1234567890",
      "status": "in_transit",
      "events": [],
      "estimatedDelivery": "2026-02-15T00:00:00.000Z",
      "createdAt": "2026-02-11T02:05:00.000Z",
      "updatedAt": "2026-02-11T02:05:00.000Z"
    }
  ]
}
```

Tracking entries are ordered by most recent first. If the order has no tracking yet, `data` is an empty array.

**Error Responses:**

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Order not found or not owned by user
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 5. Payments

### GET /api/v1/payments/gateways

Get available payment gateways

Retrieve list of available payment gateways and their supported methods. Each gateway includes `integrationStatus`: `available` (fully integrated, e.g. PayU) or `coming_soon` (not yet available for payments).

**Permissions**: Public

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "gateway_id",
      "name": "PayU",
      "type": "PAYU",
      "supportedCurrencies": ["INR"],
      "supportedMethods": ["card", "upi", "netbanking", "wallet"],
      "integrationStatus": "available"
    },
    {
      "id": "gateway_id_2",
      "name": "Stripe",
      "type": "STRIPE",
      "supportedCurrencies": ["USD", "EUR", "GBP"],
      "supportedMethods": ["card", "digital_wallet"],
      "integrationStatus": "coming_soon"
    }
  ]
}
```

- `integrationStatus`: `"available"` – gateway is fully integrated and can be used for payments; `"coming_soon"` – listed but not yet available.

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/payments/create-intent

Create payment intent

Create a payment intent for processing a payment. For **PayU** (`gateway: "PAYU"`), the response returns `redirectUrl` and `formData` so the client can POST a form to PayU's hosted checkout; after payment, PayU redirects the user to your callback URL and then to your success/failure frontend URLs.

**Permissions**: Authenticated (Bearer token required)

**Request Body:** `orderId` (string, required), `gateway` (string, required, e.g. `PAYU`). For PayU, optional: `successRedirectUrl` (string), `failureRedirectUrl` (string) – if provided, the backend stores them and uses them when redirecting after the PayU callback so the user lands on your chosen order page.

**Validation:** The order must belong to the authenticated user, have status CREATED or PAYMENT_PENDING, have at least one item, have a total greater than zero, and must not already have a succeeded payment. If any of these fail, the API returns **400**. For PayU, `successRedirectUrl` and `failureRedirectUrl` (if provided) must have an **origin** (scheme + host) allowed by the server; allowed origins are taken from `FRONTEND_URL` and optional env `ALLOWED_REDIRECT_ORIGINS` (comma-separated). Invalid redirect URLs are rejected with **400** so open-redirect abuse is prevented.

**Response (200 OK) – PayU:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_cuid",
    "redirectUrl": "https://test.payu.in/_payment",
    "formData": {
      "key": "merchant_key",
      "txnid": "payment_cuid",
      "amount": "100.00",
      "productinfo": "Order ORD-123",
      "firstname": "Customer",
      "email": "customer@example.com",
      "phone": "9999999999",
      "surl": "https://your-api.com/api/v1/payments/payu/callback",
      "furl": "https://your-api.com/api/v1/payments/payu/callback",
      "hash": "sha512_hex_digest",
      "udf1": "order_id"
    },
    "message": "Submit form to redirectUrl to complete payment"
  }
}
```
Client must POST `formData` as form fields to `redirectUrl` (same-origin form submit or redirect with form), then PayU will redirect the user back to your callback; the backend verifies the response hash and redirects the user to your frontend success/failure URL.

**Response (200 OK) – Other gateways (when available):** Returns `paymentId`, `clientSecret` or gateway-specific fields.

**Error Responses:**

**400 Bad Request** - Validation error, or order not payable, or redirect URL not allowed. Examples: `"Order has no items and cannot be paid"`, `"Order total must be greater than zero"`, `"Order is already paid"`, `"successRedirectUrl must be from an allowed origin (FRONTEND_URL or ALLOWED_REDIRECT_ORIGINS)"`, `"failureRedirectUrl must be from an allowed origin (FRONTEND_URL or ALLOWED_REDIRECT_ORIGINS)"`.
```json
{
  "success": false,
  "error": "Order has no items and cannot be paid"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**422** - Payment gateway coming soon (e.g. Stripe, Razorpay)
```json
{
  "success": false,
  "error": "Payment gateway STRIPE is coming soon"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/payments/payu/callback

PayU payment callback (surl/furl)

Public endpoint used by PayU to POST the payment result (form-urlencoded) after the user completes or abandons payment. The backend verifies the response hash, updates the payment and order status, then redirects the user (302) to your frontend success or failure URL with query params `orderId` and `status=success|failure`. Do not call this endpoint yourself; configure it as the success and failure URL (surl/furl) when creating a PayU payment intent.

**Permissions**: Public (no auth). PayU server-to-client.

**Request:** PayU POSTs `application/x-www-form-urlencoded` with fields including `status`, `txnid`, `mihpayid`, `hash`, `email`, `firstname`, `productinfo`, `amount`, `udf1`, etc.

**Behaviour:**
- Hash is verified with PayU reverse-hash logic (`sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)`). If invalid, responds **400** and does not update any data.
- Payment is looked up by `transactionId === txnid`. If not found, redirects to failure URL with `reason=payment_not_found`.
- If `status === 'success'`: Payment is set to SUCCEEDED, Order status set to PAID, OrderStateHistory created. If failure: Payment set to FAILED.
- **Redirect (302)** to frontend URL. Only URLs whose **origin** is in the server allowlist (`FRONTEND_URL` and optional `ALLOWED_REDIRECT_ORIGINS`) are used for per-payment, gateway config, or env redirect URLs; others are skipped so open-redirect abuse is prevented. Resolution order: (1) **Per-payment URLs** (if allowed); (2) **Gateway config** (if allowed); (3) **Env** (if allowed); (4) **Backend-built order page** – `FRONTEND_URL` + `PAYU_ORDER_PATH` + `orderId` + `?status=...`; (5) `FRONTEND_URL` or `/` as last resort. Query `orderId` and `status` are always appended.

**Response:** 302 redirect to the resolved frontend URL, or 400 if hash invalid, or 502 if PayU gateway not configured.

---

### POST /api/v1/payments/confirm

Order ID to create payment for

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/payments/:orderId

Validation error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/payments/:orderId/history

Validation error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 6. Inventory

### GET /api/v1/inventory/

Get inventory list

Retrieve inventory list with optional filters (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/inventory/:productId

Update inventory stock

Update stock quantity for a product (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/inventory/:productId/movements

Product ID

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 7. Reviews & Ratings

### GET /api/v1/reviews/product/:productId

Get product reviews

Retrieve reviews for a specific product

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/reviews/

Create product review

Create a new review for a product

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/reviews/:id

Rating (1-5)

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/reviews/:id

Validation error or user already reviewed this product

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/reviews/:id/helpful

Validation error or user already reviewed this product

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/reviews/:id/report

Rating (1-5)

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 8. Wishlist

### GET /api/v1/wishlist/

Get user's wishlist

Retrieve the authenticated user's wishlist with all items

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/wishlist/add

Add product to wishlist

Add a product to the user's wishlist

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/wishlist/remove/:productId

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/wishlist/check/:productId

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 9. Coupons & Discounts

### GET /api/v1/coupons/

Get available coupons

Retrieve list of available coupons

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/coupons/:code

Get coupon by code

Retrieve coupon details by code

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/coupons/validate

Validate coupon code

Validate a coupon code and calculate discount

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/coupons/my-coupons

Coupon expired, minimum purchase not met, or usage limit exceeded

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 10. Shipping

### GET /api/v1/shipping/methods

Get available shipping methods

Retrieve list of available shipping methods

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/calculate

Calculate shipping cost

Calculate shipping cost for items to a specific address

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 11. Tax

### POST /api/v1/tax/calculate

Calculate tax for order

Calculate tax amount for items based on shipping address

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/tax/rates

Get tax rates

Retrieve tax rates for a specific location

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 12. Notifications

### GET /api/v1/notifications/

Get user notifications

Retrieve paginated list of user notifications

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/notifications/:id/read

Mark notification as read

Mark a specific notification as read

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/notifications/read-all

Mark all notifications as read

Mark all user notifications as read

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/notifications/:id

Mark all notifications as read

Mark all user notifications as read

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/notifications/unread-count

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/notifications/preferences

Notification not found

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 13. Search

### GET /api/v1/search/advanced

Advanced search with filters

Search products with multiple filters and sorting options

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/search/recommendations

Get product recommendations

Get personalized product recommendations (requires auth for personalized results)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/search/recently-viewed

Get recently viewed products

Retrieve products recently viewed by the user

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/search/saved

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/search/saved

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/search/saved/:id

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 14. Analytics

### GET /api/v1/analytics/dashboard

Get analytics dashboard data

Retrieve comprehensive analytics dashboard data including revenue, orders, and customers

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/clv/:userId

Calculate customer lifetime value

Calculate customer lifetime value (CLV) for a specific user

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/cohort

Unauthorized - No token provided or invalid token

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/funnel

Unauthorized - No token provided or invalid token

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/segments

Unauthorized - No token provided or invalid token

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 15. Support

### GET /api/v1/support/faqs

Get FAQs

Retrieve frequently asked questions

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/support/contact

Submit contact form (public)

Submit a contact form. No authentication required. If the client sends a valid Bearer token, the submission is linked to that user. Use this for the public "Contact us" page.

**Permissions**: Public (no auth required). Optional Bearer token to link submission to user.

**Request Body:**
- `name` (string, required)
- `email` (string, required)
- `message` (string, required)
- `phone` (string, optional)
- `freeSiteVisit` (boolean, optional)

**Response (201 Created):**
```json
{
  "success": true,
  "data": { "id": "cuid", "createdAt": "2026-01-01T00:00:00.000Z" },
  "message": "Contact submission received"
}
```

**Error Responses:**

**400 Bad Request** - Name, email, or message missing
```json
{
  "success": false,
  "error": "Name is required"
}
```

---

### POST /api/v1/support/tickets

Create support ticket

Create a new support ticket

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/support/tickets

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/support/tickets/:id

Validation error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/support/tickets/:id/messages

Validation error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/support/tickets/:id/close

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 16. Loyalty & Rewards

### GET /api/v1/loyalty/points

Get user loyalty points

Retrieve the user's current loyalty points balance and tier information

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/loyalty/tiers

Get loyalty tiers

Retrieve available loyalty program tiers

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/loyalty/rewards

Get available rewards

Retrieve list of available rewards for redemption

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/loyalty/rewards/redeem

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/loyalty/referral

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/loyalty/referral/apply

Rewards retrieved successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 17. Marketing

### GET /api/v1/marketing/flash-sales

Get active flash sales

Retrieve list of currently active flash sales

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/marketing/deals

Get deals

Retrieve available deals and promotions

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/marketing/bundles

Get product bundles

Retrieve product bundles and package deals

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/marketing/recommendations

Get product recommendations

Retrieve personalized product recommendations

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/marketing/abandoned-carts

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 18. Wallet & Financial

### GET /api/v1/wallet/

Get wallet balance

Retrieve the user's wallet balance and transaction history

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/wallet/add

Add funds to wallet

Deposit funds to the user's wallet

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/wallet/store-credits

Payment processing failed

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/wallet/invoices

Unauthorized - No token provided or invalid token

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/wallet/invoices/:id

Validation error or insufficient funds

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/wallet/invoices/:id/download

Unauthorized - No token provided or invalid token

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 19. Vendor/Marketplace

### POST /api/v1/vendor/register

Register as vendor

Register to become a vendor on the marketplace

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/vendor/dashboard

Get vendor dashboard

Retrieve vendor dashboard statistics (Vendor only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/vendor/products

Get vendor products

Retrieve products listed by the vendor (Vendor only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/vendor/products

Retrieve products listed by the vendor (Vendor only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/vendor/payouts

Unauthorized

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 20. Gift Features

### POST /api/v1/gifts/registry

Create gift registry

Create a new gift registry for events like weddings, birthdays, etc.

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/gifts/registry

Get gift registries

Retrieve all gift registries for the authenticated user

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/gifts/registry/items

Unauthorized - No token provided or invalid token

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/gifts/send

Unauthorized - No token provided or invalid token

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/gifts/schedule

Unauthorized - No token provided or invalid token

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/gifts/track/:trackingNumber

Add item to gift registry

Add a product to a gift registry

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 21. Currency Management

Supported currencies and their symbols are defined by the backend and managed by admins. The frontend should call `GET /api/v1/currencies/` to load the list for the header selector and use each item’s `symbol` for display. Admin manages which currencies exist and their symbols/default via the Admin Currency Settings endpoints (section 21.1). Optionally, use a small client-side symbol fallback map only when the API is unavailable or before the list is loaded.

---

### GET /api/v1/currencies/

Get available currencies

Retrieve list of **active** currencies with exchange rates and symbols. Use this for the storefront currency selector and for formatting (symbol = `data[].symbol`).

**Permissions**: Public

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "exchangeRate": 1,
      "isActive": true,
      "isDefault": true,
      "updatedAt": "2025-02-03T10:00:00.000Z"
    },
    {
      "id": "clx1234567891",
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "exchangeRate": 0.92,
      "isActive": true,
      "isDefault": false,
      "updatedAt": "2025-02-03T10:00:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Active currencies only; each has `id`, `code`, `name`, `symbol`, `exchangeRate`, `isActive`, `isDefault`, `updatedAt`

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/currencies/default

Get default currency

Retrieve the store default currency (the one with `isDefault: true` and active). Use this to know the store’s default without parsing the list.

**Permissions**: Public

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "exchangeRate": 1,
    "isActive": true,
    "isDefault": true,
    "updatedAt": "2025-02-03T10:00:00.000Z"
  }
}
```

**404 Not Found** - Default currency not configured
```json
{
  "success": false,
  "error": "Default currency not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/currencies/:code

Get currency by code

Retrieve details for a specific currency by its 3-letter code (e.g. USD, EUR).

**Permissions**: Public

**Parameters:**
- `code` (path, required): Currency code (e.g. USD, EUR)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "exchangeRate": 1,
    "isActive": true,
    "isDefault": true,
    "updatedAt": "2025-02-03T10:00:00.000Z"
  }
}
```

**404 Not Found** - Currency not found
```json
{
  "success": false,
  "error": "Currency not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/currencies/convert

Convert currency amount

Convert an amount from one currency to another using stored exchange rates.

**Permissions**: Public

**Query Parameters:**
- `from` (required): Source currency code (e.g. USD)
- `to` (required): Target currency code (e.g. EUR)
- `amount` (required): Numeric amount to convert

**Example:** `GET /api/v1/currencies/convert?from=USD&to=EUR&amount=100`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "from": {
      "code": "USD",
      "amount": 100
    },
    "to": {
      "code": "EUR",
      "amount": 92
    },
    "rate": 0.92
  }
}
```

**400 Bad Request** - Invalid currency codes or missing params
```json
{
  "success": false,
  "error": "Invalid currency codes"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/currencies/rates

Update exchange rates

Bulk-update exchange rates for existing currencies. Rates are relative to the base (e.g. USD = 1). Admin only.

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "rates": {
    "USD": 1,
    "EUR": 0.92,
    "GBP": 0.79,
    "INR": 83.12
  }
}
```

**Request Body Fields:**
- `rates` (object, required): Map of currency code to exchange rate (positive number). Only codes that exist in the database are updated.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Exchange rates updated"
}
```

**401 Unauthorized** - No token or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Not admin
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 21.1 Admin Currency Settings

Admin endpoints for managing which currencies are supported, their names, symbols, default, and active status. Use these in the admin panel “Currencies” settings screen.

---

### GET /api/v1/admin/currencies

List all currencies (admin)

Retrieve all currencies including inactive. Optional filter `?activeOnly=true` returns only active currencies.

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `activeOnly` (optional): If `"true"`, return only active currencies

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "exchangeRate": 1,
      "isActive": true,
      "isDefault": true,
      "updatedAt": "2025-02-03T10:00:00.000Z"
    }
  ]
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/admin/currencies

Create currency

Add a new currency with code, name, symbol, and optional exchange rate, default, and active status. If `isDefault` is true, any existing default is cleared.

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "code": "EUR",
  "name": "Euro",
  "symbol": "€",
  "exchangeRate": 0.92,
  "isDefault": false,
  "isActive": true
}
```

**Request Body Fields:**
- `code` (string, required): 3-letter ISO code (uppercase), e.g. EUR, GBP
- `name` (string, required): Display name, e.g. "Euro"
- `symbol` (string, required): Symbol for display, e.g. "€", "$"
- `exchangeRate` (number, optional): Default 1. Must be positive
- `isDefault` (boolean, optional): Default false. Only one currency can be default
- `isActive` (boolean, optional): Default true

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567891",
    "code": "EUR",
    "name": "Euro",
    "symbol": "€",
    "exchangeRate": 0.92,
    "isActive": true,
    "isDefault": false,
    "updatedAt": "2025-02-03T10:00:00.000Z"
  }
}
```

**400 Bad Request** - Validation error (invalid code, empty name/symbol, invalid rate)
```json
{
  "success": false,
  "error": "Currency code must be exactly 3 uppercase letters (e.g. USD, EUR)"
}
```

**409 Conflict** - Code already exists
```json
{
  "success": false,
  "error": "Currency with code EUR already exists"
}
```

**401 Unauthorized / 403 Forbidden / 500 Internal Server Error** - Same as other admin endpoints

---

### GET /api/v1/admin/currencies/:code

Get currency by code (admin)

Retrieve a single currency by code.

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `code` (path, required): Currency code (e.g. USD, EUR)

**Response (200 OK):** Same shape as single-currency response in section 21 (success, data with id, code, name, symbol, exchangeRate, isActive, isDefault, updatedAt).

**404 Not Found**
```json
{
  "success": false,
  "error": "Currency not found"
}
```

**401 / 403 / 500** - Same as other admin endpoints

---

### PUT /api/v1/admin/currencies/:code

Update currency

Update name, symbol, exchangeRate, isDefault, or isActive. All body fields are optional. If isDefault is set to true, other currencies are set to non-default.

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `code` (path, required): Currency code to update

**Request Body:** All fields optional
```json
{
  "name": "Euro",
  "symbol": "€",
  "exchangeRate": 0.93,
  "isDefault": false,
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567891",
    "code": "EUR",
    "name": "Euro",
    "symbol": "€",
    "exchangeRate": 0.93,
    "isActive": true,
    "isDefault": false,
    "updatedAt": "2025-02-03T11:00:00.000Z"
  }
}
```

**400 Bad Request** - Validation (e.g. empty name/symbol, non-positive rate)
**404 Not Found** - Currency not found
**401 / 403 / 500** - Same as other admin endpoints

---

### DELETE /api/v1/admin/currencies/:code

Deactivate currency

Soft-delete by setting isActive to false. Cannot delete the default currency; set another as default first.

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `code` (path, required): Currency code to deactivate

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Currency deactivated successfully"
}
```

**400 Bad Request** - Cannot delete default currency
```json
{
  "success": false,
  "error": "Cannot delete the default currency. Set another currency as default first."
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Currency not found"
}
```

**401 / 403 / 500** - Same as other admin endpoints

---

## 22. Language & Translation

### GET /api/v1/languages/

Get available languages

Retrieve list of available languages

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/languages/:code

Get language by code

Retrieve details for a specific language

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/languages/translations

Get translations

Retrieve translations for the current or specified language

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/languages/translations

Internal server error

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 23. Admin

### GET /api/v1/admin/dashboard

Get admin dashboard statistics

Retrieve comprehensive dashboard statistics including orders, revenue, users, and products

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/stats

Get detailed statistics

Retrieve detailed statistics for admin dashboard

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/users

Get all users

Retrieve paginated list of all users with optional filters (Admin only).

**Permissions**: Admin (Bearer token required)

**Query Parameters:**
- `page` (integer, optional): Page number. Default 1.
- `limit` (integer, optional): Items per page. Default 20.
- `search` (string, optional): Search by email, firstName, or lastName (case-insensitive).
- `role` (string, optional): Filter by role. Allowed values: `USER`, `ADMIN`, `VENDOR` (case-insensitive; API normalizes to uppercase).
- `isActive` (boolean, optional): Filter by active status. Use `true` or `false` string.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": null,
      "role": "USER",
      "emailVerified": true,
      "isActive": true,
      "tenantId": null,
      "createdAt": "2025-02-03T10:00:00.000Z",
      "updatedAt": "2025-02-03T10:00:00.000Z",
      "_count": {
        "orders": 5,
        "reviews": 2,
        "addresses": 1,
        "wishlist": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/users/:id

Forbidden - Insufficient permissions (not admin)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/admin/users

Statistics retrieved successfully

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/users/:id

Statistics retrieved successfully

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/admin/users/:id

Forbidden - Insufficient permissions (not admin)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/users/:id/verify

Unauthorized - No token provided or invalid token

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/users/:id/activate

Retrieve detailed statistics for admin dashboard

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/users/:id/role

Statistics retrieved successfully

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/admin/users/:id/reset-password

Statistics retrieved successfully

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/orders

Get all orders

Retrieve a paginated list of all orders with optional filters (Admin only). Each order includes user, items (with product and variant), and payments (with gateway, paymentMethod, and other payment details).

**Permissions**: Admin (Bearer token required)

**Query Parameters:**
- `page` (integer, optional): Page number. Default 1.
- `limit` (integer, optional): Items per page. Default 20.
- `status` (string, optional): Filter by order status (e.g. CREATED, PAID, DELIVERED, CANCELLED).
- `userId` (string, optional): Filter by user ID.
- `search` (string, optional): Search by order number or user email (case-insensitive).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmlhdwfwz000834y2hdo54gtr",
      "userId": "cmje71jzx00005gwn4evdcx6n",
      "orderNumber": "ORD-1770775312785-75442D6C",
      "status": "CREATED",
      "total": 90,
      "subtotal": 90,
      "tax": 0,
      "shipping": 0,
      "discount": 0,
      "currency": "USD",
      "shippingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
      "billingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
      "createdAt": "2026-02-11T02:01:52.787Z",
      "updatedAt": "2026-02-11T02:01:52.787Z",
      "user": {
        "id": "cmje71jzx00005gwn4evdcx6n",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "items": [
        {
          "id": "item_id",
          "productId": "prod_id",
          "variantId": null,
          "quantity": 1,
          "price": 90,
          "total": 90,
          "product": { "id": "prod_id", "name": "Product Name", "images": [] },
          "variant": null
        }
      ],
      "payments": [
        {
          "id": "pay_id",
          "status": "SUCCEEDED",
          "amount": 90,
          "gateway": "STRIPE",
          "paymentMethod": "card",
          "currency": "USD",
          "createdAt": "2026-02-11T02:05:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

**Error Responses:**

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/orders/:id

Get order by ID

Retrieve detailed information about a specific order (Admin only). Includes user, items (with product and variant), payments (with gateway, paymentMethod, transactions), tracking, returns, notes, and state history.

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "CREATED",
    "total": 90,
    "subtotal": 90,
    "tax": 0,
    "shipping": 0,
    "discount": 0,
    "currency": "USD",
    "shippingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
    "billingAddress": { "street": "5N", "city": "Delhi", "state": "Delhi", "zipCode": "110096", "country": "India" },
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:01:52.787Z",
    "user": { "id": "cmje71jzx00005gwn4evdcx6n", "email": "user@example.com", "firstName": "John", "lastName": "Doe" },
    "items": [
      {
        "id": "item_id",
        "productId": "prod_id",
        "variantId": null,
        "quantity": 1,
        "price": 90,
        "total": 90,
        "product": { "id": "prod_id", "name": "Product Name" },
        "variant": null
      }
    ],
    "payments": [
      {
        "id": "pay_id",
        "orderId": "cmlhdwfwz000834y2hdo54gtr",
        "gateway": "STRIPE",
        "amount": 90,
        "currency": "USD",
        "status": "SUCCEEDED",
        "paymentMethod": "card",
        "transactionId": "txn_xxx",
        "createdAt": "2026-02-11T02:05:00.000Z",
        "transactions": []
      }
    ],
    "tracking": [],
    "returns": [],
    "notes": [],
    "stateHistory": [
      {
        "id": "hist_id",
        "orderId": "cmlhdwfwz000834y2hdo54gtr",
        "fromState": "CREATED",
        "toState": "PAID",
        "reason": null,
        "userId": "admin_user_id",
        "createdAt": "2026-02-11T02:05:00.000Z",
        "user": { "id": "admin_user_id", "firstName": "Admin", "lastName": "User", "email": "admin@example.com" }
      }
    ]
  }
}
```

`stateHistory` is populated when state transitions are performed (e.g. via POST order-state/:orderId/transition). Each entry includes `fromState`, `toState`, `userId`, and `user` (for "Performed by"). Payment `status` is `PENDING` until the order is transitioned to PAID or payment is confirmed; then it becomes `SUCCEEDED`.

**Error Responses:**

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/orders/:id/status

Update order status

Update the status of an order (Admin only).

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Request Body (application/json):**
```json
{
  "status": "PAID"
}
```

- `status` (string, **required**): New order status (e.g. CREATED, PAYMENT_PENDING, PAID, PACKED, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED).

**Behavior:**
- When `status` is **PAID**, the backend also updates all payment records for that order to **SUCCEEDED**, so list and detail responses (which include `payments`) will show the Payment column as paid. Refetch the order (GET admin/orders/:id or GET orders/:id) to get updated `payments[].status`.
- The transition is recorded in order state history.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "PAID",
    "total": 90,
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:10:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**422 Unprocessable Entity** - Invalid status transition
```json
{
  "success": false,
  "error": "Invalid status transition"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/admin/orders/:id/cancel

Cancel order

Cancel an order (Admin only).

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Request Body (application/json, optional):**
```json
{
  "reason": "Customer request"
}
```

- `reason` (string, optional): Reason for cancellation (for records; controller may not persist it yet).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "CANCELLED",
    "total": 90,
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:15:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Order cannot be cancelled in current status
```json
{
  "success": false,
  "error": "Order cannot be cancelled"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/admin/orders/:id/refund

Process refund

Process a refund for an order (Admin only).

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `id` (path, required): Order ID

**Request Body (application/json):**
```json
{
  "amount": 90,
  "reason": "Customer return"
}
```

- `amount` (number, **required**): Refund amount. Must be a positive number and not exceed order total.
- `reason` (string, **required**): Reason for the refund.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Refund processed"
}
```

**Error Responses:**

**400 Bad Request** - Validation error (e.g. invalid amount)
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    { "field": "amount", "message": "\"amount\" must be a positive number" }
  ]
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**422 Unprocessable Entity** - Refund amount exceeds order total or order not eligible
```json
{
  "success": false,
  "error": "Refund amount cannot exceed order total"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 24. Admin Payment Gateway Management

Admin endpoints for managing payment gateways (PhonePe, GPay, Paytm, Stripe, Razorpay, etc.) with full CRUD operations and configuration management.

### POST /api/v1/admin/payment-gateways

Create payment gateway

Create and configure a new payment gateway (PhonePe, GPay, Paytm, etc.) - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "PhonePe",
  "type": "PHONEPE",
  "config": {
    "merchantId": "MERCHANT_ID",
    "merchantKey": "MERCHANT_KEY",
    "apiKey": "API_KEY",
    "environment": "production",
    "saltKey": "SALT_KEY",
    "saltIndex": 1
  },
  "webhookSecret": "webhook_secret_key",
  "supportedCurrencies": ["INR"],
  "supportedMethods": ["UPI", "WALLET", "NET_BANKING", "CREDIT_CARD", "DEBIT_CARD"],
  "isActive": true
}
```

**Request Body Fields:**
- `name` (string, **required**): Display name of the payment gateway
  - Example: `"PhonePe"`, `"GPay"`, `"Paytm"`
- `type` (string, **required**): Payment gateway type
  - Allowed values: `STRIPE`, `PAYU`, `PAYPAL`, `UPI`, `RAZORPAY`, `CRYPTO`, `BANK_TRANSFER`, `COD`, `PHONEPE`, `GPAY`, `PAYTM`
  - Example: `"PHONEPE"`
- `config` (object, **required**): Gateway-specific configuration
  - **PhonePe Configuration:**
    ```json
    {
      "merchantId": "string",
      "merchantKey": "string",
      "apiKey": "string",
      "environment": "production|sandbox",
      "saltKey": "string",
      "saltIndex": "number"
    }
    ```
  - **GPay Configuration:**
    ```json
    {
      "merchantId": "string",
      "merchantKey": "string",
      "apiKey": "string",
      "environment": "production|sandbox"
    }
    ```
  - **Paytm Configuration:**
    ```json
    {
      "merchantId": "string",
      "merchantKey": "string",
      "environment": "production|sandbox",
      "website": "string",
      "industryType": "string",
      "channelId": "string"
    }
    ```
  - **Stripe Configuration:**
    ```json
    {
      "secretKey": "string",
      "publishableKey": "string",
      "environment": "production|sandbox"
    }
    ```
  - **Razorpay Configuration:**
    ```json
    {
      "keyId": "string",
      "keySecret": "string",
      "environment": "production|sandbox"
    }
    ```
  - **PayU Configuration (Hosted Checkout):**
    ```json
    {
      "key": "string",
      "salt": "string",
      "environment": "production|sandbox",
      "successRedirectUrl": "optional frontend URL after success",
      "failureRedirectUrl": "optional frontend URL after failure"
    }
    ```
    Use PayU merchant key and salt from the PayU dashboard. Optional `successRedirectUrl` and `failureRedirectUrl` are used when redirecting the user after the callback; if omitted, env `PAYU_SUCCESS_REDIRECT_URL` and `PAYU_FAILURE_REDIRECT_URL` or `FRONTEND_URL` are used.
- `webhookSecret` (string, optional): Webhook secret for verifying webhook requests
  - Example: `"webhook_secret_key"`
- `supportedCurrencies` (array, optional): Supported currency codes
  - Example: `["INR", "USD"]`
- `supportedMethods` (array, optional): Supported payment methods
  - Example: `["UPI", "WALLET", "NET_BANKING", "CREDIT_CARD", "DEBIT_CARD"]`
- `isActive` (boolean, optional): Whether the gateway is active
  - Default: `false`
  - Example: `true`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "gateway_1234567890",
    "name": "PhonePe",
    "type": "PHONEPE",
    "isActive": true,
    "config": {
      "merchantId": "MERCHANT_ID",
      "merchantKey": "MERCH****KEY",
      "apiKey": "API_****KEY",
      "environment": "production",
      "saltKey": "SALT****KEY",
      "saltIndex": 1
    },
    "webhookSecret": "webhook_secret_key",
    "supportedCurrencies": ["INR"],
    "supportedMethods": ["UPI", "WALLET", "NET_BANKING", "CREDIT_CARD", "DEBIT_CARD"],
    "createdAt": "2025-12-31T19:00:00.000Z",
    "updatedAt": "2025-12-31T19:00:00.000Z"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Created payment gateway
  - `id` (string): Payment gateway ID
  - `name` (string): Gateway display name
  - `type` (string): Gateway type
  - `isActive` (boolean): Active status
  - `config` (object): Gateway configuration (sensitive fields masked)
  - `webhookSecret` (string): Webhook secret
  - `supportedCurrencies` (array): Supported currencies
  - `supportedMethods` (array): Supported payment methods
  - `createdAt` (string, ISO 8601): Creation timestamp
  - `updatedAt` (string, ISO 8601): Last update timestamp

**Error Responses:**

**400 Bad Request** - Invalid configuration or missing required fields
```json
{
  "success": false,
  "error": "Name and type are required"
}
```
or
```json
{
  "success": false,
  "error": "Missing required configuration field: merchantId"
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**409 Conflict** - Payment gateway type already exists
```json
{
  "success": false,
  "error": "Payment gateway with type PHONEPE already exists"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/payment-gateways/config-schema

Get config schema for a gateway type

Returns field names, types, required/optional, and optional labels and descriptions so the frontend can render gateway-specific config forms (e.g. PayU: key, salt, environment, successRedirectUrl, failureRedirectUrl) without hardcoding. Use this to show the correct inputs and help text for each payment gateway type.

**Permissions**: Admin (Bearer token required)

**Query Parameters:**
- `type` (string, **required**): Payment gateway type
  - Example: `PAYU`, `STRIPE`, `RAZORPAY`, `PHONEPE`, `GPAY`, `PAYTM`, `PAYPAL`

**Example Request:**
```
GET /api/v1/admin/payment-gateways/config-schema?type=PAYU
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "type": "PAYU",
    "fields": [
      {
        "name": "key",
        "type": "string",
        "required": true,
        "label": "Merchant key",
        "description": "PayU merchant key from dashboard (Developer Tools → API Keys)"
      },
      {
        "name": "salt",
        "type": "string",
        "required": true,
        "label": "Merchant salt",
        "description": "PayU salt from dashboard (Developer Tools → API Keys)"
      },
      {
        "name": "environment",
        "type": "enum",
        "required": false,
        "enum": ["production", "sandbox"],
        "label": "Environment",
        "description": "Use sandbox for test, production for live"
      },
      {
        "name": "successRedirectUrl",
        "type": "string",
        "required": false,
        "label": "Success redirect URL",
        "description": "Frontend URL to redirect after successful payment"
      },
      {
        "name": "failureRedirectUrl",
        "type": "string",
        "required": false,
        "label": "Failure redirect URL",
        "description": "Frontend URL to redirect after failed payment"
      }
    ]
  }
}
```

- **type**: Gateway type echoed back.
- **fields**: Array of field definitions. Each has **name**, **type** (`string`, `number`, or `enum`), **required** (boolean), and optionally **enum** (array of allowed values), **label**, **description**.

**Error Responses:**

**400 Bad Request** - Missing or unknown gateway type
```json
{
  "success": false,
  "error": "Query parameter \"type\" is required (e.g. PAYU, STRIPE, RAZORPAY)"
}
```
or
```json
{
  "success": false,
  "error": "No config schema for gateway type: XYZ"
}
```

**401 Unauthorized** / **403 Forbidden** - Same as other admin payment gateway endpoints.

---

### GET /api/v1/admin/payment-gateways

Get all payment gateways

Retrieve list of all payment gateways with optional filters - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
  - Example: `true`, `false`
- `type` (string, optional): Filter by gateway type
  - Allowed values: `STRIPE`, `PAYU`, `PAYPAL`, `UPI`, `RAZORPAY`, `CRYPTO`, `BANK_TRANSFER`, `COD`, `PHONEPE`, `GPAY`, `PAYTM`
  - Example: `"PHONEPE"`
- `page` (integer, optional): Page number
  - Default: `1`
  - Example: `1`
- `limit` (integer, optional): Items per page
  - Default: `20`
  - Example: `20`

**Example Request:**
```
GET /api/v1/admin/payment-gateways?isActive=true&type=PHONEPE&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "gateway_1234567890",
      "name": "PhonePe",
      "type": "PHONEPE",
      "isActive": true,
      "config": {
        "merchantId": "MERCHANT_ID",
        "merchantKey": "MERCH****KEY",
        "apiKey": "API_****KEY",
        "environment": "production"
      },
      "supportedCurrencies": ["INR"],
      "supportedMethods": ["UPI", "WALLET", "NET_BANKING"],
      "createdAt": "2025-12-31T19:00:00.000Z",
      "updatedAt": "2025-12-31T19:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of payment gateways (sensitive fields masked)
- `pagination` (object): Pagination information
  - `page` (integer): Current page number
  - `limit` (integer): Items per page
  - `total` (integer): Total number of gateways
  - `pages` (integer): Total number of pages

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/payment-gateways/:id

Get payment gateway details

Retrieve detailed information about a specific payment gateway - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Payment gateway ID
  - Example: `"gateway_1234567890"`

**Example Request:**
```
GET /api/v1/admin/payment-gateways/gateway_1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "gateway_1234567890",
    "name": "PhonePe",
    "type": "PHONEPE",
    "isActive": true,
    "config": {
      "merchantId": "MERCHANT_ID",
      "merchantKey": "MERCH****KEY",
      "apiKey": "API_****KEY",
      "environment": "production",
      "saltKey": "SALT****KEY",
      "saltIndex": 1
    },
    "webhookSecret": "webhook_secret_key",
    "supportedCurrencies": ["INR"],
    "supportedMethods": ["UPI", "WALLET", "NET_BANKING", "CREDIT_CARD", "DEBIT_CARD"],
    "createdAt": "2025-12-31T19:00:00.000Z",
    "updatedAt": "2025-12-31T19:00:00.000Z"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Payment gateway details (sensitive fields masked)
  - Same structure as POST response

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Payment gateway not found
```json
{
  "success": false,
  "error": "Payment gateway not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/payment-gateways/:id

Update payment gateway

Update configuration and settings of a payment gateway - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Payment gateway ID
  - Example: `"gateway_1234567890"`

**Request Body:**
```json
{
  "name": "PhonePe Updated",
  "config": {
    "merchantId": "NEW_MERCHANT_ID",
    "merchantKey": "NEW_MERCHANT_KEY",
    "apiKey": "NEW_API_KEY",
    "environment": "production"
  },
  "webhookSecret": "new_webhook_secret",
  "supportedCurrencies": ["INR", "USD"],
  "supportedMethods": ["UPI", "WALLET"],
  "isActive": true
}
```

**Request Body Fields:**
- All fields are optional (same as POST request body)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "gateway_1234567890",
    "name": "PhonePe Updated",
    "type": "PHONEPE",
    "isActive": true,
    "config": {
      "merchantId": "NEW_MERCHANT_ID",
      "merchantKey": "NEW_****KEY",
      "apiKey": "NEW_****KEY",
      "environment": "production"
    },
    "webhookSecret": "new_webhook_secret",
    "supportedCurrencies": ["INR", "USD"],
    "supportedMethods": ["UPI", "WALLET"],
    "createdAt": "2025-12-31T19:00:00.000Z",
    "updatedAt": "2025-12-31T19:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid configuration
```json
{
  "success": false,
  "error": "Missing required configuration field: merchantId"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Payment gateway not found
```json
{
  "success": false,
  "error": "Payment gateway not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PATCH /api/v1/admin/payment-gateways/:id/toggle

Toggle payment gateway status

Enable or disable a payment gateway - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Payment gateway ID
  - Example: `"gateway_1234567890"`

**Request Body:**
```json
{
  "isActive": true
}
```

**Request Body Fields:**
- `isActive` (boolean, **required**): Whether to activate or deactivate the gateway
  - Example: `true` (activate), `false` (deactivate)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment gateway activated successfully",
  "data": {
    "id": "gateway_1234567890",
    "name": "PhonePe",
    "type": "PHONEPE",
    "isActive": true,
    "config": {
      "merchantId": "MERCHANT_ID",
      "merchantKey": "MERCH****KEY",
      "apiKey": "API_****KEY",
      "environment": "production"
    },
    "supportedCurrencies": ["INR"],
    "supportedMethods": ["UPI", "WALLET"],
    "createdAt": "2025-12-31T19:00:00.000Z",
    "updatedAt": "2025-12-31T19:35:00.000Z"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `message` (string): Success message
- `data` (object): Updated payment gateway

**Error Responses:**

**400 Bad Request** - Invalid isActive value
```json
{
  "success": false,
  "error": "isActive must be a boolean value"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Payment gateway not found
```json
{
  "success": false,
  "error": "Payment gateway not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/admin/payment-gateways/:id

Delete payment gateway

Delete a payment gateway (only if not in use) - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Payment gateway ID
  - Example: `"gateway_1234567890"`

**Example Request:**
```
DELETE /api/v1/admin/payment-gateways/gateway_1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment gateway deleted successfully"
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `message` (string): Success message

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Payment gateway not found
```json
{
  "success": false,
  "error": "Payment gateway not found"
}
```

**409 Conflict** - Payment gateway is in use and cannot be deleted
```json
{
  "success": false,
  "error": "Cannot delete payment gateway that is being used in payments"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 25. Admin Email Service Management

Admin endpoints for managing email service configurations (SMTP, SendGrid, Mailgun, AWS SES) with full CRUD operations.

**Transactional email (verification, password reset, etc.):** The backend sends mail using **admin panel SMTP first**: if an active SMTP EmailService is configured in Admin > Email Services, that is used. If none is configured or loading fails, it **falls back to .env** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM`). If neither source is available, verification and reset emails are skipped.

### POST /api/v1/admin/email-services

Create email service

Create and configure a new email service (SMTP, SendGrid, Mailgun, AWS SES) - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Gmail SMTP",
  "type": "SMTP",
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "your-email@gmail.com",
    "password": "your-password",
    "from": "noreply@example.com"
  },
  "isActive": true,
  "isDefault": true
}
```

**Request Body Fields:**
- `name` (string, **required**): Display name of the email service
  - Example: `"Gmail SMTP"`, `"SendGrid Production"`
- `type` (string, **required**): Email service type
  - Allowed values: `SMTP`, `SENDGRID`, `MAILGUN`, `AWS_SES`
  - Example: `"SMTP"`
- `config` (object, **required**): Service-specific configuration
  - **SMTP Configuration:**
    ```json
    {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "your-email@gmail.com",
      "password": "your-password",
      "from": "noreply@example.com"
    }
    ```
  - **SendGrid Configuration:**
    ```json
    {
      "apiKey": "SG.xxx",
      "from": "noreply@example.com"
    }
    ```
  - **Mailgun Configuration:**
    ```json
    {
      "apiKey": "key-xxx",
      "domain": "mg.example.com",
      "from": "noreply@example.com"
    }
    ```
  - **AWS SES Configuration:**
    ```json
    {
      "accessKeyId": "AKIAxxx",
      "secretAccessKey": "xxx",
      "region": "us-east-1",
      "from": "noreply@example.com"
    }
    ```
- `isActive` (boolean, optional): Whether the service is active
  - Default: `false`
  - Example: `true`
- `isDefault` (boolean, optional): Whether this is the default email service
  - Default: `false`
  - Example: `true`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "email_service_1234567890",
    "name": "Gmail SMTP",
    "type": "SMTP",
    "isActive": true,
    "isDefault": true,
    "config": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "your-email@gmail.com",
      "password": "your****word",
      "from": "noreply@example.com"
    },
    "createdAt": "2025-12-31T20:00:00.000Z",
    "updatedAt": "2025-12-31T20:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid configuration or missing required fields
```json
{
  "success": false,
  "error": "Missing required configuration field: host"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**409 Conflict** - Email service type already exists
```json
{
  "success": false,
  "error": "Email service with type SMTP already exists"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/email-services

Get all email services

Retrieve list of all email services with optional filters - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
  - Example: `true`, `false`
- `type` (string, optional): Filter by service type
  - Allowed values: `SMTP`, `SENDGRID`, `MAILGUN`, `AWS_SES`
  - Example: `"SMTP"`
- `page` (integer, optional): Page number
  - Default: `1`
  - Example: `1`
- `limit` (integer, optional): Items per page
  - Default: `20`
  - Example: `20`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "email_service_1234567890",
      "name": "Gmail SMTP",
      "type": "SMTP",
      "isActive": true,
      "isDefault": true,
      "config": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "user": "your-email@gmail.com",
        "password": "your****word",
        "from": "noreply@example.com"
      },
      "createdAt": "2025-12-31T20:00:00.000Z",
      "updatedAt": "2025-12-31T20:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/email-services/:id

Get email service details

Retrieve detailed information about a specific email service - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Email service ID
  - Example: `"email_service_1234567890"`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "email_service_1234567890",
    "name": "Gmail SMTP",
    "type": "SMTP",
    "isActive": true,
    "isDefault": true,
    "config": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "your-email@gmail.com",
      "password": "your****word",
      "from": "noreply@example.com"
    },
    "createdAt": "2025-12-31T20:00:00.000Z",
    "updatedAt": "2025-12-31T20:00:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Email service not found
```json
{
  "success": false,
  "error": "Email service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/email-services/:id

Update email service

Update configuration and settings of an email service - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Email service ID
  - Example: `"email_service_1234567890"`

**Request Body:**
```json
{
  "name": "Gmail SMTP Updated",
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "new-email@gmail.com",
    "password": "new-password",
    "from": "noreply@example.com"
  },
  "isActive": true,
  "isDefault": true
}
```

**Request Body Fields:**
- All fields are optional (same as POST request body)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "email_service_1234567890",
    "name": "Gmail SMTP Updated",
    "type": "SMTP",
    "isActive": true,
    "isDefault": true,
    "config": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "new-email@gmail.com",
      "password": "new_****word",
      "from": "noreply@example.com"
    },
    "createdAt": "2025-12-31T20:00:00.000Z",
    "updatedAt": "2025-12-31T20:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid configuration
```json
{
  "success": false,
  "error": "Missing required configuration field: host"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Email service not found
```json
{
  "success": false,
  "error": "Email service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PATCH /api/v1/admin/email-services/:id/toggle

Toggle email service status

Enable or disable an email service - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Email service ID
  - Example: `"email_service_1234567890"`

**Request Body:**
```json
{
  "isActive": true
}
```

**Request Body Fields:**
- `isActive` (boolean, **required**): Whether to activate or deactivate the service
  - Example: `true` (activate), `false` (deactivate)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email service activated successfully",
  "data": {
    "id": "email_service_1234567890",
    "name": "Gmail SMTP",
    "type": "SMTP",
    "isActive": true,
    "isDefault": true,
    "config": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "your-email@gmail.com",
      "password": "your****word",
      "from": "noreply@example.com"
    },
    "createdAt": "2025-12-31T20:00:00.000Z",
    "updatedAt": "2025-12-31T20:35:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid isActive value
```json
{
  "success": false,
  "error": "isActive must be a boolean value"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Email service not found
```json
{
  "success": false,
  "error": "Email service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PATCH /api/v1/admin/email-services/:id/set-default

Set default email service

Set an email service as the default service for sending emails - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Email service ID
  - Example: `"email_service_1234567890"`

**Example Request:**
```
PATCH /api/v1/admin/email-services/email_service_1234567890/set-default
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email service set as default successfully",
  "data": {
    "id": "email_service_1234567890",
    "name": "Gmail SMTP",
    "type": "SMTP",
    "isActive": true,
    "isDefault": true,
    "config": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "your-email@gmail.com",
      "password": "your****word",
      "from": "noreply@example.com"
    },
    "createdAt": "2025-12-31T20:00:00.000Z",
    "updatedAt": "2025-12-31T20:40:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Service is not active
```json
{
  "success": false,
  "error": "Cannot set inactive service as default"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Email service not found
```json
{
  "success": false,
  "error": "Email service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/admin/email-services/:id

Delete email service

Delete an email service (cannot delete default service) - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): Email service ID
  - Example: `"email_service_1234567890"`

**Example Request:**
```
DELETE /api/v1/admin/email-services/email_service_1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email service deleted successfully"
}
```

**Error Responses:**

**400 Bad Request** - Cannot delete default service
```json
{
  "success": false,
  "error": "Cannot delete default email service"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Email service not found
```json
{
  "success": false,
  "error": "Email service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 25.1 Admin Mail Settings

Admin endpoints to configure **when** to send transactional emails and **which details** to include (order confirmation, invoice emails). Used by the backend to decide whether to send order confirmation on place and what to attach in invoice emails.

**Permissions**: Admin (Bearer token required)

### GET /api/v1/admin/mail-settings

Get current mail settings (triggers and details).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "default",
    "config": {
      "triggers": {
        "orderPlaced": false,
        "orderShipped": false,
        "invoiceCreated": false,
        "invoiceSent": false
      },
      "details": {
        "includeOrderSummary": true,
        "includeInvoicePdf": true,
        "includeShippingAddress": true
      }
    },
    "updatedAt": "2026-02-16T12:00:00.000Z"
  }
}
```

### PUT /api/v1/admin/mail-settings

Update mail settings. Partial update: send only the keys you want to change.

**Request Body (all optional):**
```json
{
  "triggers": {
    "orderPlaced": true,
    "orderShipped": false,
    "invoiceCreated": false,
    "invoiceSent": true
  },
  "details": {
    "includeOrderSummary": true,
    "includeInvoicePdf": true,
    "includeShippingAddress": true
  },
  "contactNotificationEmail": "admin@example.com"
}
```

**Note:** `contactNotificationEmail` is the address that receives an email when someone submits the public contact form (`POST /api/v1/support/contact`). If not set in admin panel, the app uses env `CONTACT_NOTIFICATION_EMAIL` or `ADMIN_EMAIL`.

**Response (200 OK):** Same shape as GET; returns the updated settings.

**Error Responses:** 401 Unauthorized, 403 Forbidden (admin only), 500 Internal Server Error.

---

### GET /api/v1/admin/contact-submissions

List contact form submissions. Paginated; optional filters by status and whether submission is linked to a user.

**Permissions**: Admin (Bearer token required)

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `hasUser` (string, optional): Filter by linked user – `true` (has userId), `false` (guest only)
- `status` (string, optional): Filter by status – `NEW`, `WAITING_FOR_CONFIRMATION`, `DONE`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "message": "Message text",
      "freeSiteVisit": true,
      "userId": "user_id_or_null",
      "status": "NEW",
      "visitAddress": null,
      "proposedQuoteAmount": null,
      "proposedQuoteDescription": null,
      "visitScheduledAt": null,
      "quoteSentAt": null,
      "adminNotes": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "user": { "id": "...", "email": "...", "firstName": "...", "lastName": "..." }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
}
```

**Error Responses:** 401 Unauthorized, 403 Forbidden (admin only), 500 Internal Server Error.

---

### PATCH /api/v1/admin/contact-submissions/:id

Update a contact submission (partial update). Admin can set status, visit address, proposed quote, visit/quote dates, and admin notes.

**Permissions**: Admin (Bearer token required)

**Path Parameters:**
- `id` (string, **required**): Contact submission ID

**Request Body (all optional):**
- `status` (string): `NEW` | `WAITING_FOR_CONFIRMATION` | `DONE`
- `visitAddress` (string, nullable): Address for the site visit
- `proposedQuoteAmount` (number, nullable): Proposed quote amount (e.g. 1500.50)
- `proposedQuoteDescription` (string, nullable): Description of the proposed quote
- `visitScheduledAt` (string, nullable): ISO date-time when visit is scheduled (e.g. "2026-02-20T10:00:00.000Z"); send null to clear
- `quoteSentAt` (string, nullable): ISO date-time when quote was sent; send null to clear
- `adminNotes` (string, nullable): Admin follow-up notes

**Response (200 OK):** Returns the updated submission (same shape as list items, including `user` when linked).

**Error Responses:**
- **400 Bad Request** – Invalid status value or invalid date format for visitScheduledAt/quoteSentAt
- **404 Not Found** – Contact submission not found
- 401 Unauthorized, 403 Forbidden (admin only), 500 Internal Server Error

---

## 25.2 Admin Invoices – Send by Email

### POST /api/v1/admin/invoices/:id/send-email

Send the invoice to the order customer's email. Respects mail settings (include PDF, order summary, shipping address). Admin only.

**Path Parameters:**
- `id` (string, **required**): Invoice ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invoice email sent to customer@example.com",
  "data": {
    "sentTo": "customer@example.com",
    "invoiceNumber": "INV-001"
  }
}
```

**Error Responses:** 400 Order has no customer email, 404 Invoice not found, 401 Unauthorized, 403 Forbidden (admin only), 500 Email service error.

---

## 25.3 Admin Services

Admin CRUD for the service catalog (Consulting, Repair, Installation). A service can be scoped by **product** (`productId`), **category** (`categoryId`), or standalone. Price is per unit; quantity is set when the customer adds the service to cart (e.g. 4 cameras → add "Camera Installation" with quantity 4). All endpoints require Admin (Bearer token).

### GET /api/v1/admin/services

List services with optional filters.

**Permissions**: Admin (Bearer token required)

**Query Parameters:** `page`, `limit`, `type` (CONSULTING | REPAIR | INSTALLATION), `productId`, `categoryId`, `isActive`

**Response (200 OK):** `{ "success": true, "data": [ <services> ], "pagination": { "page", "limit", "total", "pages" } }`

---

### GET /api/v1/admin/services/:id

Get a single service by ID.

**Permissions**: Admin (Bearer token required)

**Response (200 OK):** `{ "success": true, "data": <service> }` with `product` and/or `category` included when linked.

**404 Not Found:** `{ "success": false, "error": "Service not found" }`

---

### POST /api/v1/admin/services

Create a new service.

**Permissions**: Admin (Bearer token required)

**Request Body (application/json):**
- `name` (string, **required**)
- `slug` (string, optional): If omitted, generated from name (lowercase, hyphenated). Must be unique.
- `description` (string, optional)
- `price` (number, **required**, must be ≥ 0)
- `type` (string, **required**): One of `CONSULTING`, `REPAIR`, `INSTALLATION`
- `productId` (string, optional): Link service to a product (e.g. "Installation for this product")
- `categoryId` (string, optional): Link service to a category (e.g. "Cameras" – per-unit price for items in that category)
- `durationMinutes` (integer, optional)
- `isActive` (boolean, optional): Default true
- `image` (string, optional): Single image URL or path
- `metadata` (object, optional)

**Response (201 Created):** `{ "success": true, "data": <service> }`

**400 Bad Request:** Missing/invalid name, type, or price; or productId/categoryId not found.

---

### PUT /api/v1/admin/services/:id

Update a service.

**Permissions**: Admin (Bearer token required)

**Path Parameters:** `id` (string, **required**): Service ID

**Request Body (application/json):** Same fields as POST (including optional `image`); all optional. Only provided fields are updated.

**Response (200 OK):** `{ "success": true, "data": <service> }`

**404 Not Found:** `{ "success": false, "error": "Service not found" }`

---

### DELETE /api/v1/admin/services/:id

Delete a service.

**Permissions**: Admin (Bearer token required)

**Path Parameters:** `id` (string, **required**): Service ID

**Response (200 OK):** `{ "success": true, "message": "Service deleted" }`

**404 Not Found:** `{ "success": false, "error": "Service not found" }`

---

## 26. Admin SMS Service Management

Admin endpoints for managing SMS service configurations (Twilio, AWS SNS, MessageBird) with full CRUD operations.

### POST /api/v1/admin/sms-services

Create SMS service

Create and configure a new SMS service (Twilio, AWS SNS, MessageBird) - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Twilio Production",
  "type": "TWILIO",
  "config": {
    "accountSid": "ACxxx",
    "authToken": "xxx",
    "phoneNumber": "+1234567890"
  },
  "isActive": true,
  "isDefault": true
}
```

**Request Body Fields:**
- `name` (string, **required**): Display name of the SMS service
  - Example: `"Twilio Production"`, `"AWS SNS"`
- `type` (string, **required**): SMS service type
  - Allowed values: `TWILIO`, `AWS_SNS`, `MESSAGEBIRD`
  - Example: `"TWILIO"`
- `config` (object, **required**): Service-specific configuration
  - **Twilio Configuration:**
    ```json
    {
      "accountSid": "ACxxx",
      "authToken": "xxx",
      "phoneNumber": "+1234567890"
    }
    ```
  - **AWS SNS Configuration:**
    ```json
    {
      "accessKeyId": "AKIAxxx",
      "secretAccessKey": "xxx",
      "region": "us-east-1"
    }
    ```
  - **MessageBird Configuration:**
    ```json
    {
      "apiKey": "xxx",
      "originator": "Example"
    }
    ```
- `isActive` (boolean, optional): Whether the service is active
  - Default: `false`
  - Example: `true`
- `isDefault` (boolean, optional): Whether this is the default SMS service
  - Default: `false`
  - Example: `true`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "sms_service_1234567890",
    "name": "Twilio Production",
    "type": "TWILIO",
    "isActive": true,
    "isDefault": true,
    "config": {
      "accountSid": "ACxxx",
      "authToken": "ACxx****xxx",
      "phoneNumber": "+1234567890"
    },
    "createdAt": "2025-12-31T21:00:00.000Z",
    "updatedAt": "2025-12-31T21:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid configuration or missing required fields
```json
{
  "success": false,
  "error": "Missing required configuration field: accountSid"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**409 Conflict** - SMS service type already exists
```json
{
  "success": false,
  "error": "SMS service with type TWILIO already exists"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/sms-services

Get all SMS services

Retrieve list of all SMS services with optional filters - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
  - Example: `true`, `false`
- `type` (string, optional): Filter by service type
  - Allowed values: `TWILIO`, `AWS_SNS`, `MESSAGEBIRD`
  - Example: `"TWILIO"`
- `page` (integer, optional): Page number
  - Default: `1`
  - Example: `1`
- `limit` (integer, optional): Items per page
  - Default: `20`
  - Example: `20`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sms_service_1234567890",
      "name": "Twilio Production",
      "type": "TWILIO",
      "isActive": true,
      "isDefault": true,
      "config": {
        "accountSid": "ACxxx",
        "authToken": "ACxx****xxx",
        "phoneNumber": "+1234567890"
      },
      "createdAt": "2025-12-31T21:00:00.000Z",
      "updatedAt": "2025-12-31T21:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "pages": 1
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/sms-services/:id

Get SMS service details

Retrieve detailed information about a specific SMS service - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): SMS service ID
  - Example: `"sms_service_1234567890"`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "sms_service_1234567890",
    "name": "Twilio Production",
    "type": "TWILIO",
    "isActive": true,
    "isDefault": true,
    "config": {
      "accountSid": "ACxxx",
      "authToken": "ACxx****xxx",
      "phoneNumber": "+1234567890"
    },
    "createdAt": "2025-12-31T21:00:00.000Z",
    "updatedAt": "2025-12-31T21:00:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - SMS service not found
```json
{
  "success": false,
  "error": "SMS service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/sms-services/:id

Update SMS service

Update configuration and settings of an SMS service - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): SMS service ID
  - Example: `"sms_service_1234567890"`

**Request Body:**
```json
{
  "name": "Twilio Production Updated",
  "config": {
    "accountSid": "ACxxx",
    "authToken": "new-token",
    "phoneNumber": "+1234567890"
  },
  "isActive": true,
  "isDefault": true
}
```

**Request Body Fields:**
- All fields are optional (same as POST request body)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "sms_service_1234567890",
    "name": "Twilio Production Updated",
    "type": "TWILIO",
    "isActive": true,
    "isDefault": true,
    "config": {
      "accountSid": "ACxxx",
      "authToken": "new_****oken",
      "phoneNumber": "+1234567890"
    },
    "createdAt": "2025-12-31T21:00:00.000Z",
    "updatedAt": "2025-12-31T21:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid configuration
```json
{
  "success": false,
  "error": "Missing required configuration field: accountSid"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - SMS service not found
```json
{
  "success": false,
  "error": "SMS service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PATCH /api/v1/admin/sms-services/:id/toggle

Toggle SMS service status

Enable or disable an SMS service - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): SMS service ID
  - Example: `"sms_service_1234567890"`

**Request Body:**
```json
{
  "isActive": true
}
```

**Request Body Fields:**
- `isActive` (boolean, **required**): Whether to activate or deactivate the service
  - Example: `true` (activate), `false` (deactivate)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "SMS service activated successfully",
  "data": {
    "id": "sms_service_1234567890",
    "name": "Twilio Production",
    "type": "TWILIO",
    "isActive": true,
    "isDefault": true,
    "config": {
      "accountSid": "ACxxx",
      "authToken": "ACxx****xxx",
      "phoneNumber": "+1234567890"
    },
    "createdAt": "2025-12-31T21:00:00.000Z",
    "updatedAt": "2025-12-31T21:35:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid isActive value
```json
{
  "success": false,
  "error": "isActive must be a boolean value"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - SMS service not found
```json
{
  "success": false,
  "error": "SMS service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PATCH /api/v1/admin/sms-services/:id/set-default

Set default SMS service

Set an SMS service as the default service for sending SMS - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): SMS service ID
  - Example: `"sms_service_1234567890"`

**Example Request:**
```
PATCH /api/v1/admin/sms-services/sms_service_1234567890/set-default
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "SMS service set as default successfully",
  "data": {
    "id": "sms_service_1234567890",
    "name": "Twilio Production",
    "type": "TWILIO",
    "isActive": true,
    "isDefault": true,
    "config": {
      "accountSid": "ACxxx",
      "authToken": "ACxx****xxx",
      "phoneNumber": "+1234567890"
    },
    "createdAt": "2025-12-31T21:00:00.000Z",
    "updatedAt": "2025-12-31T21:40:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Service is not active
```json
{
  "success": false,
  "error": "Cannot set inactive service as default"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - SMS service not found
```json
{
  "success": false,
  "error": "SMS service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/admin/sms-services/:id

Delete SMS service

Delete an SMS service (cannot delete default service) - Admin only

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (string, **required**): SMS service ID
  - Example: `"sms_service_1234567890"`

**Example Request:**
```
DELETE /api/v1/admin/sms-services/sms_service_1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "SMS service deleted successfully"
}
```

**Error Responses:**

**400 Bad Request** - Cannot delete default service
```json
{
  "success": false,
  "error": "Cannot delete default SMS service"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - SMS service not found
```json
{
  "success": false,
  "error": "SMS service not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 27. Admin Logistics Provider Management

Admin endpoints for managing logistics provider configurations (Shiprocket, Delhivery, ClickPost, etc.) with full CRUD operations.

### POST /api/v1/admin/logistics-providers

Create logistics provider

Create and configure a new logistics provider (Shiprocket, Delhivery, etc.) - Admin only

**Permissions**: Admin (Bearer token required)

**Request Body:**
```json
{
  "name": "Shiprocket",
  "type": "SHIPROCKET",
  "config": {
    "email": "merchant@example.com",
    "password": "password123",
    "apiKey": "API_KEY",
    "environment": "production"
  },
  "webhookUrl": "https://api.example.com/webhooks/logistics",
  "webhookSecret": "webhook_secret",
  "supportedRegions": ["IN", "US"],
  "supportedServices": ["express", "standard", "cod"],
  "isActive": true,
  "isDefault": false,
  "priority": 0
}
```

**Request Body Fields:**
- `name` (string, required): Display name of the logistics provider
- `type` (string, required): Provider type - SHIPROCKET, DELHIVERY, CLICKPOST, VAMASHIP, SHIPJEE, INDISPEED, ULIP
- `config` (object, required): Provider-specific configuration (API keys, credentials, etc.)
  - For Shiprocket: `email`, `password`, `apiKey`, `environment`
  - For Delhivery: `clientId`, `clientSecret`, `apiKey`, `environment`
  - For ClickPost: `apiKey`, `secretKey`, `environment`
- `webhookUrl` (string, optional): Webhook URL for status updates
- `webhookSecret` (string, optional): Webhook secret for signature verification
- `supportedRegions` (array, optional): Supported regions/countries (e.g., ["IN", "US"])
- `supportedServices` (array, optional): Supported service types (e.g., ["express", "standard", "cod"])
- `isActive` (boolean, optional): Whether the provider is active (default: false)
- `isDefault` (boolean, optional): Whether this is the default provider (default: false)
- `priority` (integer, optional): Provider priority for selection (lower = higher priority, default: 0)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "log_prov_123",
    "name": "Shiprocket",
    "type": "SHIPROCKET",
    "isActive": true,
    "isDefault": false,
    "config": {
      "email": "merchant@example.com",
      "password": "***d123",
      "apiKey": "***KEY",
      "environment": "production"
    },
    "supportedRegions": ["IN", "US"],
    "supportedServices": ["express", "standard", "cod"],
    "priority": 0,
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-10T08:00:00.000Z"
  },
  "message": "Logistics provider created successfully"
}
```

**Error Responses:**

**400 Bad Request** - Validation error or provider already exists
```json
{
  "success": false,
  "error": "Logistics provider with type SHIPROCKET already exists"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

### GET /api/v1/admin/logistics-providers

Get all logistics providers

Retrieve paginated list of all logistics providers with optional filters - Admin only

**Permissions**: Admin (Bearer token required)

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `type` (string, optional): Filter by provider type (SHIPROCKET, DELHIVERY, etc.)
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)

**Response (200 OK):**

Each provider may include `incomingWebhookUrl`: the URL to paste in the provider's webhook settings (e.g. Shiprocket dashboard) when supported for that type; otherwise `null`.

```json
{
  "success": true,
  "data": [
    {
      "id": "log_prov_123",
      "name": "Shiprocket",
      "type": "SHIPROCKET",
      "isActive": true,
      "isDefault": true,
      "config": {
        "email": "merchant@example.com",
        "password": "***d123",
        "apiKey": "***KEY",
        "environment": "production"
      },
      "supportedRegions": ["IN", "US"],
      "supportedServices": ["express", "standard", "cod"],
      "priority": 0,
      "incomingWebhookUrl": "https://api.example.com/api/v1/webhooks/logistics/shiprocket",
      "createdAt": "2026-01-10T08:00:00.000Z",
      "updatedAt": "2026-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### GET /api/v1/admin/logistics-providers/:id

Get logistics provider by ID

Retrieve details of a specific logistics provider - Admin only

**Permissions**: Admin (Bearer token required)

**Path Parameters:**
- `id` (string, required): Logistics provider ID

**Response (200 OK):**

The provider may include `incomingWebhookUrl`: the URL to paste in the provider's webhook settings (e.g. Shiprocket dashboard) when supported for that type; otherwise `null`.

```json
{
  "success": true,
  "data": {
    "id": "log_prov_123",
    "name": "Shiprocket",
    "type": "SHIPROCKET",
    "isActive": true,
    "isDefault": true,
    "config": {
      "email": "merchant@example.com",
      "password": "***d123",
      "apiKey": "***KEY",
      "environment": "production"
    },
    "supportedRegions": ["IN", "US"],
    "supportedServices": ["express", "standard", "cod"],
    "priority": 0,
    "incomingWebhookUrl": "https://api.example.com/api/v1/webhooks/logistics/shiprocket",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-10T08:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found** - Logistics provider not found
```json
{
  "success": false,
  "error": "Logistics provider not found"
}
```

### PUT /api/v1/admin/logistics-providers/:id

Update logistics provider

Update configuration of an existing logistics provider - Admin only

**Permissions**: Admin (Bearer token required)

**Path Parameters:**
- `id` (string, required): Logistics provider ID

**Request Body:**
```json
{
  "name": "Shiprocket Updated",
  "config": {
    "email": "newemail@example.com",
    "password": "newpassword",
    "apiKey": "NEW_API_KEY",
    "environment": "production"
  },
  "isActive": true,
  "isDefault": true,
  "priority": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "log_prov_123",
    "name": "Shiprocket Updated",
    "type": "SHIPROCKET",
    "isActive": true,
    "isDefault": true,
    "config": {
      "email": "newemail@example.com",
      "password": "***word",
      "apiKey": "***_KEY",
      "environment": "production"
    },
    "updatedAt": "2026-01-10T09:00:00.000Z"
  },
  "message": "Logistics provider updated successfully"
}
```

### PATCH /api/v1/admin/logistics-providers/:id/toggle

Toggle logistics provider active status

Enable or disable a logistics provider - Admin only

**Permissions**: Admin (Bearer token required)

**Path Parameters:**
- `id` (string, required): Logistics provider ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "log_prov_123",
    "isActive": false,
    "updatedAt": "2026-01-10T09:00:00.000Z"
  },
  "message": "Logistics provider deactivated successfully"
}
```

### PATCH /api/v1/admin/logistics-providers/:id/set-default

Set default logistics provider

Set a logistics provider as the default provider - Admin only

**Permissions**: Admin (Bearer token required)

**Path Parameters:**
- `id` (string, required): Logistics provider ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "log_prov_123",
    "isDefault": true,
    "updatedAt": "2026-01-10T09:00:00.000Z"
  },
  "message": "Default logistics provider set successfully"
}
```

**Error Responses:**

**400 Bad Request** - Cannot set inactive provider as default
```json
{
  "success": false,
  "error": "Cannot set inactive provider as default"
}
```

### DELETE /api/v1/admin/logistics-providers/:id

Delete logistics provider

Delete a logistics provider (only if no active shipments) - Admin only

**Permissions**: Admin (Bearer token required)

**Path Parameters:**
- `id` (string, required): Logistics provider ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logistics provider deleted successfully"
}
```

**Error Responses:**

**400 Bad Request** - Cannot delete provider with active shipments
```json
{
  "success": false,
  "error": "Cannot delete provider with 5 active shipments. Please cancel or complete shipments first."
}
```

---

## 28. Logistics Operations

Logistics and shipping operations for tracking, rate calculation, shipment creation, and management.

### GET /api/v1/logistics/track

Track shipment

Track a shipment by order ID or tracking number

**Permissions**: Authenticated (Bearer token required)

**Query Parameters:**
- `orderId` (string, optional): Order ID
- `trackingNumber` (string, optional): Tracking number or AWB
- `providerType` (string, optional): Provider type (auto-detected if not provided)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "trackingNumber": "AWB123456",
    "status": "in_transit",
    "providerStatus": "Out for Delivery",
    "events": [
      {
        "timestamp": "2026-01-10T10:00:00Z",
        "location": "Mumbai",
        "status": "in_transit",
        "description": "Package in transit"
      }
    ],
    "estimatedDelivery": "2026-01-12T18:00:00Z",
    "currentLocation": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing orderId or trackingNumber
```json
{
  "success": false,
  "error": "Either orderId or trackingNumber is required"
}
```

**404 Not Found** - Shipment not found
```json
{
  "success": false,
  "error": "Shipment not found"
}
```

### POST /api/v1/logistics/rates

Calculate shipping rates

Calculate shipping rates for a shipment. Set compareAll=true to compare rates across all providers.

**Permissions**: Authenticated (Bearer token required)

**Query Parameters:**
- `compareAll` (boolean, optional): Compare rates from all active providers (default: false)
- `providerType` (string, optional): Specific provider type to use

**Request Body:**
```json
{
  "pickup": {
    "pincode": "400001",
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "delivery": {
    "pincode": "110001",
    "city": "New Delhi",
    "state": "Delhi"
  },
  "weight": 1.5,
  "dimensions": {
    "length": 20,
    "width": 15,
    "height": 10
  },
  "codAmount": 1000
}
```

**Response (200 OK) - Single Provider:**
```json
{
  "success": true,
  "data": [
    {
      "provider": "SHIPROCKET",
      "courierCompanyId": 1,
      "courierName": "Express",
      "rate": 150.00,
      "estimatedDays": 2,
      "codAvailable": true
    }
  ]
}
```

**Response (200 OK) - Compare All:**
```json
{
  "success": true,
  "data": {
    "comparisons": [
      {
        "provider": "SHIPROCKET",
        "providerName": "Shiprocket",
        "rates": [
          {
            "provider": "SHIPROCKET",
            "courierName": "Express",
            "rate": 150.00,
            "estimatedDays": 2
          }
        ]
      }
    ],
    "errors": []
  }
}
```

### POST /api/v1/logistics/shipments

Create shipment

Create a new shipment for an order - Admin/Vendor only

**Permissions**: Admin/Vendor (Bearer token required)

**Query Parameters:**
- `providerId` (string, optional): Specific provider ID (uses default if not provided)

**Request Body:**
```json
{
  "orderId": "order_123",
  "pickup": {
    "name": "Warehouse",
    "address": "123 Warehouse St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "+919876543210"
  },
  "delivery": {
    "name": "John Doe",
    "address": "456 Customer St",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "phone": "+919876543211"
  },
  "weight": 1.5,
  "dimensions": {
    "length": 20,
    "width": 15,
    "height": 10
  },
  "codAmount": 1000,
  "paymentMethod": "COD"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "shipment_123",
    "orderId": "order_123",
    "providerId": "log_prov_123",
    "providerShipmentId": "SR123456",
    "awbNumber": "AWB123456",
    "trackingNumber": "AWB123456",
    "status": "created",
    "providerStatus": "NEW",
    "rate": 150.00,
    "labelUrl": "https://example.com/labels/AWB123456.pdf",
    "createdAt": "2026-01-10T08:00:00.000Z"
  },
  "message": "Shipment created successfully"
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "orderId is required"
}
```

**403 Forbidden** - Admin/Vendor access required
```json
{
  "success": false,
  "error": "Forbidden - Admin/Vendor access required"
}
```

### GET /api/v1/logistics/shipments/:orderId

Get shipment status

Get shipment status for an order

**Permissions**: Authenticated (Bearer token required)

**Path Parameters:**
- `orderId` (string, required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "shipment_123",
      "orderId": "order_123",
      "providerId": "log_prov_123",
      "awbNumber": "AWB123456",
      "trackingNumber": "AWB123456",
      "status": "in_transit",
      "rate": 150.00,
      "labelUrl": "https://example.com/labels/AWB123456.pdf",
      "estimatedDelivery": "2026-01-12T18:00:00.000Z",
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

**404 Not Found** - No shipments found
```json
{
  "success": false,
  "error": "No shipments found for this order"
}
```

### POST /api/v1/logistics/shipments/:shipmentId/label

Generate shipping label

Generate shipping label for a shipment - Admin/Vendor only

**Permissions**: Admin/Vendor (Bearer token required)

**Path Parameters:**
- `shipmentId` (string, required): Shipment ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "labelUrl": "https://example.com/labels/AWB123456.pdf",
    "awbNumber": "AWB123456"
  },
  "message": "Label generated successfully"
}
```

### POST /api/v1/logistics/shipments/:shipmentId/pickup

Schedule pickup

Schedule a pickup for a shipment - Admin/Vendor only

**Permissions**: Admin/Vendor (Bearer token required)

**Path Parameters:**
- `shipmentId` (string, required): Shipment ID

**Request Body:**
```json
{
  "pickupDate": "2026-01-11",
  "pickupTime": "10:00-17:00"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "pickupDate": "2026-01-11"
  },
  "message": "Pickup scheduled successfully"
}
```

### DELETE /api/v1/logistics/shipments/:shipmentId

Cancel shipment

Cancel a shipment - Admin/Vendor only

**Permissions**: Admin/Vendor (Bearer token required)

**Path Parameters:**
- `shipmentId` (string, required): Shipment ID

**Request Body:**
```json
{
  "reason": "Order cancelled by customer"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "shipment_123",
    "status": "cancelled",
    "providerStatus": "CANCELLED"
  },
  "message": "Shipment cancelled successfully"
}
```

**Error Responses:**

**400 Bad Request** - Cannot cancel shipment
```json
{
  "success": false,
  "error": "Cannot cancel shipment with status: delivered"
}
```

### POST /api/v1/logistics/returns

Handle return shipment

Create a return shipment for an order

**Permissions**: Authenticated (Bearer token required)

**Request Body:**
```json
{
  "orderId": "order_123",
  "providerId": "log_prov_123",
  "pickup": {
    "name": "John Doe",
    "address": "456 Customer St",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "phone": "+919876543211"
  },
  "delivery": {
    "name": "Warehouse",
    "address": "123 Warehouse St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "+919876543210"
  },
  "items": [
    {
      "name": "Product Name",
      "sku": "SKU123",
      "quantity": 1,
      "price": 1000
    }
  ],
  "total": 1000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "SR789012",
    "awbNumber": "AWB789012",
    "trackingNumber": "AWB789012"
  },
  "message": "Return shipment created successfully"
}
```

---

## 29. Webhooks

### POST /api/v1/webhooks/stripe

Stripe payment webhook

Webhook endpoint for Stripe payment events. Called by Stripe, not by your application.

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/webhooks/razorpay

Razorpay payment webhook

Webhook endpoint for Razorpay payment events. Called by Razorpay, not by your application.

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/webhooks/logistics/shiprocket

Shiprocket tracking webhook. Called by Shiprocket when tracking status changes. Optional header `anx-api-key` can be used to verify requests when the provider has `webhookSecret` set. Always returns `200` with `{ "received": true }`.

**Permissions**: Public (called by Shiprocket)

---

## 28. Advanced Products

### GET /api/v1/advanced-products/digital/:productId

Get digital product

Retrieve information about a digital product

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/advanced-products/digital/:productId/download/:orderId

Download digital product

Download a purchased digital product (requires authentication)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/advanced-products/subscriptions

Get subscriptions

Retrieve user's product subscriptions

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/advanced-products/subscriptions

Create subscription

Create a new product subscription

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/advanced-products/pre-orders

Create pre-order

Create a pre-order for a product that is not yet available

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/advanced-products/pre-orders

Get pre-orders

Retrieve user's pre-orders

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/advanced-products/gift-cards

Pre-orders retrieved successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/advanced-products/gift-cards/purchase

Pre-order created successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/advanced-products/gift-cards/redeem

Pre-order created successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 29. Customer Experience

### GET /api/v1/experience/products/:productId/questions

Get product questions

Retrieve questions and answers for a product

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/experience/products/:productId/size-guide

Get size guide

Retrieve size guide for a product

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/experience/products/:productId/videos

Get product videos

Retrieve videos for a product

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/experience/products/:productId/social-proof

Get social proof

Retrieve social proof data for a product (recent purchases, reviews count, etc.)

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/experience/products/questions

Ask product question

Submit a question about a product

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/experience/recently-viewed

Get recently viewed products

Retrieve products recently viewed by the user

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/experience/waitlist

Add to waitlist

Add a product to waitlist for out-of-stock items

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/experience/waitlist

Added to waitlist successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/experience/product-alerts

Recently viewed products retrieved successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/experience/product-alerts

Added to waitlist successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 30. Order Enhancements

### POST /api/v1/order-enhancements/notes

Add order note

Add a note to an order

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/order-enhancements/:orderId/notes

Get order notes

Retrieve all notes for an order

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/order-enhancements/schedule-delivery

Schedule delivery

Schedule a specific delivery date and time for an order

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/order-enhancements/:orderId/splits

Get order splits

Retrieve order split information (multiple shipments)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 28. CMS

### GET /api/v1/cms/pages

Get CMS pages

Retrieve list of CMS pages

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/cms/pages/:slug

Get CMS page by slug

Retrieve a specific CMS page by its slug

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/cms/blog

Get blog posts

Retrieve paginated list of blog posts

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/cms/blog/:slug

Get blog post by slug

Retrieve a specific blog post by its slug

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/cms/banners

Blog post not found

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 32. Order State

Order state machine management endpoints (Admin only). All require Bearer token and admin role.

---

### POST /api/v1/order-state/:orderId/transition

Transition order state

Transition an order to a new state using the state machine (Admin only).

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `orderId` (path, required): Order ID

**Request Body (application/json):**
```json
{
  "newState": "PAID",
  "metadata": {
    "message": "Payment confirmed via webhook"
  }
}
```

- `newState` (string, **required**): Target state. One of: `CREATED`, `PAYMENT_PENDING`, `PAYMENT_FAILED`, `PAID`, `PACKED`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `REFUNDED`, `RETURNED`. Must be in the list returned by GET .../transitions for this order.
- `metadata` (object, optional): Optional data (e.g. message, reason) stored with the transition. The authenticated admin is recorded as the performer (`userId` in state history). `metadata.reason` is stored on the state history entry for audit.

**Behavior:**
- When `newState` is **PAID**, the backend updates the order's payment(s) to status **SUCCEEDED** (e.g. COD cash collected). Refetch the order (GET admin/orders/:id or GET orders/:id) to get updated `payments[].status`.
- Each transition is recorded in **OrderStateHistory** (same as `order.stateHistory` and GET .../history), so state history appears in order detail and in GET .../history.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "PAID",
    "total": 90,
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:05:00.000Z"
  },
  "message": "Order status changed to PAID"
}
```

**Error Responses:**

**400 Bad Request** - Invalid order state or invalid transition
```json
{
  "success": false,
  "error": "Invalid order state"
}
```
or
```json
{
  "success": false,
  "error": "Invalid transition from CREATED to PAID"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/order-state/:orderId/rollback

Rollback order state

Rollback an order to a previous state (Admin only).

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `orderId` (path, required): Order ID

**Request Body (application/json):**
```json
{
  "previousState": "CREATED"
}
```

- `previousState` (string, **required**): The state to roll back to (e.g. CREATED, PAYMENT_PENDING).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmlhdwfwz000834y2hdo54gtr",
    "orderNumber": "ORD-1770775312785-75442D6C",
    "status": "CREATED",
    "total": 90,
    "userId": "cmje71jzx00005gwn4evdcx6n",
    "createdAt": "2026-02-11T02:01:52.787Z",
    "updatedAt": "2026-02-11T02:06:00.000Z"
  },
  "message": "Order rolled back to CREATED"
}
```

**Error Responses:**

**400 Bad Request**
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/order-state/:orderId/history

Get order state history

Retrieve state transition history for an order (Admin only). Returns **OrderStateHistory** records: the same data as `order.stateHistory` on GET order detail. Populated by transitions (including those from POST .../transition). This is the canonical source for "from/to state" and "Performed by"; tracking events (e.g. carrier updates) remain in `order.tracking`.

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `orderId` (path, required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "hist_id_1",
      "orderId": "cmlhdwfwz000834y2hdo54gtr",
      "fromState": "DELIVERED",
      "toState": "PAID",
      "reason": null,
      "userId": "admin_user_id",
      "createdAt": "2026-02-11T02:05:00.000Z",
      "user": {
        "id": "admin_user_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      }
    },
    {
      "id": "hist_id_2",
      "orderId": "cmlhdwfwz000834y2hdo54gtr",
      "fromState": "CREATED",
      "toState": "CREATED",
      "reason": null,
      "userId": null,
      "createdAt": "2026-02-11T02:01:52.787Z",
      "user": null
    }
  ]
}
```

- Each entry has `fromState`, `toState`, `userId` (admin who performed the transition, or null), `reason` (from request metadata, or null), and `user` (object or null: id, firstName, lastName, email) for "Performed by" display.
- History is ordered by most recent first.

**Error Responses:**

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/order-state/:orderId/transitions

Get available transitions

Get available state transitions for an order. The list depends on the order's **current status**, **payment method** (e.g. COD vs prepaid), and **whether the order requires shipping**. Digital or non-shipped orders may see COMPLETED from PAID and not see PACKED, SHIPPED, or DELIVERED; COD orders may see different options (e.g. PACKED before payment, PAID/COMPLETED after delivery). Transition execution uses the same rules, so only transitions returned here can be performed via POST .../transition.

**Permissions**: Admin (Bearer token required)

**Parameters:**
- `orderId` (path, required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "currentState": "PAID",
    "availableTransitions": ["PACKED", "CANCELLED", "REFUNDED"],
    "context": {
      "requiresShipping": true,
      "paymentMethod": "prepaid"
    }
  }
}
```

- `currentState`: Current order status.
- `availableTransitions`: Allowed next states given payment and shipping context.
- `context`: Optional. `requiresShipping` (boolean): whether the order has shipping cost or logistics shipments; `paymentMethod`: `"COD"` or `"prepaid"` from the order's payments.

**Context rules**

- **Requires shipping**: When the order has shipping cost or logistics shipments (or a valid shipping address), PACKED, SHIPPED, DELIVERED, and COMPLETED are available as per status. When it does not require shipping, those fulfillment states may be omitted and COMPLETED may be available directly from PAID.
- **Payment method**: COD orders may allow PACKED from CREATED or PAYMENT_PENDING and PAID/COMPLETED from DELIVERED; prepaid orders follow the standard flow. REFUNDED availability may differ by payment type (e.g. for COD, REFUNDED only after delivery).

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 30. Operational

### POST /api/v1/operational/bulk/products

Bulk update products

Perform bulk update operations on products (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "operation": "UPDATE_STATUS",
  "filters": {
    "categoryId": "cat_123",
    "isActive": true
  },
  "data": {
    "isActive": false,
    "badges": ["Sale"]
  }
}
```

**Request Body Fields:**
- `operation` (string, **required**): Operation type
  - Allowed values: `UPDATE_STATUS`, `UPDATE_PRICE`, `UPDATE_STOCK`
  - Example: `"UPDATE_STATUS"`
- `filters` (object, **required**): Filter criteria to select products
  - Type: JSON object
  - Can include: `categoryId`, `isActive`, `brand`, `minPrice`, `maxPrice`, etc.
  - Example: `{"categoryId": "cat_123", "isActive": true}`
- `data` (object, **required**): Update data to apply
  - Type: JSON object
  - Can include any product fields that can be updated
  - Example: `{"isActive": false, "badges": ["Sale"]}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "updated": 25
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Update result
  - `updated` (integer): Number of products updated

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "operation",
      "message": "\"operation\" is required"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/operational/bulk/orders

Bulk update orders

Perform bulk update operations on orders (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "operation": "UPDATE_STATUS",
  "filters": {
    "status": "PAYMENT_PENDING",
    "createdAt": {
      "gte": "2025-12-01T00:00:00.000Z"
    }
  },
  "data": {
    "status": "CANCELLED"
  }
}
```

**Request Body Fields:**
- `operation` (string, **required**): Operation type
  - Allowed values: `UPDATE_STATUS`, `UPDATE_SHIPPING`
  - Example: `"UPDATE_STATUS"`
- `filters` (object, **required**): Filter criteria to select orders
  - Type: JSON object
  - Can include: `status`, `userId`, `createdAt`, `total`, etc.
  - Example: `{"status": "PAYMENT_PENDING"}`
- `data` (object, **required**): Update data to apply
  - Type: JSON object
  - Can include order fields that can be updated
  - Example: `{"status": "CANCELLED"}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "updated": 10
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Update result
  - `updated` (integer): Number of orders updated

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "operation",
      "message": "\"operation\" must be one of [UPDATE_STATUS, UPDATE_SHIPPING]"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/operational/import

Create import job (Enhanced with file upload)

Create a new data import job with file upload support. Accepts multipart/form-data for direct file upload or application/json with fileUrl.

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data OR application/json
```

**Request Body (multipart/form-data):**
- `file` (File, **required**): CSV/Excel file to import
  - Supported formats: CSV, XLSX, XLS
  - Maximum file size: 10MB (configurable)
  - Description: File containing data to import
- `type` (string, **required**): Import type
  - Allowed values: `PRODUCTS`, `ORDERS`, `USERS`
  - Example: `"PRODUCTS"`
  - Description: Type of data to import
- `options` (string, optional): JSON string of import options
  - Example: `'{"skipHeader": true, "validate": true}'`
  - Available options:
    - `skipHeader` (boolean, default: true): Skip first row if it contains headers
    - `validate` (boolean, default: true): Validate data before importing

**Request Body (application/json):**
```json
{
  "type": "PRODUCTS",
  "fileUrl": "https://example.com/products.csv",
  "options": {
    "skipHeader": true,
    "validate": true
  }
}
```

**Request Body Fields (application/json):**
- `type` (string, **required**): Import type
  - Allowed values: `PRODUCTS`, `ORDERS`, `USERS`
  - Example: `"PRODUCTS"`
- `fileUrl` (string, **required**): URL of file to import
  - Format: URI
  - Example: `"https://example.com/products.csv"`
- `options` (object, optional): Import options
  - `skipHeader` (boolean, default: true): Skip first row if it contains headers
  - `validate` (boolean, default: true): Validate data before importing

**Product Import CSV Format:**

When importing `PRODUCTS`, the CSV/Excel file should include the following columns (all optional except name, price, sku):

**Required Columns:**
- `name` (string): Product name
- `price` (decimal): Current selling price (must be >= 0)
- `sku` (string): Stock Keeping Unit (must be unique)

**Optional Columns:**
- `description` (string): Product description
- `slug` (string): URL-friendly slug
- `compareAtPrice` (decimal): MSRP or "was" price (must be >= 0)
- `originalPrice` (decimal): Original selling price before discounts (must be >= 0)
- `images` (string): Comma-separated image URLs (e.g., `"https://example.com/img1.jpg,https://example.com/img2.jpg"`)
- `categoryId` (string): Category ID
- `badges` (string): Comma-separated badges (e.g., `"New,Featured"`)
- `specifications` (string): JSON string for specifications
- `certifications` (string): Comma-separated certifications (e.g., `"CE,FCC,RoHS"`)
- `warrantyInfo` (string): Warranty information
- `returnPolicy` (string): JSON string for return policy
- `refundPolicy` (string): JSON string for refund policy
- `shippingPolicy` (string): JSON string for shipping policy
- `exchangePolicy` (string): JSON string for exchange policy
- `cancellationPolicy` (string): JSON string for cancellation policy
- `careInstructions` (string): Care instructions
- `countryOfOrigin` (string): Country of origin
- `manufacturerInfo` (string): JSON string for manufacturer info
- `brand` (string): Product brand
- `modelNumber` (string): Model number
- `weightDimensions` (string): JSON string for weight and dimensions
- `minOrderQuantity` (integer): Minimum order quantity (default: 1)
- `maxOrderQuantity` (integer): Maximum order quantity

**JSON Field Format Examples:**

When providing JSON fields in CSV, use JSON strings (escape quotes in CSV):

- `returnPolicy`: `{"window":"30 days","conditions":"Item must be unused","process":"Contact support"}`
- `refundPolicy`: `{"method":"original payment","timeline":"7-14 days"}`
- `shippingPolicy`: `{"deliveryTime":"3-5 days","methods":["standard","express"]}`
- `manufacturerInfo`: `{"name":"Manufacturer","contact":"support@example.com","address":"123 St"}`
- `weightDimensions`: `{"weight":{"value":1.5,"unit":"kg"},"dimensions":{"length":10,"width":5,"height":3,"unit":"cm"}}`

**CSV Example:**
```csv
name,price,sku,description,compareAtPrice,originalPrice,brand,modelNumber,returnPolicy,weightDimensions
Premium Headphones,199.99,SKU-HEAD-001,High-quality headphones,249.99,219.99,TechBrand,TB-HEAD-2024,"{""window"":""30 days"",""conditions"":""Item must be unused""}","{""weight"":{""value"":1.5,""unit"":""kg""},""dimensions"":{""length"":10,""width"":5,""height"":3,""unit"":""cm""}}"
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "jobId": "import_1234567890",
    "status": "queued",
    "message": "Import job created successfully"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Import job information
  - `jobId` (string): Import job ID for tracking
  - `status` (string): Job status (always "queued" initially)
  - `message` (string): Success message

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "file",
      "message": "File is required",
      "code": "FILE_REQUIRED"
    },
    {
      "field": "type",
      "message": "\"type\" must be one of [PRODUCTS, ORDERS, USERS]"
    }
  ],
  "requestId": "req_1234567890",
  "timestamp": "2025-12-31T05:00:00.000Z"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**413 Payload Too Large** - File exceeds maximum size
```json
{
  "success": false,
  "error": "File size exceeds maximum limit",
  "code": "FILE_TOO_LARGE"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/operational/import

Get import jobs

Retrieve list of import jobs (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
  - Type: integer
  - Minimum: 1
  - Example: `1`
- `limit` (integer, optional): Items per page (default: 20)
  - Type: integer
  - Minimum: 1
  - Maximum: 100
  - Example: `20`
- `status` (string, optional): Filter by job status
  - Allowed values: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
  - Example: `"COMPLETED"`

**Example Request:**
```
GET /api/v1/operational/import?page=1&limit=20&status=COMPLETED
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "import_1234567890",
      "type": "PRODUCTS",
      "fileUrl": "https://example.com/products.csv",
      "status": "COMPLETED",
      "progress": 100,
      "errors": [],
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of import job objects
  - `id` (string): Import job ID
  - `type` (string): Import type (PRODUCTS, ORDERS, USERS)
  - `fileUrl` (string): URL of imported file
  - `status` (string): Job status (PENDING, PROCESSING, COMPLETED, FAILED)
  - `progress` (integer): Progress percentage (0-100)
  - `errors` (array): Array of error objects
  - `createdAt` (string, ISO 8601): Creation timestamp
  - `updatedAt` (string, ISO 8601): Last update timestamp
- `pagination` (object): Pagination information
  - `page` (integer): Current page number
  - `limit` (integer): Items per page
  - `total` (integer): Total number of import jobs
  - `pages` (integer): Total number of pages

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/operational/export

Create export job

Create a new data export job (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "PRODUCTS",
  "format": "CSV",
  "filters": {
    "categoryId": "cat_123",
    "isActive": true,
    "minPrice": 10,
    "maxPrice": 1000
  }
}
```

**Request Body Fields:**
- `type` (string, **required**): Export type
  - Allowed values: `PRODUCTS`, `ORDERS`, `USERS`, `ANALYTICS`
  - Example: `"PRODUCTS"`
- `format` (string, optional): Export file format (default: `CSV`)
  - Allowed values: `CSV`, `JSON`, `EXCEL`
  - Example: `"CSV"`
- `filters` (object, optional): Filter criteria for exported data
  - For PRODUCTS: `categoryId`, `isActive`, `minPrice`, `maxPrice`, `brand`, `countryOfOrigin`, etc.
  - Example: `{"categoryId": "cat_123", "isActive": true}`

**Product Export Fields:**

When exporting `PRODUCTS`, the exported file (CSV/Excel/JSON) includes ALL product fields:

**Basic Fields:**
- `id`: Product ID
- `name`: Product name
- `description`: Product description
- `slug`: URL-friendly slug
- `price`: Current selling price
- `compareAtPrice`: MSRP or "was" price
- `originalPrice`: Original selling price before discounts
- `sku`: Stock Keeping Unit
- `images`: Comma-separated image URLs (in CSV)
- `categoryId`: Category ID
- `isActive`: Product active status

**Product Information Fields:**
- `badges`: Comma-separated badges (in CSV)
- `specifications`: JSON string (in CSV) or object (in JSON/Excel)
- `certifications`: Comma-separated certifications (in CSV)
- `warrantyInfo`: Warranty information

**Policy Fields (JSON strings in CSV, objects in JSON/Excel):**
- `returnPolicy`: Return policy details
- `refundPolicy`: Refund policy details
- `shippingPolicy`: Shipping policy details
- `exchangePolicy`: Exchange policy details
- `cancellationPolicy`: Cancellation policy details

**Additional Information Fields:**
- `careInstructions`: Care and maintenance instructions
- `countryOfOrigin`: Country of origin
- `manufacturerInfo`: JSON string (in CSV) or object (in JSON/Excel)
- `brand`: Product brand name
- `modelNumber`: Product model number
- `weightDimensions`: JSON string (in CSV) or object (in JSON/Excel)

**Order Limits:**
- `minOrderQuantity`: Minimum order quantity
- `maxOrderQuantity`: Maximum order quantity

**Timestamps:**
- `createdAt`: Creation timestamp (ISO 8601)
- `updatedAt`: Last update timestamp (ISO 8601)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "export_1234567890",
    "type": "PRODUCTS",
    "format": "CSV",
    "status": "PENDING",
    "filters": {
      "categoryId": "cat_123",
      "isActive": true
    },
    "createdAt": "2025-12-31T05:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "type",
      "message": "\"type\" is required"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/operational/export

Get export jobs

Retrieve list of export jobs (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status
  - Allowed values: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`

**Example Request:**
```
GET /api/v1/operational/export?page=1&limit=20&status=COMPLETED
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "export_1234567890",
      "type": "PRODUCTS",
      "format": "CSV",
      "status": "COMPLETED",
      "filters": {
        "categoryId": "cat_123",
        "isActive": true
      },
      "fileUrl": "https://cdn.example.com/exports/export_1234567890.csv",
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/operational/cron

Get cron jobs

Retrieve list of scheduled cron jobs (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cron_1234567890",
      "name": "Daily Inventory Sync",
      "schedule": "0 2 * * *",
      "task": "syncInventory",
      "isActive": true,
      "lastRunAt": "2025-12-31T02:00:00.000Z",
      "nextRunAt": "2026-01-01T02:00:00.000Z",
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:00:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of cron job objects
  - `id` (string): Cron job ID
  - `name` (string): Cron job name
  - `schedule` (string): Cron schedule expression (e.g., "0 2 * * *" for daily at 2 AM)
  - `task` (string): Task to execute
  - `isActive` (boolean): Whether the cron job is active
  - `lastRunAt` (string, ISO 8601, nullable): Last execution timestamp
  - `nextRunAt` (string, ISO 8601, nullable): Next scheduled execution timestamp
  - `createdAt` (string, ISO 8601): Creation timestamp
  - `updatedAt` (string, ISO 8601): Last update timestamp

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/operational/cron/:id

Update cron job

Update a scheduled cron job (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, **required**): Cron job ID
  - Example: `"cron_1234567890"`

**Request Body:**
```json
{
  "schedule": "0 3 * * *",
  "isActive": true
}
```

**Request Body Fields:**
- `schedule` (string, optional): Cron schedule expression
  - Type: string
  - Format: Cron expression (e.g., "0 2 * * *" for daily at 2 AM)
  - Example: `"0 3 * * *"`
- `isActive` (boolean, optional): Whether the cron job is active
  - Type: boolean
  - Example: `true`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cron_1234567890",
    "name": "Daily Inventory Sync",
    "schedule": "0 3 * * *",
    "task": "syncInventory",
    "isActive": true,
    "lastRunAt": "2025-12-31T02:00:00.000Z",
    "nextRunAt": "2026-01-01T03:00:00.000Z",
    "updatedAt": "2025-12-31T05:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "schedule",
      "message": "Invalid cron expression"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Cron job not found
```json
{
  "success": false,
  "error": "Cron job not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/operational/webhooks

Get webhooks

Retrieve list of configured webhooks (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "webhook_1234567890",
      "name": "Order Webhook",
      "url": "https://example.com/webhooks/orders",
      "events": ["order.created", "order.updated"],
      "isActive": true,
      "lastTriggeredAt": "2025-12-31T05:00:00.000Z",
      "createdAt": "2025-12-31T05:00:00.000Z",
      "updatedAt": "2025-12-31T05:00:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of webhook objects
  - `id` (string): Webhook ID
  - `name` (string): Webhook name
  - `url` (string, URI): Webhook URL
  - `events` (array of strings): Events to subscribe to
  - `isActive` (boolean): Whether the webhook is active
  - `lastTriggeredAt` (string, ISO 8601, nullable): Last trigger timestamp
  - `createdAt` (string, ISO 8601): Creation timestamp
  - `updatedAt` (string, ISO 8601): Last update timestamp

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/operational/webhooks

Create webhook

Create a new webhook configuration (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com/webhooks/orders",
  "events": ["order.created", "order.updated", "order.cancelled"],
  "secret": "webhook_secret_key_12345"
}
```

**Request Body Fields:**
- `url` (string, **required**): Webhook URL
  - Type: string (URI)
  - Format: Valid HTTP/HTTPS URL
  - Example: `"https://example.com/webhooks/orders"`
- `events` (array of strings, **required**): Events to subscribe to
  - Type: array of strings
  - Example: `["order.created", "order.updated"]`
  - Common events: `order.created`, `order.updated`, `order.cancelled`, `payment.succeeded`, `payment.failed`, `product.created`, `product.updated`
- `secret` (string, optional): Webhook secret for verification
  - Type: string
  - Description: Secret key for webhook signature verification
  - Example: `"webhook_secret_key_12345"`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "webhook_1234567890",
    "name": null,
    "url": "https://example.com/webhooks/orders",
    "events": ["order.created", "order.updated", "order.cancelled"],
    "secret": "webhook_secret_key_12345",
    "isActive": true,
    "lastTriggeredAt": null,
    "createdAt": "2025-12-31T05:00:00.000Z",
    "updatedAt": "2025-12-31T05:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "url",
      "message": "\"url\" is required"
    },
    {
      "field": "events",
      "message": "\"events\" must be an array"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/operational/webhooks/logs

Get webhook logs

Retrieve webhook execution logs (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `webhookId` (string, optional): Filter by webhook ID
  - Type: string
  - Example: `"webhook_1234567890"`
- `status` (string, optional): Filter by status
  - Type: string
  - Allowed values: `SUCCESS`, `FAILED`, `PENDING`
  - Example: `"SUCCESS"`

**Example Request:**
```
GET /api/v1/operational/webhooks/logs?webhookId=webhook_1234567890&status=SUCCESS
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "log_1234567890",
      "webhookId": "webhook_1234567890",
      "event": "order.created",
      "payload": {
        "orderId": "order_123",
        "status": "CREATED"
      },
      "response": {
        "status": 200,
        "body": "OK"
      },
      "status": 200,
      "createdAt": "2025-12-31T05:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of webhook log objects
  - `id` (string): Log ID
  - `webhookId` (string): Webhook ID
  - `event` (string): Event type that triggered the webhook
  - `payload` (object): Payload sent to webhook
  - `response` (object, nullable): Response from webhook endpoint
  - `status` (integer, nullable): HTTP status code from webhook response
  - `createdAt` (string, ISO 8601): Log creation timestamp
- `pagination` (object): Pagination information
  - `page` (integer): Current page number
  - `limit` (integer): Items per page
  - `total` (integer): Total number of logs
  - `pages` (integer): Total number of pages

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/operational/import/:jobId/status

Get import job status with progress tracking

Get import job status with progress tracking

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `jobId` (string, **required**): Import job ID
  - Example: `"import_1234567890"`

**Example Request:**
```
GET /api/v1/operational/import/import_1234567890/status
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobId": "import_1234567890",
    "status": "processing",
    "progress": 65,
    "processed": 650,
    "total": 1000,
    "successful": 640,
    "failed": 10,
    "errors": [
      {
        "row": 123,
        "error": "Invalid SKU format",
        "data": {
          "name": "Product Name",
          "sku": "INVALID-SKU"
        }
      }
    ],
    "startedAt": "2025-12-31T05:00:00.000Z",
    "estimatedCompletion": "2025-12-31T05:05:00.000Z"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Import job status information
  - `jobId` (string): Import job ID
  - `status` (string): Job status
    - Allowed values: `queued`, `processing`, `completed`, `failed`
    - `queued`: Job is waiting to be processed
    - `processing`: Job is currently being processed
    - `completed`: Job completed successfully
    - `failed`: Job failed with errors
  - `progress` (integer): Progress percentage (0-100)
    - Minimum: 0
    - Maximum: 100
  - `processed` (integer): Number of items processed
  - `total` (integer): Total number of items to process
  - `successful` (integer): Number of successful imports
  - `failed` (integer): Number of failed imports
  - `errors` (array): Array of error objects
    - Each error object contains:
      - `row` (integer): Row number where error occurred
      - `error` (string): Error message
      - `data` (object, optional): Row data that caused the error
  - `startedAt` (string, ISO 8601): Job start timestamp
  - `estimatedCompletion` (string, ISO 8601, nullable): Estimated completion timestamp

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Job not found
```json
{
  "success": false,
  "error": "Import job not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/operational/import/:jobId/result

Get import job result

Get import job result after completion

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `jobId` (string, **required**): Import job ID
  - Example: `"import_1234567890"`

**Example Request:**
```
GET /api/v1/operational/import/import_1234567890/result
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobId": "import_1234567890",
    "status": "completed",
    "processed": 1000,
    "successful": 990,
    "failed": 10,
    "resultFile": "https://cdn.example.com/exports/import_1234567890_result.csv",
    "errors": [
      {
        "row": 123,
        "error": "Invalid SKU format",
        "data": {
          "name": "Product Name",
          "sku": "INVALID-SKU",
          "price": 99.99
        }
      }
    ],
    "completedAt": "2025-12-31T05:05:00.000Z"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Import job result information
  - `jobId` (string): Import job ID
  - `status` (string): Final job status
    - Allowed values: `completed`, `failed`
    - `completed`: Job completed successfully (may have some failed items)
    - `failed`: Job failed completely
  - `processed` (integer): Total number of items processed
  - `successful` (integer): Number of successful imports
  - `failed` (integer): Number of failed imports
  - `resultFile` (string, URI, nullable): URL to download result file with detailed results
    - Format: URI
    - Contains: Detailed import results, errors, and statistics
  - `errors` (array): Array of error objects
    - Each error object contains:
      - `row` (integer): Row number where error occurred
      - `error` (string): Error message
      - `data` (object, optional): Row data that caused the error
  - `completedAt` (string, ISO 8601): Job completion timestamp

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Job not found
```json
{
  "success": false,
  "error": "Import job not found"
}
```

**422 Unprocessable Entity** - Job not completed yet
```json
{
  "success": false,
  "error": "Job is still processing",
  "code": "JOB_NOT_COMPLETED"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```
  "success": false,
  "error": "Import job not found"
}
```

**422 Unprocessable Entity** - Job not completed yet
```json
{
  "success": false,
  "error": "Job is still processing",
  "code": "JOB_NOT_COMPLETED"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 34. Media & Image Upload

### POST /api/v1/media/upload

Upload a single image file with automatic optimization and thumbnail generation.

**Permissions**: Authenticated (Bearer token required) - Admin/Vendor can upload

**Request:**
- **Method**: POST
- **Content-Type**: multipart/form-data

**Request Body:**
- `file` (File, required): Image file (JPEG, PNG, WebP, GIF)
- `folder` (string, optional): Folder path for organization (e.g., "products", "users", "categories")
- `optimize` (boolean, optional, default: true): Whether to optimize image
- `maxWidth` (number, optional): Maximum width for resizing
- `maxHeight` (number, optional): Maximum height for resizing
- `quality` (number, optional, default: 0.8): Compression quality (0-1)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "img_1234567890",
    "url": "https://cdn.example.com/images/products/img_1234567890.jpg",
    "thumbnailUrl": "https://cdn.example.com/images/products/thumbnails/img_1234567890.jpg",
    "originalUrl": "https://cdn.example.com/images/products/original/img_1234567890.jpg",
    "filename": "product-image.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "width": 1920,
    "height": 1080,
    "folder": "products",
    "uploadedAt": "2025-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "file",
      "message": "File is required",
      "code": "FILE_REQUIRED"
    }
  ],
  "requestId": "req_1234567890",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**413 Payload Too Large** - File exceeds maximum size (10MB default)
```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 10MB",
  "code": "FILE_TOO_LARGE"
}
```

**415 Unsupported Media Type** - File type not allowed
```json
{
  "success": false,
  "error": "File type not allowed. Allowed types: JPEG, PNG, WebP, GIF",
  "code": "INVALID_FILE_TYPE"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "UPLOAD_FAILED"
}
```

---

### POST /api/v1/media/upload-multiple

Upload multiple image files in a single request.

**Permissions**: Authenticated (Bearer token required)

**Request:**
- **Method**: POST
- **Content-Type**: multipart/form-data

**Request Body:**
- `files` (File[], required): Array of image files (max 10 files)
- `folder` (string, optional): Folder path for organization
- `optimize` (boolean, optional, default: true): Whether to optimize images

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "img_1234567890",
      "url": "https://cdn.example.com/images/products/img_1234567890.jpg",
      "thumbnailUrl": "https://cdn.example.com/images/products/thumbnails/img_1234567890.jpg",
      "originalUrl": "https://cdn.example.com/images/products/original/img_1234567890.jpg",
      "filename": "product-image-1.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "width": 1920,
      "height": 1080,
      "folder": "products",
      "uploadedAt": "2025-12-28T10:00:00.000Z"
    }
  ],
  "uploaded": 5,
  "failed": 0,
  "errors": []
}
```

**Error Responses:**

**400 Bad Request** - Validation error or too many files
```json
{
  "success": false,
  "error": "Maximum 10 files allowed per request",
  "code": "TOO_MANY_FILES"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**413 Payload Too Large** - Total size exceeds limit
```json
{
  "success": false,
  "error": "Total file size exceeds maximum limit",
  "code": "FILE_TOO_LARGE"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/media/upload-chunk

Upload file in chunks for large files (>10MB).

**Permissions**: Authenticated (Bearer token required)

**Request:**
- **Method**: POST
- **Content-Type**: multipart/form-data

**Request Body:**
- `file` (File, required): Chunk of the file
- `uploadId` (string, required): Unique upload session ID
- `chunkNumber` (number, required): Current chunk number (0-indexed)
- `totalChunks` (number, required): Total number of chunks
- `filename` (string, required): Original filename
- `totalSize` (number, required): Total file size in bytes
- `folder` (string, optional): Folder path

**Response (200 OK - Intermediate Chunk):**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_1234567890",
    "chunkNumber": 2,
    "totalChunks": 5,
    "uploaded": 2097152,
    "totalSize": 10485760,
    "progress": 40,
    "completed": false
  }
}
```

**Response (200 OK - Final Chunk):**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_1234567890",
    "completed": true,
    "image": {
      "id": "img_1234567890",
      "url": "https://cdn.example.com/images/products/img_1234567890.jpg",
      "thumbnailUrl": "https://cdn.example.com/images/products/thumbnails/img_1234567890.jpg",
      "originalUrl": "https://cdn.example.com/images/products/original/img_1234567890.jpg",
      "filename": "large-image.jpg",
      "mimeType": "image/jpeg",
      "size": 10485760,
      "width": 5000,
      "height": 5000,
      "folder": "products",
      "uploadedAt": "2025-12-28T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid chunk data
```json
{
  "success": false,
  "error": "Invalid chunk number or missing required fields",
  "code": "CHUNK_VALIDATION_ERROR"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Upload session not found
```json
{
  "success": false,
  "error": "Upload session not found",
  "code": "UPLOAD_SESSION_NOT_FOUND"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/media/upload-status/:uploadId

Get upload progress status for chunked uploads.

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `uploadId` (path, required): Upload session ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_1234567890",
    "status": "uploading",
    "progress": 60,
    "uploadedChunks": 3,
    "totalChunks": 5,
    "uploadedBytes": 6291456,
    "totalBytes": 10485760,
    "estimatedTimeRemaining": 30,
    "error": null
  }
}
```

**Status Values:**
- `pending` - Upload session created, waiting for chunks
- `uploading` - Chunks are being uploaded
- `processing` - All chunks uploaded, processing file
- `completed` - Upload completed successfully
- `failed` - Upload failed

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Upload session not found
```json
{
  "success": false,
  "error": "Upload session not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/media/:imageId

Get image details and metadata.

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `imageId` (path, required): Image ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "img_1234567890",
    "url": "https://cdn.example.com/images/products/img_1234567890.jpg",
    "thumbnailUrl": "https://cdn.example.com/images/products/thumbnails/img_1234567890.jpg",
    "originalUrl": "https://cdn.example.com/images/products/original/img_1234567890.jpg",
    "filename": "product-image.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "width": 1920,
    "height": 1080,
    "folder": "products",
    "uploadedBy": "user_123",
    "uploadedAt": "2025-12-28T10:00:00.000Z",
    "metadata": {
      "exif": {
        "camera": "Canon EOS 5D",
        "iso": 400,
        "aperture": "f/2.8"
      },
      "colors": ["#FF5733", "#33FF57"],
      "dominantColor": "#FF5733"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Image not found
```json
{
  "success": false,
  "error": "Image not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/media/:imageId

Delete an uploaded image.

**Permissions**: Authenticated (Bearer token required) - Only owner or admin

**Parameters:**
- `imageId` (path, required): Image ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Not owner or admin
```json
{
  "success": false,
  "error": "Forbidden - You can only delete your own images"
}
```

**404 Not Found** - Image not found
```json
{
  "success": false,
  "error": "Image not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/media

List uploaded images with pagination and filters.

**Permissions**: Authenticated (Bearer token required)

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page
- `folder` (string, optional): Filter by folder
- `uploadedBy` (string, optional): Filter by uploader user ID
- `mimeType` (string, optional): Filter by MIME type
- `search` (string, optional): Search by filename

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "img_1234567890",
      "url": "https://cdn.example.com/images/products/img_1234567890.jpg",
      "filename": "product-image.jpg",
      "size": 245678,
      "mimeType": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "folder": "products",
      "uploadedBy": "user_123",
      "uploadedAt": "2025-12-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/media/:imageId/optimize

Optimize an existing image (re-compress, resize).

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `imageId` (path, required): Image ID

**Request Body:**
```json
{
  "maxWidth": 1920,
  "maxHeight": 1920,
  "quality": 0.8,
  "format": "webp"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "img_1234567890",
    "url": "https://cdn.example.com/images/products/img_1234567890.webp",
    "originalSize": 245678,
    "optimizedSize": 156789,
    "savings": 36.3
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Invalid optimization parameters",
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Image not found
```json
{
  "success": false,
  "error": "Image not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Image processing failed",
  "code": "IMAGE_PROCESSING_ERROR"
}
```

---

### POST /api/v1/media/:imageId/resize

Resize an existing image.

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `imageId` (path, required): Image ID

**Request Body:**
```json
{
  "width": 800,
  "height": 600,
  "maintainAspectRatio": true,
  "crop": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "img_1234567890",
    "url": "https://cdn.example.com/images/products/img_1234567890_resized.jpg",
    "width": 800,
    "height": 600,
    "size": 98765
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Invalid resize parameters",
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Image not found
```json
{
  "success": false,
  "error": "Image not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Image processing failed",
  "code": "IMAGE_PROCESSING_ERROR"
}
```

---

### GET /api/v1/media/:imageId/variants

Get all size variants of an image (thumbnail, medium, large, original).

**Permissions**: Authenticated (Bearer token required)

**Parameters:**
- `imageId` (path, required): Image ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "original": {
      "url": "https://cdn.example.com/images/products/original/img_1234567890.jpg",
      "width": 1920,
      "height": 1080,
      "size": 245678
    },
    "large": {
      "url": "https://cdn.example.com/images/products/large/img_1234567890.jpg",
      "width": 1200,
      "height": 675,
      "size": 156789
    },
    "medium": {
      "url": "https://cdn.example.com/images/products/medium/img_1234567890.jpg",
      "width": 800,
      "height": 450,
      "size": 98765
    },
    "thumbnail": {
      "url": "https://cdn.example.com/images/products/thumbnails/img_1234567890.jpg",
      "width": 300,
      "height": 300,
      "size": 12345
    }
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Image not found
```json
{
  "success": false,
  "error": "Image not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 35. Product Image Management

### POST /api/v1/products/:productId/images

Upload images for a specific product.

**Permissions**: Authenticated (Bearer token required) - Admin or product owner (vendor)

**Parameters:**
- `productId` (path, required): Product ID

**Request:**
- **Method**: POST
- **Content-Type**: multipart/form-data

**Request Body:**
- `images` (File[], required): Array of image files
- `setAsPrimary` (number, optional): Index of image to set as primary (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "productId": "prod_1234567890",
    "images": [
      {
        "id": "img_1234567890",
        "url": "https://cdn.example.com/images/products/img_1234567890.jpg",
        "isPrimary": true,
        "order": 0
      },
      {
        "id": "img_1234567891",
        "url": "https://cdn.example.com/images/products/img_1234567891.jpg",
        "isPrimary": false,
        "order": 1
      }
    ],
    "uploaded": 3
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Not admin or product owner
```json
{
  "success": false,
  "error": "Forbidden - You can only upload images for your own products"
}
```

**404 Not Found** - Product not found
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/products/:productId/images/reorder

Reorder product images.

**Permissions**: Authenticated (Bearer token required) - Admin or product owner

**Parameters:**
- `productId` (path, required): Product ID

**Request Body:**
```json
{
  "imageIds": ["img_1", "img_2", "img_3"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Images reordered successfully"
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Invalid image IDs or missing images",
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Not admin or product owner
```json
{
  "success": false,
  "error": "Forbidden - You can only reorder images for your own products"
}
```

**404 Not Found** - Product or image not found
```json
{
  "success": false,
  "error": "Product or image not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/products/:productId/images/:imageId/set-primary

Set an image as the primary product image.

**Permissions**: Authenticated (Bearer token required) - Admin or product owner

**Parameters:**
- `productId` (path, required): Product ID
- `imageId` (path, required): Image ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Primary image updated successfully"
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Not admin or product owner
```json
{
  "success": false,
  "error": "Forbidden - You can only update images for your own products"
}
```

**404 Not Found** - Product or image not found
```json
{
  "success": false,
  "error": "Product or image not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/products/:productId/images/:imageId

Delete a product image.

**Permissions**: Authenticated (Bearer token required) - Admin or product owner

**Parameters:**
- `productId` (path, required): Product ID
- `imageId` (path, required): Image ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Not admin or product owner
```json
{
  "success": false,
  "error": "Forbidden - You can only delete images for your own products"
}
```

**404 Not Found** - Product or image not found
```json
{
  "success": false,
  "error": "Product or image not found"
}
```

**409 Conflict** - Cannot delete primary image
```json
{
  "success": false,
  "error": "Cannot delete primary image. Set another image as primary first",
  "code": "CANNOT_DELETE_PRIMARY"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 36. Batch Requests

### POST /api/v1/batch

Execute multiple API requests in a single HTTP request.

**Permissions**: Authenticated (Bearer token required)

**Request Body:**
```json
{
  "requests": [
    {
      "method": "GET",
      "path": "/products/prod_123"
    },
    {
      "method": "GET",
      "path": "/products/prod_456"
    },
    {
      "method": "POST",
      "path": "/cart/add",
      "body": {
        "productId": "prod_789",
        "quantity": 2
      }
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "status": 200,
      "body": {
        "success": true,
        "data": {
          "id": "prod_123",
          "name": "Product 1"
        }
      }
    },
    {
      "status": 200,
      "body": {
        "success": true,
        "data": {
          "id": "prod_456",
          "name": "Product 2"
        }
      }
    },
    {
      "status": 201,
      "body": {
        "success": true,
        "message": "Item added to cart"
      }
    }
  ]
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "requests",
      "message": "Maximum 20 requests allowed per batch",
      "code": "TOO_MANY_REQUESTS"
    }
  ]
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Limitations:**
- Maximum 20 requests per batch
- All requests use the same authentication token
- Requests are executed in parallel (with limits)
- Individual request failures don't fail the entire batch

---

## 37. Security

### POST /api/v1/security/2fa/setup

Setup two-factor authentication

Initialize 2FA setup and get QR code for authenticator app

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/security/2fa/verify

Verify 2FA setup

Verify and complete 2FA setup with a token from authenticator app

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/security/2fa/disable

Disable two-factor authentication

Disable 2FA for the user account

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/security/devices

Get trusted devices

Retrieve list of trusted devices for the user

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/security/devices/:id

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/security/sessions

Unauthorized

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/security/sessions/:id

Device ID

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/security/sessions

Device removed successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/security/login-attempts

Device removed successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/security/api-keys

Unauthorized

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/security/api-keys

Unauthorized

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/security/api-keys/:id

Device ID

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 32. Job Queue

### GET /api/v1/jobs/stats

Get queue stats

Retrieve job queue statistics (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/jobs/:queueName/jobs/:jobId

Get job

Retrieve details of a specific job (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/jobs/:queueName/jobs/:jobId/retry

Retry job

Retry a failed job (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/jobs/:queueName/jobs/:jobId

Remove job

Remove a job from the queue (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 39. Feature Flags

### GET /api/v1/feature-flags/:flagKey/evaluate

Evaluate feature flag

Check if a feature flag is enabled for the authenticated user

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/feature-flags/

Get all feature flags

Retrieve all feature flags (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/feature-flags/:flagKey

Get feature flag

Retrieve details of a specific feature flag (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/feature-flags/

Create feature flag

Create a new feature flag (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/feature-flags/:flagKey

Update feature flag

Update an existing feature flag (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/feature-flags/:flagKey/stats

Get feature flag usage stats

Retrieve usage statistics for a feature flag (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/feature-flags/:flagKey/rules

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/feature-flags/:flagKey/overrides

Unauthorized

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 40. CRM

### GET /api/v1/crm/customers/:userId/360

Get customer 360 view

Retrieve comprehensive 360-degree view of a customer (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/crm/customers/:userId/rfm

Get RFM analysis

Retrieve Recency, Frequency, Monetary analysis for a customer (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/crm/customers/:userId/tags

Add customer tag

Add a tag to a customer profile (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/crm/customers/:userId/notes

Add customer note

Add a note to a customer profile (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/crm/segments

Get customer segments

Retrieve customer segmentation data (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 41. Subscriptions

### POST /api/v1/subscriptions/:subscriptionId/pause

Pause subscription

Temporarily pause a subscription

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/subscriptions/:subscriptionId/resume

Resume subscription

Resume a paused subscription

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/subscriptions/:subscriptionId/skip

Skip next delivery

Skip the next scheduled delivery

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/subscriptions/:subscriptionId/frequency

Change subscription frequency

Update the delivery frequency of a subscription

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/subscriptions/:subscriptionId/cancel

Subscription ID

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 42. Product Management Advanced

### GET /api/v1/product-management/featured

Get featured products

Retrieve featured products

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/product-management/collections

Get product collections

Retrieve product collections

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/product-management/:productId/specifications

Get product specifications

Retrieve product specifications (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/product-management/:productId/specifications

Update product specifications

Update product specifications (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/product-management/featured

Set featured products

Set which products are featured (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 43. Monitoring

### GET /api/v1/monitoring/health

Get system health

Retrieve system health status

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/monitoring/metrics

Get system metrics

Retrieve detailed system metrics (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 44. Search Index

### GET /api/v1/search/search

Search indexed products

Search products using the search index

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/search/index/:productId

Index product

Index a single product in the search index (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/search/index/batch

Batch index products

Index multiple products in batch (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/search/reindex/all

Reindex all products

Reindex all products in the search index (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/search/reindex/category/:categoryId

Reindex category

Reindex all products in a category (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 45. Advanced Inventory

### POST /api/v1/inventory/advanced/:productId/reorder-point

Calculate reorder point

Calculate optimal reorder point for a product (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/inventory/advanced/transfer

Transfer stock

Transfer stock between locations or warehouses (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/inventory/advanced/cycle-count

Record cycle count

Record physical inventory count for cycle counting (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/inventory/advanced/aging-report

Get inventory aging report

Retrieve inventory aging analysis report (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/inventory/advanced/shrinkage

Record inventory shrinkage

Record inventory loss due to theft, damage, or other reasons (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 46. Customer Service Enhanced

### POST /api/v1/customer-service/track-order

Track order without login

Track an order using order number and email (no authentication required)

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/customer-service/knowledge-base

Get knowledge base articles

Retrieve knowledge base articles

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/customer-service/troubleshooting

Get troubleshooting guides

Retrieve troubleshooting guides

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/customer-service/video-tutorials

Get video tutorials

Retrieve video tutorials

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/customer-service/callback

Schedule callback

Schedule a callback from customer service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 47. Social Commerce

### GET /api/v1/social/ugc

Get user-generated content

Retrieve user-generated content (reviews, photos, videos) for products

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/social/login

Social login

Authenticate using social media providers (Facebook, Google, Apple)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/social/products/:productId/share

Share product on social media

Share a product on social media platforms

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/social/ugc

Submit user-generated content

Submit user-generated content (photos, videos) for products

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/social/influencers

Content URL or base64

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 48. Advanced Admin

### POST /api/v1/admin/advanced/orders/:orderId/notes

Add order note

Add a note to an order (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/advanced/orders/:orderId/notes

Get order notes

Retrieve all notes for an order (Admin only)

**Permissions**: Admin (Bearer token required)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "orderId": "cmlhdwfwz000834y2hdo54gtr",
      "adminId": "admin_user_id",
      "note": "Customer requested delay.",
      "isInternal": true,
      "createdAt": "2025-02-11T08:00:00.000Z",
      "admin": {
        "id": "admin_user_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

Each note may include `admin` (with `id`, `firstName`, `lastName`, `email`) when the note was added by an admin. The `User` model has no `name` field; use `firstName` and `lastName` for display.

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/admin/advanced/orders/:orderId/tasks

Assign order task

Assign a task to an admin user for an order (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/advanced/activity

Get admin activity feed

Retrieve recent admin activity feed (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/advanced/notifications

Get admin notifications

Retrieve admin-specific notifications (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/admin/advanced/notifications/:notificationId/read

Get admin notifications

Retrieve admin-specific notifications (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/admin/advanced/filters

Notifications retrieved successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/admin/advanced/filters

Number of activities to retrieve

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 49. Advanced Analytics

Advanced analytics features including predictions, real-time dashboards, and attribution.

### POST /api/v1/analytics/advanced/orders/:orderId/utm

Track UTM parameters

Track UTM parameters for order attribution

**Permissions**: Public (No authentication required)

**Path Parameters:**
- `orderId` (string, **required**): Order ID
  - Example: `"order_1234567890"`

**Request Body:**
```json
{
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer_sale",
  "utm_term": "headphones",
  "utm_content": "ad_variant_1"
}
```

**Request Body Fields:**
- `utm_source` (string, optional): UTM source parameter (e.g., "google", "facebook", "email")
  - Example: `"google"`
- `utm_medium` (string, optional): UTM medium parameter (e.g., "cpc", "email", "social")
  - Example: `"cpc"`
- `utm_campaign` (string, optional): UTM campaign parameter
  - Example: `"summer_sale"`
- `utm_term` (string, optional): UTM term parameter (typically used for paid search keywords)
  - Example: `"headphones"`
- `utm_content` (string, optional): UTM content parameter (used to differentiate similar content/links)
  - Example: `"ad_variant_1"`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "UTM parameters tracked"
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `message` (string): Success message

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "errors": [
    {
      "field": "orderId",
      "message": "Invalid order ID format"
    }
  ]
}
```

**404 Not Found** - Order not found
```json
{
  "success": false,
  "error": "Order not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/advanced/users/:userId/churn

Predict user churn

Predict likelihood of user churn (requires authentication)

**Permissions**: Authenticated (Bearer token required)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId` (string, **required**): User ID
  - Example: `"user_1234567890"`

**Example Request:**
```
GET /api/v1/analytics/advanced/users/user_1234567890/churn
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user_1234567890",
    "churnProbability": 0.5,
    "daysSinceLastOrder": 45,
    "totalOrders": 3,
    "riskLevel": "MEDIUM"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Churn prediction data
  - `userId` (string): User ID
  - `churnProbability` (number): Churn probability score (0-1)
    - 0 = Very unlikely to churn
    - 1 = Very likely to churn
  - `daysSinceLastOrder` (integer): Number of days since last order (999 if no orders)
  - `totalOrders` (integer): Total number of completed orders
  - `riskLevel` (string): Risk level classification
    - Allowed values: `LOW`, `MEDIUM`, `HIGH`
    - `LOW`: churnProbability <= 0.4
    - `MEDIUM`: 0.4 < churnProbability <= 0.7
    - `HIGH`: churnProbability > 0.7

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "error": "User not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/advanced/users/:userId/affinity/:productId

Predict product affinity

Predict user's affinity for a specific product

**Permissions**: Authenticated (Bearer token required)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId` (string, **required**): User ID
  - Example: `"user_1234567890"`
- `productId` (string, **required**): Product ID
  - Example: `"prod_1234567890"`

**Example Request:**
```
GET /api/v1/analytics/advanced/users/user_1234567890/affinity/prod_1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user_1234567890",
    "productId": "prod_1234567890",
    "affinityScore": 0.7,
    "recommendation": "STRONG"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Product affinity prediction
  - `userId` (string): User ID
  - `productId` (string): Product ID
  - `affinityScore` (number): Affinity score (0-1)
    - 0 = No affinity
    - 1 = Strong affinity
  - `recommendation` (string): Recommendation strength
    - Allowed values: `WEAK`, `MODERATE`, `STRONG`
    - `WEAK`: affinityScore <= 0.3
    - `MODERATE`: 0.3 < affinityScore <= 0.5
    - `STRONG`: affinityScore > 0.5

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - User or product not found
```json
{
  "success": false,
  "error": "User not found"
}
```
or
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/advanced/users/:userId/next-product

Get next best product

Get recommended next product for a user

**Permissions**: Authenticated (Bearer token required)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId` (string, **required**): User ID
  - Example: `"user_1234567890"`

**Example Request:**
```
GET /api/v1/analytics/advanced/users/user_1234567890/next-product
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1234567890",
      "name": "Premium Wireless Headphones",
      "description": "High-quality wireless headphones",
      "price": "199.99",
      "category": {
        "id": "cat_123",
        "name": "Electronics"
      },
      "inventory": [
        {
          "stock": 50
        }
      ]
    }
  ]
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of recommended products (up to 10 products)
  - Each product object includes:
    - `id` (string): Product ID
    - `name` (string): Product name
    - `description` (string): Product description
    - `price` (string, decimal): Product price
    - `category` (object): Category information
      - `id` (string): Category ID
      - `name` (string): Category name
    - `inventory` (array): Inventory information (if available)
      - `stock` (integer): Available stock

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "error": "User not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/advanced/users/:userId/attribution

Get multi-touch attribution

Get multi-touch attribution analysis for a user

**Permissions**: Authenticated (Bearer token required)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId` (string, **required**): User ID
  - Example: `"user_1234567890"`

**Query Parameters:**
- `startDate` (string, optional): Start date for attribution analysis
  - Type: string (ISO 8601 date format)
  - Default: 30 days ago
  - Example: `"2025-12-01T00:00:00.000Z"`
- `endDate` (string, optional): End date for attribution analysis
  - Type: string (ISO 8601 date format)
  - Default: Current date
  - Example: `"2025-12-31T23:59:59.999Z"`

**Example Request:**
```
GET /api/v1/analytics/advanced/users/user_1234567890/attribution?startDate=2025-12-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "firstTouch": {
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "summer_sale"
    },
    "lastTouch": {
      "utm_source": "email",
      "utm_medium": "email",
      "utm_campaign": "newsletter"
    },
    "touchpoints": [
      {
        "eventType": "PAGE_VIEW",
        "timestamp": "2025-12-15T10:00:00.000Z",
        "metadata": {
          "utm_source": "google",
          "utm_medium": "cpc"
        }
      },
      {
        "eventType": "PRODUCT_VIEW",
        "timestamp": "2025-12-15T10:05:00.000Z",
        "metadata": {}
      },
      {
        "eventType": "CART_ADD",
        "timestamp": "2025-12-15T10:10:00.000Z",
        "metadata": {}
      },
      {
        "eventType": "ORDER_PLACED",
        "timestamp": "2025-12-20T14:00:00.000Z",
        "metadata": {
          "utm_source": "email",
          "utm_medium": "email"
        }
      }
    ]
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Multi-touch attribution data
  - `firstTouch` (object): Metadata from the first touchpoint
    - Contains UTM parameters or other metadata from first interaction
  - `lastTouch` (object): Metadata from the last touchpoint
    - Contains UTM parameters or other metadata from last interaction before conversion
  - `touchpoints` (array): Array of all touchpoints in chronological order
    - Each touchpoint contains:
      - `eventType` (string): Event type
        - Allowed values: `PAGE_VIEW`, `PRODUCT_VIEW`, `CART_ADD`, `ORDER_PLACED`
      - `timestamp` (string, ISO 8601): Event timestamp
      - `metadata` (object): Event metadata (may include UTM parameters)

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "error": "User not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/advanced/dashboard/realtime

Get real-time dashboard

Retrieve real-time analytics dashboard data (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example Request:**
```
GET /api/v1/analytics/advanced/dashboard/realtime
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lastHour": {
      "orders": 15,
      "revenue": 2998.50,
      "activeUsers": 42
    },
    "last24Hours": {
      "orders": 127,
      "revenue": 25430.75
    },
    "timestamp": "2025-12-31T18:00:00.000Z"
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Real-time dashboard data
  - `lastHour` (object): Metrics from the last hour
    - `orders` (integer): Number of orders in the last hour (excluding cancelled)
    - `revenue` (number, decimal): Total revenue in the last hour
    - `activeUsers` (integer): Number of active users in the last hour
  - `last24Hours` (object): Metrics from the last 24 hours
    - `orders` (integer): Number of orders in the last 24 hours (excluding cancelled)
    - `revenue` (number, decimal): Total revenue in the last 24 hours
  - `timestamp` (string, ISO 8601): Timestamp when data was generated

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/advanced/orders/live

Get live orders

Retrieve live/real-time order data (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example Request:**
```
GET /api/v1/analytics/advanced/orders/live
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_1234567890",
      "orderNumber": "ORD-2025-001234",
      "status": "PAID",
      "total": "199.99",
      "user": {
        "id": "user_1234567890",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "id": "item_123",
          "productId": "prod_1234567890",
          "quantity": 1,
          "price": "199.99",
          "product": {
            "id": "prod_1234567890",
            "name": "Premium Wireless Headphones"
          }
        }
      ],
      "updatedAt": "2025-12-31T18:00:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (array): Array of live orders (up to 50 most recent)
  - Each order object includes:
    - `id` (string): Order ID
    - `orderNumber` (string): Order number
    - `status` (string): Order status
      - Allowed values: `PAID`, `PACKED`, `SHIPPED`
    - `total` (string, decimal): Order total
    - `user` (object): User information
      - `id` (string): User ID
      - `name` (string): User name (may be null)
      - `email` (string): User email
    - `items` (array): Order items
      - Each item includes:
        - `id` (string): Order item ID
        - `productId` (string): Product ID
        - `quantity` (integer): Item quantity
        - `price` (string, decimal): Item price
        - `product` (object): Product information
          - `id` (string): Product ID
          - `name` (string): Product name
    - `updatedAt` (string, ISO 8601): Last update timestamp

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/analytics/advanced/funnel

Get conversion funnel

Retrieve conversion funnel analysis (Admin only)

**Permissions**: Admin (Bearer token required)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (string, optional): Start date for funnel analysis
  - Type: string (ISO 8601 date format)
  - Default: 30 days ago
  - Example: `"2025-12-01T00:00:00.000Z"`
- `endDate` (string, optional): End date for funnel analysis
  - Type: string (ISO 8601 date format)
  - Default: Current date
  - Example: `"2025-12-31T23:59:59.999Z"`

**Example Request:**
```
GET /api/v1/analytics/advanced/funnel?startDate=2025-12-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "visitors": 10000,
    "productViews": 7500,
    "cartAdds": 2500,
    "checkouts": 1500,
    "orders": 1200,
    "conversionRates": {
      "visitorToView": 75.0,
      "viewToCart": 33.33,
      "cartToCheckout": 60.0,
      "checkoutToOrder": 80.0,
      "overall": 12.0
    }
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Conversion funnel data
  - `visitors` (integer): Total number of visitors (PAGE_VIEW events)
  - `productViews` (integer): Total number of product views (PRODUCT_VIEW events)
  - `cartAdds` (integer): Total number of cart additions (CART_ADD events)
  - `checkouts` (integer): Total number of checkout starts (CHECKOUT_STARTED events)
  - `orders` (integer): Total number of completed orders (PAID, PACKED, SHIPPED, DELIVERED, COMPLETED status)
  - `conversionRates` (object): Conversion rates between funnel stages (percentages)
    - `visitorToView` (number): Percentage of visitors who viewed products
    - `viewToCart` (number): Percentage of product viewers who added to cart
    - `cartToCheckout` (number): Percentage of cart additions that reached checkout
    - `checkoutToOrder` (number): Percentage of checkouts that resulted in orders
    - `overall` (number): Overall conversion rate from visitor to order

**Error Responses:**

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 50. Mobile Backend

### GET /api/v1/mobile/version

Get app version information

Check app version and update requirements

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/mobile/device/register

Register device for push notifications

Register a mobile device to receive push notifications

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/mobile/deep-link

Create deep link

Create a deep link for mobile app navigation

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/mobile/payment

Process mobile payment

Process payment through mobile payment methods

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/mobile/push

Payment processed successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 51. Internationalization

### GET /api/v1/i18n/products/:productId/price

Get regional price

Get product price for a specific region

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/i18n/products/:productId/availability

Get regional availability

Get product availability for a specific region

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/i18n/payment-methods

Get regional payment methods

Get available payment methods for a region

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/i18n/shipping-carriers

Get regional shipping carriers

Get available shipping carriers for a region

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/i18n/compliance

Get regional compliance

Get compliance requirements for a region

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/i18n/stores

Get stores

Retrieve list of stores (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/i18n/stores/:storeId

Get store

Retrieve details of a specific store (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/i18n/stores

Store ID

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 52. Advanced Payments

### POST /api/v1/payments/advanced/links

Create payment link

Create a shareable payment link for invoices or orders

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/payments/advanced/methods

Save payment method

Save a payment method for future use

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/payments/advanced/methods

Get saved payment methods

Retrieve user's saved payment methods

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/payments/advanced/route

Route payment

Route payment to different processors based on rules

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/payments/advanced/:paymentId/retry

Retry payment

Retry a failed payment

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/payments/advanced/split

Retry payment

Retry a failed payment

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/payments/advanced/reconcile

Payment retry initiated successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/payments/advanced/:paymentId/chargeback

Retry payment

Retry a failed payment

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 47. Shipping Carriers

### GET /api/v1/shipping/carriers/track/:trackingNumber

Track shipment

Track a shipment using tracking number

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/carriers/rates

Get all carrier rates

Get shipping rates from all available carriers

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/carriers/labels

Create shipping label

Create a shipping label for an order (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 54. Advanced Shipping

### POST /api/v1/shipping/advanced/address/validate

Validate address

Validate and standardize a shipping address

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/shipping/advanced/address/autocomplete

Autocomplete address

Get address suggestions as user types

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/address/detect-pobox

Detect PO Box

Detect if an address is a PO Box

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/address/detect-type

Detect address type

Detect address type (residential, commercial, etc.)

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/shipping/advanced/pickup-locations

Get available pickup locations

Retrieve list of available pickup locations

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/white-glove

Request white-glove delivery

Request premium white-glove delivery service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/signature

White-glove delivery requested successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/instructions

Request white-glove delivery

Request premium white-glove delivery service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/insurance

Request white-glove delivery

Request premium white-glove delivery service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/calculate-dim-weight

Request white-glove delivery

Request premium white-glove delivery service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/pickup-locations

Request white-glove delivery

Request premium white-glove delivery service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/route/optimize

Request premium white-glove delivery service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/shipping/advanced/packaging/optimize

Request premium white-glove delivery service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 55. Integrations

Third-party integrations endpoints for email, SMS, marketing, analytics, social media, CRM, ERP, WMS, and webhooks.

### POST /api/v1/integrations/email

Send email

Send an email through the configured email service

**Permissions**: Authenticated (Bearer token required)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Welcome to our store",
  "text": "Welcome! Thank you for joining us.",
  "html": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "attachments": [
    {
      "filename": "document.pdf",
      "path": "/path/to/document.pdf"
    }
  ]
}
```

**Request Body Fields:**
- `to` (string, **required**): Recipient email address
  - Format: email
  - Example: `"user@example.com"`
- `subject` (string, **required**): Email subject
  - Example: `"Welcome to our store"`
- `text` (string, **required**): Plain text email content
  - Example: `"Welcome! Thank you for joining us."`
- `html` (string, optional): HTML email content
  - Example: `"<h1>Welcome!</h1><p>Thank you for joining us.</p>"`
- `cc` (array, optional): CC recipients
  - Items: string (email format)
  - Example: `["cc@example.com"]`
- `bcc` (array, optional): BCC recipients
  - Items: string (email format)
  - Example: `["bcc@example.com"]`
- `attachments` (array, optional): Email attachments
  - Items: object with `filename`, `path`, or `content`
  - Example: `[{"filename": "document.pdf", "path": "/path/to/document.pdf"}]`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "<message-id@example.com>",
    "accepted": ["user@example.com"],
    "rejected": []
  }
}
```

**Response Fields:**
- `success` (boolean): Request success status
- `data` (object): Email sending result
  - `messageId` (string): Message ID from email service
  - `accepted` (array): Accepted recipient email addresses
  - `rejected` (array): Rejected recipient email addresses

**Error Responses:**

**400 Bad Request** - Invalid email data or missing required fields
```json
{
  "success": false,
  "error": "Missing required field: to"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**500 Internal Server Error** - Email service not configured or sending failed
```json
{
  "success": false,
  "error": "Email service not configured. Please configure email service in admin panel or set SMTP environment variables."
}
```

---

### POST /api/v1/integrations/sms

Send SMS

Send SMS through integrated SMS service

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/marketing/list

Add to marketing list

Add user to marketing email list

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/analytics/track

Track analytics event

Track custom analytics events

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/social/post

Post to social media

Post content to integrated social media platforms

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/crm/sync

Sync to CRM

Sync data to CRM system (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/erp/sync

Sync initiated successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/wms/sync

Sync initiated successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/webhooks

Sync initiated successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/integrations/webhooks/trigger

Sync initiated successfully

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 56. Compliance

### GET /api/v1/compliance/documents/:type

Get active legal document

Retrieve active legal document (terms, privacy policy, etc.)

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/compliance/users/:userId/export

Export user data

Export all user data for GDPR compliance

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### DELETE /api/v1/compliance/users/:userId/data

Delete user data

Delete all user data for GDPR right to be forgotten

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/compliance/acceptance

Record user acceptance

Record user acceptance of legal documents

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/compliance/acceptance/:documentType

Check user acceptance

Check if user has accepted a legal document

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/compliance/pci/status

Get PCI compliance status

Get PCI DSS compliance status (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/compliance/tax/avalara

PCI compliance status retrieved successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/compliance/tax/taxjar

PCI compliance status retrieved successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/compliance/tax/vat-moss

PCI compliance status retrieved successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/compliance/tax/gst

PCI compliance status retrieved successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/compliance/tax/nexus

PCI compliance status retrieved successfully

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/compliance/documents

Get PCI compliance status

Get PCI DSS compliance status (Admin only)

**Permissions**: Admin (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**403 Forbidden** - Admin access required
```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 57. API Gateway

### GET /api/v1/gateway/tier

Get user API tier

Retrieve the user's current API rate limiting tier

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/gateway/tier

Set user API tier

Update the user's API rate limiting tier

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/gateway/usage

Get API usage

Retrieve API usage statistics for the user

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/gateway/versions/:version

Get API version info

Retrieve information about a specific API version

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/gateway/versions/deprecate

Deprecate API version

Mark an API version as deprecated (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 58. API Deprecation

### GET /api/v1/deprecation/versioning-strategy

Get versioning strategy

Retrieve API versioning strategy information

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/deprecation/deprecation-policy

Get deprecation policy

Retrieve API deprecation policy

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/deprecation/notices

Get deprecation notices

Retrieve active deprecation notices

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/deprecation/versions/:version/lifecycle

Get version lifecycle

Retrieve lifecycle information for an API version

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/deprecation/compatibility-guarantees

Get compatibility guarantees

Retrieve API compatibility guarantees

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/deprecation/notices

Create deprecation notice

Create a new deprecation notice (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 59. Observability

### GET /api/v1/observability/sla

Get SLA definitions

Retrieve Service Level Agreement definitions

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/observability/slo

Get SLO definitions

Retrieve Service Level Objective definitions

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/observability/slo/:service/status

Get SLO status

Get current SLO status for a service

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/observability/alerts/thresholds

Get alert thresholds

Retrieve alert threshold configurations

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/observability/alerts/:service/check

Check alert conditions

Check if alert conditions are met for a service

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/observability/slo/:service/report

Generate SLO report

Generate SLO compliance report for a service

**Permissions**: Public

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 60. Multi-Tenant

### POST /api/v1/tenants/

Create tenant

Create a new tenant (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/tenants/

List tenants

Retrieve list of all tenants (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/tenants/:tenantId

Get tenant

Retrieve details of a specific tenant (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### PUT /api/v1/tenants/:tenantId

Update tenant

Update tenant configuration (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/tenants/:tenantId/stats

Get tenant stats

Retrieve statistics for a tenant (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 61. Migrations

### POST /api/v1/migrations/execute

Execute migration

Execute a database migration (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/migrations/zero-downtime

Execute zero-downtime migration

Execute a zero-downtime migration strategy (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/migrations/:migrationId/rollback

Rollback migration

Rollback a migration (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/migrations/rollout

Gradual rollout

Perform gradual rollout of a migration (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/migrations/compatibility

Check backward compatibility

Check if a migration maintains backward compatibility (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 62. Disaster Recovery

### GET /api/v1/disaster-recovery/rpo-rto

Get RPO/RTO definitions

Retrieve Recovery Point Objective and Recovery Time Objective definitions (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/v1/disaster-recovery/plan

Get disaster recovery plan

Retrieve disaster recovery plan (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/disaster-recovery/backups

Create backup

Create a manual backup (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/disaster-recovery/backups/schedule

Schedule backups

Configure automated backup schedule (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/disaster-recovery/backups/:backupId/restore

Restore backup

Restore from a backup (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/disaster-recovery/drills

Perform restore drill

Perform a disaster recovery drill (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/disaster-recovery/failover

Perform a disaster recovery drill (Admin only)

**Permissions**: Authenticated (Bearer token required)

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error"
}
```

**401 Unauthorized** - No token provided or invalid token
```json
{
  "success": false,
  "error": "No token, authorization denied"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Summary

This document provides comprehensive API reference documentation for the e-commerce backend.

**Total Endpoints**: 380+ (including /health endpoint and new media/image upload endpoints)
**Total Route Files**: 56

**Last Updated**: 2025-12-30

---

**For interactive API testing and complete Swagger documentation, visit `/api-docs` when the server is running.**

