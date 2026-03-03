const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Batch
 *   description: Batch request execution endpoints
 */

router.use(auth);

/**
 * @swagger
 * /api/v1/batch:
 *   post:
 *     summary: Execute multiple API requests
 *     description: Execute multiple API requests in a single HTTP request. Maximum 20 requests per batch.
 *     tags: [Batch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requests
 *             properties:
 *               requests:
 *                 type: array
 *                 maxItems: 20
 *                 items:
 *                   type: object
 *                   required:
 *                     - method
 *                     - path
 *                   properties:
 *                     method:
 *                       type: string
 *                       enum: [GET, POST, PUT, DELETE, PATCH]
 *                       description: HTTP method
 *                     path:
 *                       type: string
 *                       description: API path (relative to /api/v1)
 *                       example: /products/prod_123
 *                     body:
 *                       type: object
 *                       description: Request body (for POST, PUT, PATCH)
 *                     headers:
 *                       type: object
 *                       description: Additional headers (optional)
 *           example:
 *             requests:
 *               - method: GET
 *                 path: /products/prod_123
 *               - method: GET
 *                 path: /products/prod_456
 *               - method: POST
 *                 path: /cart/add
 *                 body:
 *                   productId: prod_789
 *                   quantity: 2
 *     responses:
 *       200:
 *         description: Batch requests executed successfully
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
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: integer
 *                         description: HTTP status code
 *                         example: 200
 *                       body:
 *                         type: object
 *                         description: Response body
 *                       headers:
 *                         type: object
 *                         description: Response headers
 *             example:
 *               success: true
 *               data:
 *                 - status: 200
 *                   body:
 *                     success: true
 *                     data:
 *                       id: prod_123
 *                       name: Product 1
 *                 - status: 200
 *                   body:
 *                     success: true
 *                     data:
 *                       id: prod_456
 *                       name: Product 2
 *                 - status: 201
 *                   body:
 *                     success: true
 *                     message: Item added to cart
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
 *                 - field: "requests"
 *                   message: "Maximum 20 requests allowed per batch"
 *                   code: "TOO_MANY_REQUESTS"
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too Many Requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Rate limit exceeded"
 *               code: "RATE_LIMIT_EXCEEDED"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', batchController.executeBatch);

module.exports = router;

