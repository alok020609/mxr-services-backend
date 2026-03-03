const { asyncHandler } = require('../utils/asyncHandler');
const MediaService = require('../services/mediaService');
const { uploadSingle } = require('../middleware/upload');
const multer = require('multer');

const uploadImage = asyncHandler(async (req, res) => {
  // Handle file upload
  await new Promise((resolve, reject) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            const error = new Error('File size exceeds maximum limit of 10MB');
            error.code = 'FILE_TOO_LARGE';
            return reject(error);
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            const error = new Error('Too many files');
            error.code = 'TOO_MANY_FILES';
            return reject(error);
          }
        }
        if (err.message && err.message.includes('Invalid file type')) {
          const error = new Error('File type not allowed. Allowed types: JPEG, PNG, WebP, GIF');
          error.code = 'INVALID_FILE_TYPE';
          return reject(error);
        }
        return reject(err);
      }
      if (!req.file) {
        return reject(new Error('No file uploaded'));
      }
      resolve();
    });
  });

  const {
    folder = 'general',
    optimize = 'true',
    maxWidth,
    maxHeight,
    quality = '0.8',
  } = req.body;

  const result = await MediaService.uploadImage(req.file, {
    folder,
    optimize: optimize === 'true',
    maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
    maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
    quality: parseFloat(quality),
    userId: req.user.id,
  });

  res.json({
    success: true,
    data: result,
  });
});

const { uploadMultiple: uploadMultipleFiles } = require('../middleware/upload');

const uploadMultiple = asyncHandler(async (req, res) => {
  await new Promise((resolve, reject) => {
    uploadMultipleFiles(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      if (!req.files || req.files.length === 0) {
        return reject(new Error('No files uploaded'));
      }
      resolve();
    });
  });

  const {
    folder = 'general',
    optimize = 'true',
  } = req.body;

  const result = await MediaService.uploadMultiple(req.files, {
    folder,
    optimize: optimize === 'true',
    userId: req.user.id,
  });

  res.json({
    success: true,
    data: result.results,
    uploaded: result.uploaded,
    failed: result.failed,
    errors: result.errors,
  });
});

const uploadChunk = asyncHandler(async (req, res) => {
  // TODO: Implement chunked upload
  res.status(501).json({
    success: false,
    error: 'Chunked upload functionality is being implemented',
    message: 'This feature will be available soon',
  });
});

const getUploadStatus = asyncHandler(async (req, res) => {
  // TODO: Implement upload status tracking
  res.status(501).json({
    success: false,
    error: 'Upload status functionality is being implemented',
    message: 'This feature will be available soon',
  });
});

const getImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const image = await MediaService.getImage(imageId);
  
  res.json({
    success: true,
    data: image,
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const isAdmin = req.user.role === 'ADMIN';
  
  await MediaService.deleteImage(imageId, req.user.id, isAdmin);
  
  res.json({
    success: true,
    message: 'Image deleted successfully',
  });
});

const listImages = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    folder,
    uploadedBy,
    mimeType,
    search,
  } = req.query;

  const result = await MediaService.listImages({
    page,
    limit,
    folder,
    uploadedBy,
    mimeType,
    search,
  });

  res.json({
    success: true,
    data: result.images,
    pagination: result.pagination,
  });
});

const optimizeImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const { maxWidth, maxHeight, quality, format } = req.body;

  const result = await MediaService.optimizeImage(imageId, {
    maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
    maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
    quality: quality ? parseFloat(quality) : 0.8,
    format: format || 'jpeg',
  });

  res.json({
    success: true,
    data: result,
  });
});

const resizeImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const { width, height, maintainAspectRatio = true, crop = false } = req.body;

  if (!width || !height) {
    return res.status(400).json({
      success: false,
      error: 'Width and height are required',
      code: 'VALIDATION_ERROR',
    });
  }

  const result = await MediaService.resizeImage(
    imageId,
    parseInt(width),
    parseInt(height),
    { maintainAspectRatio, crop }
  );

  res.json({
    success: true,
    data: result,
  });
});

const getImageVariants = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const variants = await MediaService.getImageVariants(imageId);

  res.json({
    success: true,
    data: variants,
  });
});

module.exports = {
  uploadImage,
  uploadMultiple,
  uploadChunk,
  getUploadStatus,
  getImage,
  deleteImage,
  listImages,
  optimizeImage,
  resizeImage,
  getImageVariants,
};

