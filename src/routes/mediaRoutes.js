const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media and image upload management endpoints
 */

router.use(auth);

/**
 * @swagger
 * /api/v1/media/upload:
 *   post:
 *     summary: Upload a single image file
 *     description: Upload a single image file with automatic optimization and thumbnail generation
 *     tags: [Media]
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
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP, GIF)
 *               folder:
 *                 type: string
 *                 description: Folder path for organization (e.g., "products", "users", "categories")
 *                 example: products
 *               optimize:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to optimize image
 *               maxWidth:
 *                 type: integer
 *                 description: Maximum width for resizing
 *                 example: 1920
 *               maxHeight:
 *                 type: integer
 *                 description: Maximum height for resizing
 *                 example: 1080
 *               quality:
 *                 type: number
 *                 format: float
 *                 default: 0.8
 *                 minimum: 0
 *                 maximum: 1
 *                 description: Compression quality (0-1)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                     id:
 *                       type: string
 *                       example: img_1234567890
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: https://cdn.example.com/images/products/img_1234567890.jpg
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://cdn.example.com/images/products/thumbnails/img_1234567890.jpg
 *                     originalUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://cdn.example.com/images/products/original/img_1234567890.jpg
 *                     filename:
 *                       type: string
 *                       example: product-image.jpg
 *                     mimeType:
 *                       type: string
 *                       example: image/jpeg
 *                     size:
 *                       type: integer
 *                       example: 245678
 *                     width:
 *                       type: integer
 *                       example: 1920
 *                     height:
 *                       type: integer
 *                       example: 1080
 *                     folder:
 *                       type: string
 *                       example: products
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
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
 *       413:
 *         description: Payload Too Large - File exceeds maximum size (10MB default)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "File size exceeds maximum limit of 10MB"
 *               code: "FILE_TOO_LARGE"
 *       415:
 *         description: Unsupported Media Type - File type not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "File type not allowed. Allowed types: JPEG, PNG, WebP, GIF"
 *               code: "INVALID_FILE_TYPE"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Internal server error"
 *               code: "UPLOAD_FAILED"
 */
// Note: uploadSingle middleware is called inside the controller
router.post('/upload', mediaController.uploadImage);

/**
 * @swagger
 * /api/v1/media/upload-multiple:
 *   post:
 *     summary: Upload multiple image files
 *     description: Upload multiple image files in a single request (max 10 files)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files (max 10)
 *               folder:
 *                 type: string
 *                 description: Folder path for organization
 *               optimize:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Images uploaded successfully
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
 *                       id:
 *                         type: string
 *                       url:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       filename:
 *                         type: string
 *                 uploaded:
 *                   type: integer
 *                   example: 5
 *                 failed:
 *                   type: integer
 *                   example: 0
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error or too many files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Maximum 10 files allowed per request"
 *               code: "TOO_MANY_FILES"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: Payload Too Large
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
router.post('/upload-multiple', mediaController.uploadMultiple);

/**
 * @swagger
 * /api/v1/media/upload-chunk:
 *   post:
 *     summary: Upload file in chunks
 *     description: Upload file in chunks for large files (>10MB)
 *     tags: [Media]
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
 *               - uploadId
 *               - chunkNumber
 *               - totalChunks
 *               - filename
 *               - totalSize
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Chunk of the file
 *               uploadId:
 *                 type: string
 *                 description: Unique upload session ID
 *               chunkNumber:
 *                 type: integer
 *                 description: Current chunk number (0-indexed)
 *               totalChunks:
 *                 type: integer
 *                 description: Total number of chunks
 *               filename:
 *                 type: string
 *                 description: Original filename
 *               totalSize:
 *                 type: integer
 *                 description: Total file size in bytes
 *               folder:
 *                 type: string
 *                 description: Folder path
 *     responses:
 *       200:
 *         description: Chunk uploaded successfully
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
 *                     uploadId:
 *                       type: string
 *                     chunkNumber:
 *                       type: integer
 *                     totalChunks:
 *                       type: integer
 *                     progress:
 *                       type: integer
 *                     completed:
 *                       type: boolean
 *                     image:
 *                       type: object
 *                       description: Present only when completed is true
 *       400:
 *         description: Invalid chunk data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Invalid chunk number or missing required fields"
 *               code: "CHUNK_VALIDATION_ERROR"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Upload session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Upload session not found"
 *               code: "UPLOAD_SESSION_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload-chunk', mediaController.uploadChunk);

/**
 * @swagger
 * /api/v1/media/upload-status/{uploadId}:
 *   get:
 *     summary: Get upload progress status
 *     description: Get upload progress status for chunked uploads
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Upload session ID
 *     responses:
 *       200:
 *         description: Upload status retrieved successfully
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
 *                     uploadId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, uploading, processing, completed, failed]
 *                     progress:
 *                       type: integer
 *                       example: 60
 *                     uploadedChunks:
 *                       type: integer
 *                     totalChunks:
 *                       type: integer
 *                     uploadedBytes:
 *                       type: integer
 *                     totalBytes:
 *                       type: integer
 *                     estimatedTimeRemaining:
 *                       type: integer
 *                       description: Seconds remaining
 *                     error:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Upload session not found
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
router.get('/upload-status/:uploadId', mediaController.getUploadStatus);

/**
 * @swagger
 * /api/v1/media/{imageId}:
 *   get:
 *     summary: Get image details
 *     description: Get image details and metadata
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image details retrieved successfully
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
 *                     id:
 *                       type: string
 *                     url:
 *                       type: string
 *                       format: uri
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                     originalUrl:
 *                       type: string
 *                       format: uri
 *                     filename:
 *                       type: string
 *                     mimeType:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *                     folder:
 *                       type: string
 *                     uploadedBy:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         exif:
 *                           type: object
 *                         colors:
 *                           type: array
 *                           items:
 *                             type: string
 *                         dominantColor:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Image not found
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
router.get('/:imageId', mediaController.getImage);

/**
 * @swagger
 * /api/v1/media/{imageId}:
 *   delete:
 *     summary: Delete an image
 *     description: Delete an uploaded image (only owner or admin)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
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
 *                   example: "Image deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not owner or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Forbidden - You can only delete your own images"
 *       404:
 *         description: Image not found
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
router.delete('/:imageId', mediaController.deleteImage);

/**
 * @swagger
 * /api/v1/media:
 *   get:
 *     summary: List uploaded images
 *     description: List uploaded images with pagination and filters
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Filter by folder
 *       - in: query
 *         name: uploadedBy
 *         schema:
 *           type: string
 *         description: Filter by uploader user ID
 *       - in: query
 *         name: mimeType
 *         schema:
 *           type: string
 *         description: Filter by MIME type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by filename
 *     responses:
 *       200:
 *         description: Images retrieved successfully
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
 *                       id:
 *                         type: string
 *                       url:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       mimeType:
 *                         type: string
 *                       width:
 *                         type: integer
 *                       height:
 *                         type: integer
 *                       folder:
 *                         type: string
 *                       uploadedBy:
 *                         type: string
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
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
router.get('/', mediaController.listImages);

/**
 * @swagger
 * /api/v1/media/{imageId}/optimize:
 *   post:
 *     summary: Optimize an existing image
 *     description: Optimize an existing image (re-compress, resize)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxWidth:
 *                 type: integer
 *                 example: 1920
 *               maxHeight:
 *                 type: integer
 *                 example: 1920
 *               quality:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.8
 *               format:
 *                 type: string
 *                 enum: [jpeg, png, webp]
 *                 example: webp
 *     responses:
 *       200:
 *         description: Image optimized successfully
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
 *                     id:
 *                       type: string
 *                     url:
 *                       type: string
 *                     originalSize:
 *                       type: integer
 *                     optimizedSize:
 *                       type: integer
 *                     savings:
 *                       type: number
 *                       format: float
 *                       description: Percentage saved
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Image processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Image processing failed"
 *               code: "IMAGE_PROCESSING_ERROR"
 */
router.post('/:imageId/optimize', mediaController.optimizeImage);

/**
 * @swagger
 * /api/v1/media/{imageId}/resize:
 *   post:
 *     summary: Resize an existing image
 *     description: Resize an existing image
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - width
 *               - height
 *             properties:
 *               width:
 *                 type: integer
 *                 example: 800
 *               height:
 *                 type: integer
 *                 example: 600
 *               maintainAspectRatio:
 *                 type: boolean
 *                 default: true
 *               crop:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Image resized successfully
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
 *                     id:
 *                       type: string
 *                     url:
 *                       type: string
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *                     size:
 *                       type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Image processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:imageId/resize', mediaController.resizeImage);

/**
 * @swagger
 * /api/v1/media/{imageId}/variants:
 *   get:
 *     summary: Get all size variants of an image
 *     description: Get all size variants of an image (thumbnail, medium, large, original)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image variants retrieved successfully
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
 *                     original:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         width:
 *                           type: integer
 *                         height:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                     large:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         width:
 *                           type: integer
 *                         height:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                     medium:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         width:
 *                           type: integer
 *                         height:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                     thumbnail:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         width:
 *                           type: integer
 *                         height:
 *                           type: integer
 *                         size:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Image not found
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
router.get('/:imageId/variants', mediaController.getImageVariants);

module.exports = router;

