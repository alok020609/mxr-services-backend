const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get list of products with filters
 *     description: Retrieve a paginated list of products with optional filtering and sorting
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ID filter
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price, name, createdAt]
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Validation error - invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /api/v1/products/search:
 *   get:
 *     summary: Search products
 *     description: Search products by query string
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Validation error - missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Validation error"
 *               errors:
 *                 - field: "q"
 *                   message: "\"q\" is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', productController.searchProducts);

/**
 * @swagger
 * /api/v1/products/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories', productController.getCategories);

/**
 * @swagger
 * /api/v1/products/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Not Found - /api/v1/products/categories/cat-123"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories/:id', productController.getCategory);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product details
 *     description: Retrieve detailed information about a specific product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', productController.getProduct);

// Admin routes
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create new product
 *     description: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - sku
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "Premium Wireless Headphones"
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "High-quality wireless headphones with noise cancellation"
 *               slug:
 *                 type: string
 *                 description: URL-friendly product slug (auto-generated if not provided)
 *                 example: "premium-wireless-headphones"
 *               price:
 *                 type: number
 *                 format: decimal
 *                 description: Current selling price
 *                 example: 199.99
 *                 minimum: 0
 *               compareAtPrice:
 *                 type: number
 *                 format: decimal
 *                 description: Manufacturer's suggested retail price (MSRP) or "was" price for display
 *                 example: 249.99
 *                 minimum: 0
 *               originalPrice:
 *                 type: number
 *                 format: decimal
 *                 description: Original selling price before any discounts or promotions
 *                 example: 219.99
 *                 minimum: 0
 *               sku:
 *                 type: string
 *                 description: Stock Keeping Unit (unique identifier)
 *                 example: "SKU-HEAD-001"
 *               stock:
 *                 type: integer
 *                 description: Initial stock quantity
 *                 default: 0
 *                 minimum: 0
 *                 example: 100
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Array of product image URLs
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *                 example: "cat_123"
 *               badges:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product badges (e.g., "New", "Sale", "Featured")
 *                 example: ["New", "Featured"]
 *               specifications:
 *                 type: object
 *                 description: Product specifications as JSON object
 *                 example: {"color": "Black", "material": "Plastic", "connectivity": "Bluetooth 5.0"}
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product certifications
 *                 example: ["CE", "FCC", "RoHS"]
 *               warrantyInfo:
 *                 type: string
 *                 description: Warranty information
 *                 example: "1 year manufacturer warranty"
 *               returnPolicy:
 *                 type: object
 *                 description: Return policy details (JSON object)
 *                 properties:
 *                   window:
 *                     type: string
 *                     example: "30 days"
 *                   conditions:
 *                     type: string
 *                     example: "Item must be unused, in original packaging"
 *                   process:
 *                     type: string
 *                     example: "Contact support to initiate return"
 *                   shippingCost:
 *                     type: string
 *                     example: "Customer pays return shipping"
 *                 example:
 *                   window: "30 days"
 *                   conditions: "Item must be unused, in original packaging"
 *                   process: "Contact support to initiate return"
 *                   shippingCost: "Customer pays return shipping"
 *               refundPolicy:
 *                 type: object
 *                 description: Refund policy details (JSON object)
 *                 properties:
 *                   method:
 *                     type: string
 *                     example: "original payment method"
 *                   timeline:
 *                     type: string
 *                     example: "7-14 business days"
 *                   conditions:
 *                     type: string
 *                     example: "Refund processed after item inspection"
 *                 example:
 *                   method: "original payment method"
 *                   timeline: "7-14 business days"
 *                   conditions: "Refund processed after item inspection"
 *               shippingPolicy:
 *                 type: object
 *                 description: Shipping policy details (JSON object)
 *                 properties:
 *                   deliveryTime:
 *                     type: string
 *                     example: "3-5 business days"
 *                   methods:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["standard", "express"]
 *                   costs:
 *                     type: object
 *                     example:
 *                       standard: 5.99
 *                       express: 12.99
 *                   freeShippingThreshold:
 *                     type: number
 *                     example: 50.00
 *                 example:
 *                   deliveryTime: "3-5 business days"
 *                   methods: ["standard", "express"]
 *                   costs:
 *                     standard: 5.99
 *                     express: 12.99
 *                   freeShippingThreshold: 50.00
 *               exchangePolicy:
 *                 type: object
 *                 description: Exchange policy details (JSON object)
 *                 properties:
 *                   window:
 *                     type: string
 *                     example: "30 days"
 *                   conditions:
 *                     type: string
 *                     example: "Item must be unused"
 *                   process:
 *                     type: string
 *                     example: "Contact support for exchange"
 *                 example:
 *                   window: "30 days"
 *                   conditions: "Item must be unused"
 *                   process: "Contact support for exchange"
 *               cancellationPolicy:
 *                 type: object
 *                 description: Cancellation policy details (JSON object)
 *                 properties:
 *                   window:
 *                     type: string
 *                     example: "24 hours"
 *                   terms:
 *                     type: string
 *                     example: "Full refund if cancelled within 24 hours of order"
 *                 example:
 *                   window: "24 hours"
 *                   terms: "Full refund if cancelled within 24 hours of order"
 *               careInstructions:
 *                 type: string
 *                 description: Care and maintenance instructions
 *                 example: "Clean with soft cloth. Do not immerse in water."
 *               countryOfOrigin:
 *                 type: string
 *                 description: Country where the product was manufactured
 *                 example: "China"
 *               manufacturerInfo:
 *                 type: object
 *                 description: Manufacturer information (JSON object)
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Manufacturer Name"
 *                   contact:
 *                     type: string
 *                     format: email
 *                     example: "support@manufacturer.com"
 *                   address:
 *                     type: string
 *                     example: "123 Street, City, Country"
 *                   website:
 *                     type: string
 *                     format: uri
 *                     example: "https://manufacturer.com"
 *                 example:
 *                   name: "Manufacturer Name"
 *                   contact: "support@manufacturer.com"
 *                   address: "123 Street, City, Country"
 *                   website: "https://manufacturer.com"
 *               brand:
 *                 type: string
 *                 description: Product brand name
 *                 example: "TechBrand"
 *               modelNumber:
 *                 type: string
 *                 description: Product model number
 *                 example: "TB-HEAD-2024"
 *               weightDimensions:
 *                 type: object
 *                 description: Weight and dimensions (JSON object)
 *                 properties:
 *                   weight:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                         example: 1.5
 *                       unit:
 *                         type: string
 *                         example: "kg"
 *                   dimensions:
 *                     type: object
 *                     properties:
 *                       length:
 *                         type: number
 *                         example: 10
 *                       width:
 *                         type: number
 *                         example: 5
 *                       height:
 *                         type: number
 *                         example: 3
 *                       unit:
 *                         type: string
 *                         example: "cm"
 *                 example:
 *                   weight:
 *                     value: 1.5
 *                     unit: "kg"
 *                   dimensions:
 *                     length: 10
 *                     width: 5
 *                     height: 3
 *                     unit: "cm"
 *               minOrderQuantity:
 *                 type: integer
 *                 description: Minimum order quantity
 *                 example: 1
 *                 default: 1
 *                 minimum: 1
 *               maxOrderQuantity:
 *                 type: integer
 *                 description: Maximum order quantity
 *                 example: 10
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or SKU already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 value:
 *                   success: false
 *                   error: "Validation error"
 *                   errors:
 *                     - field: "name"
 *                       message: "\"name\" is required"
 *                     - field: "price"
 *                       message: "\"price\" must be a number"
 *               skuExists:
 *                 value:
 *                   success: false
 *                   error: "SKU already exists"
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', productController.createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update product
 *     description: Update an existing product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields are optional for updates. Only include fields you want to update.
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               slug:
 *                 type: string
 *                 description: URL-friendly product slug
 *               price:
 *                 type: number
 *                 format: decimal
 *                 description: Current selling price
 *                 minimum: 0
 *               compareAtPrice:
 *                 type: number
 *                 format: decimal
 *                 description: Manufacturer's suggested retail price (MSRP)
 *                 minimum: 0
 *               originalPrice:
 *                 type: number
 *                 format: decimal
 *                 description: Original selling price before discounts
 *                 minimum: 0
 *               sku:
 *                 type: string
 *                 description: Stock Keeping Unit
 *               stock:
 *                 type: integer
 *                 description: Stock quantity
 *                 minimum: 0
 *                 example: 100
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Array of product image URLs
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               badges:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product badges
 *               specifications:
 *                 type: object
 *                 description: Product specifications as JSON object
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product certifications
 *               warrantyInfo:
 *                 type: string
 *                 description: Warranty information
 *               returnPolicy:
 *                 type: object
 *                 description: Return policy details (JSON object with window, conditions, process, shippingCost)
 *               refundPolicy:
 *                 type: object
 *                 description: Refund policy details (JSON object with method, timeline, conditions)
 *               shippingPolicy:
 *                 type: object
 *                 description: Shipping policy details (JSON object with deliveryTime, methods, costs, freeShippingThreshold)
 *               exchangePolicy:
 *                 type: object
 *                 description: Exchange policy details (JSON object with window, conditions, process)
 *               cancellationPolicy:
 *                 type: object
 *                 description: Cancellation policy details (JSON object with window, terms)
 *               careInstructions:
 *                 type: string
 *                 description: Care and maintenance instructions
 *               countryOfOrigin:
 *                 type: string
 *                 description: Country where the product was manufactured
 *               manufacturerInfo:
 *                 type: object
 *                 description: Manufacturer information (JSON object with name, contact, address, website)
 *               brand:
 *                 type: string
 *                 description: Product brand name
 *               modelNumber:
 *                 type: string
 *                 description: Product model number
 *               weightDimensions:
 *                 type: object
 *                 description: Weight and dimensions (JSON object with weight {value, unit} and dimensions {length, width, height, unit})
 *               minOrderQuantity:
 *                 type: integer
 *                 description: Minimum order quantity
 *                 minimum: 1
 *               maxOrderQuantity:
 *                 type: integer
 *                 description: Maximum order quantity
 *                 minimum: 1
 *               isActive:
 *                 type: boolean
 *                 description: Whether the product is active
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', productController.updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', productController.deleteProduct);

/**
 * @swagger
 * /api/v1/products/categories:
 *   post:
 *     summary: Create category
 *     description: Create a new product category (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error or category slug already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Category slug already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/categories', productController.createCategory);

/**
 * @swagger
 * /api/v1/products/categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Update an existing category (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/categories/:id', productController.updateCategory);

/**
 * @swagger
 * /api/v1/products/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Delete a category (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Cannot delete category with products or subcategories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/categories/:id', productController.deleteCategory);

module.exports = router;


