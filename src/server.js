require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Swagger documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-commerce API Documentation',
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
const { apiVersioning, apiDeprecation, requestTransformation, burstRateLimiter, getEndpointRateLimiter } = require('./middleware/apiGateway');
const { tenantContext, adminTenantBypass } = require('./middleware/tenantContext');
const { requestLogger, performanceMonitor } = require('./middleware/monitoring');
const { etagMiddleware } = require('./middleware/etag');
const { attachDataLoaders } = require('./utils/dataloader');
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/products`, productRoutes);
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
app.use(`/api/${apiVersion}/analytics`, advancedAnalyticsRoutes);
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

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;

