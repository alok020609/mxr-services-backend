const express = require('express');
const router = express.Router();
const operationalController = require('../controllers/operationalController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Operational
 *   description: Operational features including bulk operations, jobs, and webhooks (Admin only)
 */

router.use(auth, admin);

// Bulk Operations
/**
 * @swagger
 * /api/v1/operational/bulk/products:
 *   post:
 *     summary: Bulk update products
 *     description: Perform bulk update operations on products (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *               - filters
 *               - data
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [UPDATE_STATUS, UPDATE_PRICE, UPDATE_STOCK]
 *               filters:
 *                 type: object
 *                 description: Filter criteria
 *               data:
 *                 type: object
 *                 description: Update data
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk/products', operationalController.bulkUpdateProducts);

/**
 * @swagger
 * /api/v1/operational/bulk/orders:
 *   post:
 *     summary: Bulk update orders
 *     description: Perform bulk update operations on orders (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *               - filters
 *               - data
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [UPDATE_STATUS, UPDATE_SHIPPING]
 *               filters:
 *                 type: object
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk/orders', operationalController.bulkUpdateOrders);

// Import/Export Jobs
/**
 * @swagger
 * /api/v1/operational/import:
 *   post:
 *     summary: Create import job (Enhanced with file upload)
 *     description: |
 *       Create a new data import job with file upload support. Accepts multipart/form-data for direct file upload or application/json with fileUrl.
 *       
 *       **Product Import CSV Format:**
 *       When importing PRODUCTS, the CSV/Excel file should include the following columns (all optional except name, price, sku):
 *       
 *       **Required Columns:**
 *       - name (string): Product name
 *       - price (decimal): Current selling price
 *       - sku (string): Stock Keeping Unit (unique)
 *       
 *       **Optional Columns:**
 *       - description (string): Product description
 *       - slug (string): URL-friendly slug
 *       - compareAtPrice (decimal): MSRP or "was" price
 *       - originalPrice (decimal): Original selling price before discounts
 *       - images (string): Comma-separated image URLs
 *       - categoryId (string): Category ID
 *       - badges (string): Comma-separated badges (e.g., "New,Featured")
 *       - specifications (string): JSON string for specifications
 *       - certifications (string): Comma-separated certifications
 *       - warrantyInfo (string): Warranty information
 *       - returnPolicy (string): JSON string for return policy
 *       - refundPolicy (string): JSON string for refund policy
 *       - shippingPolicy (string): JSON string for shipping policy
 *       - exchangePolicy (string): JSON string for exchange policy
 *       - cancellationPolicy (string): JSON string for cancellation policy
 *       - careInstructions (string): Care instructions
 *       - countryOfOrigin (string): Country of origin
 *       - manufacturerInfo (string): JSON string for manufacturer info
 *       - brand (string): Product brand
 *       - modelNumber (string): Model number
 *       - weightDimensions (string): JSON string for weight and dimensions
 *       - minOrderQuantity (integer): Minimum order quantity (default: 1)
 *       - maxOrderQuantity (integer): Maximum order quantity
 *       
 *       **JSON Field Format Examples:**
 *       - returnPolicy: `{"window":"30 days","conditions":"Item must be unused","process":"Contact support"}`
 *       - refundPolicy: `{"method":"original payment","timeline":"7-14 days"}`
 *       - shippingPolicy: `{"deliveryTime":"3-5 days","methods":["standard","express"]}`
 *       - manufacturerInfo: `{"name":"Manufacturer","contact":"support@example.com","address":"123 St"}`
 *       - weightDimensions: `{"weight":{"value":1.5,"unit":"kg"},"dimensions":{"length":10,"width":5,"height":3,"unit":"cm"}}`
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV/Excel file to import
 *               type:
 *                 type: string
 *                 enum: [PRODUCTS, ORDERS, USERS]
 *                 description: Import type
 *               options:
 *                 type: string
 *                 description: JSON string of import options
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - fileUrl
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PRODUCTS, ORDERS, USERS]
 *               fileUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of file to import
 *               options:
 *                 type: object
 *                 description: Import options
 *                 properties:
 *                   skipHeader:
 *                     type: boolean
 *                     default: true
 *                   validate:
 *                     type: boolean
 *                     default: true
 *     responses:
 *       202:
 *         description: Import job created successfully (accepted for processing)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                       example: import_1234567890
 *                     status:
 *                       type: string
 *                       enum: [queued]
 *                       example: queued
 *                     message:
 *                       type: string
 *                       example: Import job created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Validation error"
 *               code: "VALIDATION_ERROR"
 *               errors:
 *                 - field: "file"
 *                   message: "File is required"
 *                   code: "FILE_REQUIRED"
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: Payload Too Large - File exceeds maximum size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "File size exceeds maximum limit"
 *               code: "FILE_TOO_LARGE"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/import', operationalController.createImportJob);

/**
 * @swagger
 * /api/v1/operational/import:
 *   get:
 *     summary: Get import jobs
 *     description: Retrieve list of import jobs (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Import jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/import', operationalController.getImportJobs);

/**
 * @swagger
 * /api/v1/operational/import/{jobId}/status:
 *   get:
 *     summary: Get import job status with progress
 *     description: Get import job status with progress tracking
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Import job ID
 *     responses:
 *       200:
 *         description: Import job status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [queued, processing, completed, failed]
 *                     progress:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Progress percentage
 *                     processed:
 *                       type: integer
 *                       description: Number of items processed
 *                     total:
 *                       type: integer
 *                       description: Total number of items
 *                     successful:
 *                       type: integer
 *                       description: Number of successful imports
 *                     failed:
 *                       type: integer
 *                       description: Number of failed imports
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                           error:
 *                             type: string
 *                           data:
 *                             type: object
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                     estimatedCompletion:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
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
router.get('/import/:jobId/status', operationalController.getImportJobStatus);

/**
 * @swagger
 * /api/v1/operational/import/{jobId}/result:
 *   get:
 *     summary: Get import job result
 *     description: Get import job result after completion
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Import job ID
 *     responses:
 *       200:
 *         description: Import job result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [completed, failed]
 *                     processed:
 *                       type: integer
 *                     successful:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     resultFile:
 *                       type: string
 *                       format: uri
 *                       description: URL to download result file
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Unprocessable Entity - Job not completed yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Job is still processing"
 *               code: "JOB_NOT_COMPLETED"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/import/:jobId/result', operationalController.getImportJobResult);

/**
 * @swagger
 * /api/v1/operational/export:
 *   post:
 *     summary: Create export job
 *     description: |
 *       Create a new data export job (Admin only).
 *       
 *       **Product Export:**
 *       When exporting PRODUCTS, the exported file (CSV/Excel/JSON) will include all product fields:
 *       - Basic fields: id, name, description, slug, price, compareAtPrice, originalPrice, sku, images, categoryId, isActive
 *       - Product info: badges, specifications, certifications, warrantyInfo
 *       - Policies: returnPolicy, refundPolicy, shippingPolicy, exchangePolicy, cancellationPolicy
 *       - Additional info: careInstructions, countryOfOrigin, manufacturerInfo, brand, modelNumber
 *       - Physical attributes: weightDimensions
 *       - Order limits: minOrderQuantity, maxOrderQuantity
 *       - Timestamps: createdAt, updatedAt
 *       
 *       JSON fields (policies, manufacturerInfo, weightDimensions, specifications) will be exported as JSON strings in CSV format.
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PRODUCTS, ORDERS, USERS, ANALYTICS]
 *               format:
 *                 type: string
 *                 enum: [CSV, JSON, EXCEL]
 *               filters:
 *                 type: object
 *     responses:
 *       201:
 *         description: Export job created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/export', operationalController.createExportJob);

/**
 * @swagger
 * /api/v1/operational/export:
 *   get:
 *     summary: Get export jobs
 *     description: Retrieve list of export jobs (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Export jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/export', operationalController.getExportJobs);

// Cron Jobs
/**
 * @swagger
 * /api/v1/operational/cron:
 *   get:
 *     summary: Get cron jobs
 *     description: Retrieve list of scheduled cron jobs (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cron jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/cron', operationalController.getCronJobs);

/**
 * @swagger
 * /api/v1/operational/cron/{id}:
 *   put:
 *     summary: Update cron job
 *     description: Update a scheduled cron job (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cron job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule:
 *                 type: string
 *                 description: Cron schedule expression
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cron job updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cron job not found
 */
router.put('/cron/:id', operationalController.updateCronJob);

// Webhooks
/**
 * @swagger
 * /api/v1/operational/webhooks:
 *   get:
 *     summary: Get webhooks
 *     description: Retrieve list of configured webhooks (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Webhooks retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/webhooks', operationalController.getWebhooks);

/**
 * @swagger
 * /api/v1/operational/webhooks:
 *   post:
 *     summary: Create webhook
 *     description: Create a new webhook configuration (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Webhook URL
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Events to subscribe to
 *               secret:
 *                 type: string
 *                 description: Webhook secret for verification
 *     responses:
 *       201:
 *         description: Webhook created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/webhooks', operationalController.createWebhook);

/**
 * @swagger
 * /api/v1/operational/webhooks/logs:
 *   get:
 *     summary: Get webhook logs
 *     description: Retrieve webhook execution logs (Admin only)
 *     tags: [Operational]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: webhookId
 *         schema:
 *           type: string
 *         description: Filter by webhook ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILED, PENDING]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Webhook logs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/webhooks/logs', operationalController.getWebhookLogs);

module.exports = router;


