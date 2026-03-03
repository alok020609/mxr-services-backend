const swaggerJsdoc = require('swagger-jsdoc');

const defaultBaseUrl = process.env.APP_URL || process.env.API_URL || process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
const servers = [
  { url: defaultBaseUrl, description: defaultBaseUrl.includes('localhost') ? 'Development server' : 'Current server' },
];
if (process.env.APP_URL || process.env.API_URL || process.env.PUBLIC_URL) {
  servers.push({ url: `http://localhost:${process.env.PORT || 3000}`, description: 'Local' });
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce Backend API',
      version: '1.0.0',
      description: 'Production-ready e-commerce backend API with comprehensive endpoints for all e-commerce operations.\n\n## 🔐 Authentication\n\n**IMPORTANT:** Most endpoints require authentication. Follow these steps:\n\n1. **Get Token:** Use `/api/v1/auth/login` endpoint to get your JWT token\n2. **Authorize:** Click the **"Authorize"** 🔓 button at the **top right** of this page\n3. **Enter Token:** Paste your token in the "bearerAuth" field (without "Bearer " prefix)\n4. **Save:** Click "Authorize" then "Close"\n\n**Note:** If you don\'t see the "Authorize" button, try:\n- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)\n- Clear browser cache\n- Check browser console for errors\n\nAll authenticated requests will now automatically include your token.',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}". Get your token from the /api/v1/auth/login endpoint.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'VENDOR'] },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Product ID' },
            name: { type: 'string', description: 'Product name' },
            description: { type: 'string', description: 'Product description' },
            slug: { type: 'string', description: 'URL-friendly product slug' },
            price: { type: 'number', format: 'decimal', description: 'Current selling price' },
            compareAtPrice: { type: 'number', format: 'decimal', description: 'Manufacturer\'s suggested retail price (MSRP)' },
            originalPrice: { type: 'number', format: 'decimal', description: 'Original selling price before discounts' },
            sku: { type: 'string', description: 'Stock Keeping Unit' },
            stock: { type: 'integer', description: 'Current stock quantity', default: 0, minimum: 0 },
            images: { type: 'array', items: { type: 'string', format: 'uri' }, description: 'Array of product image URLs' },
            categoryId: { type: 'string', description: 'Category ID' },
            isActive: { type: 'boolean', description: 'Whether the product is active' },
            badges: { type: 'array', items: { type: 'string' }, description: 'Product badges' },
            specifications: { type: 'object', description: 'Product specifications' },
            certifications: { type: 'array', items: { type: 'string' }, description: 'Product certifications' },
            warrantyInfo: { type: 'string', description: 'Warranty information' },
            returnPolicy: { type: 'object', description: 'Return policy details' },
            refundPolicy: { type: 'object', description: 'Refund policy details' },
            shippingPolicy: { type: 'object', description: 'Shipping policy details' },
            exchangePolicy: { type: 'object', description: 'Exchange policy details' },
            cancellationPolicy: { type: 'object', description: 'Cancellation policy details' },
            careInstructions: { type: 'string', description: 'Care and maintenance instructions' },
            countryOfOrigin: { type: 'string', description: 'Country where the product was manufactured' },
            manufacturerInfo: { type: 'object', description: 'Manufacturer information' },
            brand: { type: 'string', description: 'Product brand name' },
            modelNumber: { type: 'string', description: 'Product model number' },
            weightDimensions: { type: 'object', description: 'Weight and dimensions' },
            minOrderQuantity: { type: 'integer', description: 'Minimum order quantity' },
            maxOrderQuantity: { type: 'integer', description: 'Maximum order quantity' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string' },
            status: { type: 'string', enum: ['CREATED', 'PAYMENT_PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'] },
            total: { type: 'number', format: 'decimal' },
            subtotal: { type: 'number', format: 'decimal' },
            tax: { type: 'number', format: 'decimal' },
            shipping: { type: 'number', format: 'decimal' },
            discount: { type: 'number', format: 'decimal' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CartItem' },
            },
            subtotal: { type: 'number', format: 'decimal' },
            tax: { type: 'number', format: 'decimal' },
            shipping: { type: 'number', format: 'decimal' },
            discount: { type: 'number', format: 'decimal' },
            total: { type: 'number', format: 'decimal' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            productName: { type: 'string' },
            quantity: { type: 'integer' },
            price: { type: 'number', format: 'decimal' },
            subtotal: { type: 'number', format: 'decimal' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            productName: { type: 'string' },
            quantity: { type: 'integer' },
            price: { type: 'number', format: 'decimal' },
            subtotal: { type: 'number', format: 'decimal' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderId: { type: 'string' },
            amount: { type: 'number', format: 'decimal' },
            status: { type: 'string', enum: ['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'] },
            gateway: { type: 'string' },
            transactionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaymentIntent: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            clientSecret: { type: 'string' },
            amount: { type: 'integer' },
            currency: { type: 'string' },
            status: { type: 'string' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            helpful: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Rating: {
          type: 'object',
          properties: {
            averageRating: { type: 'number' },
            totalReviews: { type: 'integer' },
            ratingDistribution: {
              type: 'object',
              additionalProperties: { type: 'integer' },
            },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            code: { type: 'string' },
            type: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
            value: { type: 'number' },
            minPurchase: { type: 'number', format: 'decimal' },
            maxDiscount: { type: 'number', format: 'decimal' },
            validFrom: { type: 'string', format: 'date-time' },
            validUntil: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
          },
        },
        WishlistItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            product: { $ref: '#/components/schemas/Product' },
            addedAt: { type: 'string', format: 'date-time' },
          },
        },
        ShippingMethod: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            estimatedDays: { type: 'integer' },
            price: { type: 'number', format: 'decimal' },
          },
        },
        TaxRate: {
          type: 'object',
          properties: {
            state: { type: 'string' },
            country: { type: 'string' },
            rate: { type: 'number' },
            type: { type: 'string', enum: ['SALES_TAX', 'VAT', 'GST', 'LOCAL_TAX'] },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Address: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['BILLING', 'SHIPPING'] },
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' },
            isDefault: { type: 'boolean' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            parentId: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            order: { type: 'integer' },
            children: {
              type: 'array',
              items: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        Inventory: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            variantId: { type: 'string', nullable: true },
            stock: { type: 'integer' },
            reserved: { type: 'integer' },
            available: { type: 'integer' },
            lowStockThreshold: { type: 'integer' },
            isLowStock: { type: 'boolean' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductVariant: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            name: { type: 'string' },
            value: { type: 'string' },
            price: { type: 'number', format: 'decimal' },
            sku: { type: 'string' },
            stockQuantity: { type: 'integer' },
            isActive: { type: 'boolean' },
          },
        },
        Refund: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            paymentId: { type: 'string' },
            orderId: { type: 'string' },
            amount: { type: 'number', format: 'decimal' },
            reason: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Tracking: {
          type: 'object',
          properties: {
            trackingNumber: { type: 'string' },
            carrier: { type: 'string' },
            status: { type: 'string' },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                  location: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            estimatedDelivery: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
        LogisticsProvider: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Logistics provider ID' },
            name: { type: 'string', description: 'Display name of the provider' },
            type: { type: 'string', enum: ['SHIPROCKET', 'DELHIVERY', 'CLICKPOST', 'VAMASHIP', 'SHIPJEE', 'INDISPEED', 'ULIP'], description: 'Provider type' },
            isActive: { type: 'boolean', description: 'Whether the provider is active' },
            isDefault: { type: 'boolean', description: 'Whether this is the default provider' },
            config: { type: 'object', description: 'Provider-specific configuration (sensitive fields masked)' },
            supportedRegions: { type: 'array', items: { type: 'string' }, description: 'Supported regions/countries' },
            supportedServices: { type: 'array', items: { type: 'string' }, description: 'Supported service types' },
            webhookUrl: { type: 'string', nullable: true, description: 'Webhook URL for status updates' },
            incomingWebhookUrl: { type: 'string', nullable: true, description: 'URL to paste in provider webhook settings (e.g. Shiprocket); present when backend has a webhook for this type' },
            priority: { type: 'integer', description: 'Provider priority (lower = higher priority)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LogisticsShipment: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Shipment ID' },
            orderId: { type: 'string', description: 'Order ID' },
            providerId: { type: 'string', description: 'Logistics provider ID' },
            providerShipmentId: { type: 'string', nullable: true, description: 'External provider shipment ID' },
            awbNumber: { type: 'string', nullable: true, description: 'Airway Bill Number' },
            trackingNumber: { type: 'string', nullable: true, description: 'Tracking number' },
            status: { type: 'string', description: 'Shipment status (created, picked_up, in_transit, delivered, cancelled)' },
            providerStatus: { type: 'string', nullable: true, description: 'Provider-specific status' },
            rate: { type: 'number', format: 'decimal', nullable: true, description: 'Shipping rate' },
            labelUrl: { type: 'string', nullable: true, description: 'Shipping label URL' },
            manifestUrl: { type: 'string', nullable: true, description: 'Manifest URL' },
            pickupScheduled: { type: 'boolean', description: 'Whether pickup is scheduled' },
            pickupDate: { type: 'string', format: 'date-time', nullable: true },
            estimatedDelivery: { type: 'string', format: 'date-time', nullable: true },
            actualDelivery: { type: 'string', format: 'date-time', nullable: true },
            metadata: { type: 'object', nullable: true, description: 'Provider-specific data' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TrackingInfo: {
          type: 'object',
          properties: {
            trackingNumber: { type: 'string', description: 'Tracking number or AWB' },
            status: { type: 'string', description: 'Normalized status' },
            providerStatus: { type: 'string', description: 'Provider-specific status' },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                  location: { type: 'string' },
                  status: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            estimatedDelivery: { type: 'string', format: 'date-time', nullable: true },
            currentLocation: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
              },
            },
          },
        },
        ShippingRate: {
          type: 'object',
          properties: {
            provider: { type: 'string', description: 'Provider type' },
            courierCompanyId: { type: 'integer', nullable: true },
            courierName: { type: 'string', description: 'Courier company name' },
            rate: { type: 'number', format: 'decimal', description: 'Shipping rate' },
            estimatedDays: { type: 'integer', description: 'Estimated delivery days' },
            codAvailable: { type: 'boolean', description: 'Whether COD is available' },
          },
        },
      },
    },
    // Note: Security is defined per-endpoint, not globally
    // This ensures the "Authorize" button appears in Swagger UI
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
if (!swaggerSpec.openapi) swaggerSpec.openapi = '3.0.0';

function getSpecForRequest(req) {
  const base = req && req.protocol && req.get ? `${req.protocol}://${req.get('host')}` : defaultBaseUrl;
  const spec = Object.assign({}, swaggerSpec, {
    servers: [{ url: base, description: 'Current server' }],
  });
  if (!spec.openapi) spec.openapi = '3.0.0';
  return spec;
}

module.exports = swaggerSpec;
module.exports.getSpecForRequest = getSpecForRequest;


