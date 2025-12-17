# Catalog Context

## Overview
The Catalog context manages all product-related data, including products, categories, reviews, and search functionality.

## API Endpoints

### Products
- `GET /api/v1/products` - List products (with filters)
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (admin)
- `PUT /api/v1/products/:id` - Update product (admin)
- `DELETE /api/v1/products/:id` - Delete product (admin)
- `GET /api/v1/products/:id/variants` - Get product variants
- `POST /api/v1/products/:id/variants` - Create variant (admin)

### Categories
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/:id` - Get category details
- `POST /api/v1/categories` - Create category (admin)
- `PUT /api/v1/categories/:id` - Update category (admin)
- `DELETE /api/v1/categories/:id` - Delete category (admin)

### Search
- `GET /api/v1/search` - Search products
- `GET /api/v1/search/autocomplete` - Search autocomplete
- `GET /api/v1/search/suggestions` - Search suggestions

### Reviews
- `GET /api/v1/products/:id/reviews` - Get product reviews
- `POST /api/v1/products/:id/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `POST /api/v1/reviews/:id/helpful` - Mark review as helpful

### Recommendations
- `GET /api/v1/recommendations` - Get personalized recommendations
- `GET /api/v1/recommendations/trending` - Get trending products
- `GET /api/v1/recommendations/similar/:productId` - Get similar products

## Events Published

- `ProductCreated` - When a new product is created
- `ProductUpdated` - When a product is updated
- `ProductDeleted` - When a product is deleted
- `ProductStockChanged` - When product stock changes (read-only, from Inventory)
- `CategoryCreated` - When a new category is created
- `CategoryUpdated` - When a category is updated
- `CategoryDeleted` - When a category is deleted
- `ReviewCreated` - When a review is created
- `ReviewUpdated` - When a review is updated
- `ReviewDeleted` - When a review is deleted
- `ProductViewed` - When a product is viewed
- `SearchPerformed` - When a search is performed

## Events Subscribed

- `OrderPlaced` (from Orders) - Update recently viewed, recommendations
- `UserCreated` (from Auth) - Initialize user preferences for recommendations

## Data Models

- `Product` - Products
- `ProductVariant` - Product variants (size, color, etc.)
- `Category` - Product categories
- `Review` - Product reviews
- `ProductBundle` - Product bundles
- `ProductRecommendation` - Product recommendations
- `DigitalProduct` - Digital/downloadable products
- `Subscription` - Subscription products
- `PreOrder` - Pre-order products
- `ProductCustomization` - Product customization options
- `RecentlyViewed` - Recently viewed products
- `SavedSearch` - Saved searches
- `ProductQuestion` - Product Q&A
- `SizeGuide` - Size guides
- `ProductVideo` - Product videos
- `SocialProof` - Social proof data
- `Waitlist` - Waitlist for out-of-stock items
- `ProductAlert` - Product alerts (price drop, back in stock)

## Dependencies

- Database: PostgreSQL (Prisma)
- Search: PostgreSQL full-text search or Elasticsearch
- Cache: Redis (product listings, search results)
- Image Storage: S3 or local storage
- Search Index: Real-time indexing service

## Cross-Context Rules

- Inventory context can READ product data but not modify it
- Orders context can READ product data for order creation
- Only Catalog context can create/update/delete products
- Product stock levels are owned by Inventory context
- Catalog context displays inventory data but doesn't modify it


