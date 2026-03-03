// Load .env only in development; production (e.g. Render) uses platform-injected env vars only
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiVersioning, apiDeprecation, requestTransformation, burstRateLimiter, getEndpointRateLimiter } = require('./middleware/apiGateway');
const { tenantContext, adminTenantBypass } = require('./middleware/tenantContext');
const { requestLogger, performanceMonitor } = require('./middleware/monitoring');
const { etagMiddleware } = require('./middleware/etag');
const { attachDataLoaders } = require('./utils/dataloader');

// Optional admin routes: load only if present (e.g. some files may be untracked in repo)
function requireOptional(path) {
  try {
    return require(path);
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
    return null;
  }
}

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
// In development, allow multiple localhost origins for flexibility
const getCorsOrigin = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // In development, allow common localhost ports
  if (process.env.NODE_ENV !== 'production') {
    return (origin, callback) => {
      // Allow requests from common development ports
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080'
      ];
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in development for flexibility
      }
    };
  }
  
  // Production default
  return 'http://localhost:3000';
};

app.use(cors({
  origin: getCorsOrigin(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Monitoring middleware
app.use(requestLogger);
app.use(performanceMonitor);

// API Gateway middleware
app.use(apiVersioning);
app.use(apiDeprecation);
app.use(requestTransformation);
app.use(burstRateLimiter);

// Multi-tenant middleware (optional, can be enabled per route)
app.use(adminTenantBypass);

// Performance optimization middleware
app.use(etagMiddleware);
app.use(attachDataLoaders);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically with explicit CORS headers
const path = require('path');

// Middleware to add CORS headers to static file responses
const staticFileCors = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Determine allowed origin
  let allowedOrigin = null;
  
  if (process.env.FRONTEND_URL) {
    // Use configured FRONTEND_URL if set
    allowedOrigin = process.env.FRONTEND_URL;
  } else if (process.env.NODE_ENV !== 'production') {
    // In development, allow common localhost origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      allowedOrigin = origin;
    } else if (origin) {
      // In development, allow the requesting origin for flexibility
      allowedOrigin = origin;
    } else {
      // No origin header (e.g., direct file access), allow all in development
      allowedOrigin = '*';
    }
  } else {
    // Production default
    allowedOrigin = 'http://localhost:3000';
  }
  
  // Set CORS headers explicitly
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};

// Apply CORS middleware before static file serving
app.use('/uploads', staticFileCors, express.static(path.join(__dirname, '../uploads')));

// Swagger documentation (spec per-request so "Try it out" uses current host when no APP_URL set)
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('./config/swagger');
const getSpecForRequest = swaggerConfig.getSpecForRequest || (() => swaggerConfig);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup((req, res, next) => getSpecForRequest(req), {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .auth-wrapper { margin: 20px 0; padding: 10px; background: #f0f0f0; border-radius: 4px; }
    .swagger-ui .auth-btn-wrapper { display: block !important; }
  `,
  customSiteTitle: 'E-commerce API Documentation',
  swaggerOptions: {
    persistAuthorization: true, // Persist authorization across page refreshes
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true, // Enable "Try it out" by default
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const couponRoutes = require('./routes/couponRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const taxRoutes = require('./routes/taxRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const adminPaymentGatewayRoutes = requireOptional('./routes/admin/adminPaymentGatewayRoutes');
const adminEmailServiceRoutes = requireOptional('./routes/admin/adminEmailServiceRoutes');
const adminSMSServiceRoutes = requireOptional('./routes/admin/adminSMSServiceRoutes');
const adminLogisticsProviderRoutes = requireOptional('./routes/admin/adminLogisticsProviderRoutes');
const adminQuestionRoutes = requireOptional('./routes/admin/adminQuestionRoutes');
const adminCurrencyRoutes = requireOptional('./routes/admin/adminCurrencyRoutes');
const adminMailSettingsRoutes = requireOptional('./routes/admin/adminMailSettingsRoutes');
const adminInvoiceRoutes = requireOptional('./routes/admin/adminInvoiceRoutes');
const adminContactSubmissionRoutes = requireOptional('./routes/admin/adminContactSubmissionRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const languageRoutes = require('./routes/languageRoutes');
const supportRoutes = require('./routes/supportRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const advancedProductRoutes = require('./routes/advancedProductRoutes');
const walletRoutes = require('./routes/walletRoutes');
const customerExperienceRoutes = require('./routes/customerExperienceRoutes');
const searchRoutes = require('./routes/searchRoutes');
const orderEnhancementRoutes = require('./routes/orderEnhancementRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const orderStateRoutes = require('./routes/orderStateRoutes');
const operationalRoutes = require('./routes/operationalRoutes');
const securityRoutes = require('./routes/securityRoutes');
const jobQueueRoutes = require('./routes/jobQueueRoutes');
const featureFlagRoutes = require('./routes/featureFlagRoutes');
const crmRoutes = require('./routes/crmRoutes');
const giftRoutes = require('./routes/giftRoutes');
const subscriptionManagementRoutes = require('./routes/subscriptionManagementRoutes');
const productManagementRoutes = require('./routes/productManagementRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const searchIndexRoutes = require('./routes/searchIndexRoutes');
const advancedInventoryRoutes = require('./routes/advancedInventoryRoutes');
const customerServiceEnhancedRoutes = require('./routes/customerServiceEnhancedRoutes');
const socialCommerceRoutes = require('./routes/socialCommerceRoutes');
const advancedAdminRoutes = require('./routes/advancedAdminRoutes');
const advancedAnalyticsRoutes = require('./routes/advancedAnalyticsRoutes');
const mobileBackendRoutes = require('./routes/mobileBackendRoutes');
const internationalizationRoutes = require('./routes/internationalizationRoutes');
const advancedPaymentsRoutes = require('./routes/advancedPaymentsRoutes');
const shippingCarrierRoutes = require('./routes/shippingCarrierRoutes');
const advancedShippingRoutes = require('./routes/advancedShippingRoutes');
const integrationsRoutes = require('./routes/integrationsRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const apiGatewayRoutes = require('./routes/apiGatewayRoutes');
const apiDeprecationRoutes = require('./routes/apiDeprecationRoutes');
const observabilityRoutes = require('./routes/observabilityRoutes');
const multiTenantRoutes = require('./routes/multiTenantRoutes');
const migrationRoutes = require('./routes/migrationRoutes');
const disasterRecoveryRoutes = require('./routes/disasterRecoveryRoutes');
const serviceRoutes = requireOptional('./routes/serviceRoutes');
const adminServiceRoutes = requireOptional('./routes/admin/adminServiceRoutes');
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/products`, productRoutes);
if (serviceRoutes) app.use(`/api/${apiVersion}/services`, serviceRoutes);
app.use(`/api/${apiVersion}/cart`, cartRoutes);
app.use(`/api/${apiVersion}/orders`, orderRoutes);
app.use(`/api/${apiVersion}/payments`, paymentRoutes);
app.use(`/api/${apiVersion}/webhooks`, webhookRoutes);
app.use(`/api/${apiVersion}/coupons`, couponRoutes);
app.use(`/api/${apiVersion}/wishlist`, wishlistRoutes);
app.use(`/api/${apiVersion}/shipping`, shippingRoutes);
app.use(`/api/${apiVersion}/tax`, taxRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/inventory`, inventoryRoutes);
app.use(`/api/${apiVersion}/reviews`, reviewRoutes);
app.use(`/api/${apiVersion}/admin`, adminRoutes);
if (adminPaymentGatewayRoutes) app.use(`/api/${apiVersion}/admin/payment-gateways`, adminPaymentGatewayRoutes);
if (adminEmailServiceRoutes) app.use(`/api/${apiVersion}/admin/email-services`, adminEmailServiceRoutes);
if (adminSMSServiceRoutes) app.use(`/api/${apiVersion}/admin/sms-services`, adminSMSServiceRoutes);
if (adminLogisticsProviderRoutes) app.use(`/api/${apiVersion}/admin/logistics-providers`, adminLogisticsProviderRoutes);
if (adminQuestionRoutes) app.use(`/api/${apiVersion}/admin/questions`, adminQuestionRoutes);
if (adminCurrencyRoutes) app.use(`/api/${apiVersion}/admin/currencies`, adminCurrencyRoutes);
if (adminMailSettingsRoutes) app.use(`/api/${apiVersion}/admin/mail-settings`, adminMailSettingsRoutes);
if (adminInvoiceRoutes) app.use(`/api/${apiVersion}/admin/invoices`, adminInvoiceRoutes);
if (adminContactSubmissionRoutes) app.use(`/api/${apiVersion}/admin/contact-submissions`, adminContactSubmissionRoutes);
if (adminServiceRoutes) app.use(`/api/${apiVersion}/admin/services`, adminServiceRoutes);
app.use(`/api/${apiVersion}/logistics`, logisticsRoutes);
app.use(`/api/${apiVersion}/currencies`, currencyRoutes);
app.use(`/api/${apiVersion}/languages`, languageRoutes);
app.use(`/api/${apiVersion}/support`, supportRoutes);
app.use(`/api/${apiVersion}/loyalty`, loyaltyRoutes);
app.use(`/api/${apiVersion}/marketing`, marketingRoutes);
app.use(`/api/${apiVersion}/advanced-products`, advancedProductRoutes);
app.use(`/api/${apiVersion}/wallet`, walletRoutes);
app.use(`/api/${apiVersion}/experience`, customerExperienceRoutes);
app.use(`/api/${apiVersion}/search`, searchRoutes);
app.use(`/api/${apiVersion}/order-enhancements`, orderEnhancementRoutes);
app.use(`/api/${apiVersion}/analytics`, analyticsRoutes);
app.use(`/api/${apiVersion}/vendor`, vendorRoutes);
app.use(`/api/${apiVersion}/cms`, cmsRoutes);
app.use(`/api/${apiVersion}/order-state`, orderStateRoutes);
app.use(`/api/${apiVersion}/operational`, operationalRoutes);
app.use(`/api/${apiVersion}/security`, securityRoutes);
app.use(`/api/${apiVersion}/jobs`, jobQueueRoutes);
app.use(`/api/${apiVersion}/feature-flags`, featureFlagRoutes);
app.use(`/api/${apiVersion}/crm`, crmRoutes);
app.use(`/api/${apiVersion}/gifts`, giftRoutes);
app.use(`/api/${apiVersion}/subscriptions`, subscriptionManagementRoutes);
app.use(`/api/${apiVersion}/product-management`, productManagementRoutes);
app.use(`/api/${apiVersion}/monitoring`, monitoringRoutes);
app.use(`/api/${apiVersion}/search`, searchIndexRoutes);
app.use(`/api/${apiVersion}/inventory/advanced`, advancedInventoryRoutes);
app.use(`/api/${apiVersion}/customer-service`, customerServiceEnhancedRoutes);
app.use(`/api/${apiVersion}/social`, socialCommerceRoutes);
app.use(`/api/${apiVersion}/admin/advanced`, advancedAdminRoutes);
app.use(`/api/${apiVersion}/analytics/advanced`, advancedAnalyticsRoutes);
app.use(`/api/${apiVersion}/mobile`, mobileBackendRoutes);
app.use(`/api/${apiVersion}/i18n`, internationalizationRoutes);
app.use(`/api/${apiVersion}/payments/advanced`, advancedPaymentsRoutes);
app.use(`/api/${apiVersion}/shipping/carriers`, shippingCarrierRoutes);
app.use(`/api/${apiVersion}/shipping/advanced`, advancedShippingRoutes);
app.use(`/api/${apiVersion}/integrations`, integrationsRoutes);
app.use(`/api/${apiVersion}/compliance`, complianceRoutes);
app.use(`/api/${apiVersion}/gateway`, apiGatewayRoutes);
app.use(`/api/${apiVersion}/deprecation`, apiDeprecationRoutes);
app.use(`/api/${apiVersion}/observability`, observabilityRoutes);
app.use(`/api/${apiVersion}/tenants`, multiTenantRoutes);
app.use(`/api/${apiVersion}/migrations`, migrationRoutes);
app.use(`/api/${apiVersion}/disaster-recovery`, disasterRecoveryRoutes);
const mediaRoutes = requireOptional('./routes/mediaRoutes');
const productImageRoutes = requireOptional('./routes/productImageRoutes');
const batchRoutes = requireOptional('./routes/batchRoutes');
if (mediaRoutes) app.use(`/api/${apiVersion}/media`, mediaRoutes);
if (productImageRoutes) app.use(`/api/${apiVersion}/products`, productImageRoutes);
if (batchRoutes) app.use(`/api/${apiVersion}/batch`, batchRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

  // Auto-cancel expired unpaid orders (e.g. every hour)
  const cron = require('node-cron');
  const pendingOrderCancelService = require('./services/pendingOrderCancelService');
  cron.schedule('0 * * * *', async () => {
    try {
      await pendingOrderCancelService.cancelExpiredUnpaidOrders();
    } catch (err) {
      console.error('Pending order cancel job failed:', err.message);
    }
  });
});

module.exports = app;

