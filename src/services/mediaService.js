const prisma = require('../config/database');
const ImageProcessingService = require('./imageProcessingService');
const storageService = require('./storageService');
const path = require('path');
const fs = require('fs');

class MediaService {
  /**
   * Upload and process a single image
   */
  static async uploadImage(file, options = {}) {
    const {
      folder = 'general',
      optimize = true,
      maxWidth,
      maxHeight,
      quality = 0.8,
      userId,
    } = options;

    // File is already saved by multer, get the path
    const filePath = file.path;
    
    // Extract metadata
    const metadata = await ImageProcessingService.extractMetadata(filePath);
    
    // Generate variants
    const filename = path.basename(filePath);
    const baseDir = path.dirname(filePath);
    const variants = await ImageProcessingService.generateVariants(
      filePath,
      baseDir,
      filename
    );

    // Optimize main image if requested
    let optimizedPath = filePath;
    if (optimize) {
      const optimizedFilename = `optimized_${filename}`;
      optimizedPath = path.join(baseDir, optimizedFilename);
      try {
        await ImageProcessingService.optimizeImage(filePath, optimizedPath, {
          maxWidth: maxWidth || metadata.width,
          maxHeight: maxHeight || metadata.height,
          quality,
        });
      } catch (error) {
        console.error('Error optimizing image:', error);
        // Fall back to original if optimization fails
        optimizedPath = filePath;
      }
    }

    // Get URLs - construct relative paths
    const getRelativePath = (filePath) => {
      const uploadsBase = path.join(__dirname, '../../uploads');
      const relative = path.relative(uploadsBase, filePath);
      return `/uploads/${relative.replace(/\\/g, '/')}`;
    };

    // Use optimized path if optimization was done, otherwise use original
    const mainImagePath = optimize && fs.existsSync(optimizedPath) ? optimizedPath : filePath;
    const url = getRelativePath(mainImagePath);
    const thumbnailUrl = getRelativePath(variants.thumbnail);
    const originalUrl = getRelativePath(variants.original);

    // Save to database
    const image = await prisma.file.create({
      data: {
        filename: filename,
        originalName: file.originalname,
        path: url,
        mimeType: file.mimetype,
        size: BigInt(metadata.size),
        uploadedBy: userId || null,
      },
    });

    // Update File model with additional fields (if schema supports it)
    // For now, return the data structure expected by the API

    // Construct full URLs
    const baseUrl = process.env.CDN_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    return {
      id: image.id,
      url: `${baseUrl}${url}`,
      thumbnailUrl: `${baseUrl}${thumbnailUrl}`,
      originalUrl: `${baseUrl}${originalUrl}`,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: metadata.size,
      width: metadata.width,
      height: metadata.height,
      folder,
      uploadedAt: image.createdAt,
    };
  }

  /**
   * Upload multiple images
   */
  static async uploadMultiple(files, options = {}) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadImage(files[i], options);
        results.push(result);
      } catch (error) {
        errors.push({
          file: files[i].originalname,
          error: error.message,
        });
      }
    }

    return {
      results,
      uploaded: results.length,
      failed: errors.length,
      errors,
    };
  }

  /**
   * Get image by ID
   */
  static async getImage(imageId) {
    const file = await prisma.file.findUnique({
      where: { id: imageId },
      include: {
        // Add any relations if needed
      },
    });

    if (!file) {
      throw new Error('Image not found');
    }

    // Get file path and extract metadata
    const filePath = file.path.startsWith('/uploads/') 
      ? path.join(__dirname, '../..', file.path)
      : path.join(__dirname, '../../uploads', file.path.replace(/^.*\/uploads\//, ''));
    
    let metadata = {};
    let dimensions = { width: 0, height: 0 };
    
    try {
      if (await storageService.fileExists(filePath)) {
        dimensions = await ImageProcessingService.getDimensions(filePath);
        metadata = await ImageProcessingService.extractMetadata(filePath);
      }
    } catch (error) {
      console.error('Error getting image metadata:', error);
    }

    const baseUrl = process.env.CDN_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url = file.path.startsWith('http') ? file.path : `${baseUrl}${file.path}`;
    
    // Try to find thumbnail
    const thumbnailPath = filePath.replace(/\.(jpg|jpeg|png|webp)$/i, (match) => {
      const dir = path.dirname(filePath);
      const thumbDir = path.join(dir, 'thumbnails');
      const baseName = path.basename(filePath, path.extname(filePath));
      return path.join(thumbDir, `${baseName}${path.extname(filePath)}`);
    });
    
    let thumbnailUrl = url;
    if (await storageService.fileExists(thumbnailPath)) {
      thumbnailUrl = url.replace(/\/[^/]+$/, '/thumbnails/' + path.basename(thumbnailPath));
    }

    return {
      id: file.id,
      url,
      thumbnailUrl,
      originalUrl: url,
      filename: file.originalName || file.filename,
      mimeType: file.mimeType,
      size: Number(file.size),
      width: dimensions.width,
      height: dimensions.height,
      folder: 'general',
      uploadedBy: file.uploadedBy,
      uploadedAt: file.createdAt,
      metadata: {
        exif: {},
        colors: [],
        dominantColor: null,
      },
    };
  }

  /**
   * Delete image
   */
  static async deleteImage(imageId, userId, isAdmin = false) {
    const file = await prisma.file.findUnique({
      where: { id: imageId },
    });

    if (!file) {
      throw new Error('Image not found');
    }

    // Check permissions
    if (!isAdmin && file.uploadedBy !== userId) {
      throw new Error('Forbidden - You can only delete your own images');
    }

    // Delete file from storage
    const filePath = file.path.startsWith('/uploads/')
      ? path.join(__dirname, '../..', file.path)
      : path.join(__dirname, '../../uploads', file.path.replace(/^.*\/uploads\//, ''));
    
    await storageService.deleteFile(filePath);
    
    // Also try to delete variants
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath);
    
    const variantDirs = ['original', 'large', 'medium', 'thumbnails'];
    for (const variantDir of variantDirs) {
      const variantPath = path.join(dir, variantDir, `${baseName}${ext}`);
      if (await storageService.fileExists(variantPath)) {
        await storageService.deleteFile(variantPath);
      }
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: imageId },
    });

    return true;
  }

  /**
   * List images with pagination
   */
  static async listImages(options = {}) {
    const {
      page = 1,
      limit = 20,
      folder,
      uploadedBy,
      mimeType,
      search,
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(uploadedBy && { uploadedBy }),
      ...(mimeType && { mimeType }),
      ...(search && {
        OR: [
          { filename: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.file.count({ where }),
    ]);

    const images = await Promise.all(
      files.map(async (file) => {
        let dimensions = { width: 0, height: 0 };
        try {
          const filePath = path.join(__dirname, '../../uploads', file.path.replace(/^.*\/uploads\//, ''));
          if (await storageService.fileExists(filePath)) {
            dimensions = await ImageProcessingService.getDimensions(filePath);
          }
        } catch (error) {
          // Ignore errors
        }

        const baseUrl = process.env.CDN_URL || `http://localhost:${process.env.PORT || 3000}`;
        const url = file.path.startsWith('http') ? file.path : `${baseUrl}${file.path}`;
        
        return {
          id: file.id,
          url,
          filename: file.originalName || file.filename,
          size: Number(file.size),
          mimeType: file.mimeType,
          width: dimensions.width,
          height: dimensions.height,
          folder: 'general',
          uploadedBy: file.uploadedBy,
          uploadedAt: file.createdAt,
        };
      })
    );

    return {
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Optimize existing image
   */
  static async optimizeImage(imageId, options = {}) {
    const file = await prisma.file.findUnique({
      where: { id: imageId },
    });

    if (!file) {
      throw new Error('Image not found');
    }

    const filePath = file.path.startsWith('/uploads/')
      ? path.join(__dirname, '../..', file.path)
      : path.join(__dirname, '../../uploads', file.path.replace(/^.*\/uploads\//, ''));
    
    if (!(await storageService.fileExists(filePath))) {
      throw new Error('Image file not found');
    }

    const originalSize = Number(file.size);
    const optimizedPath = filePath.replace(/\.(jpg|jpeg|png|webp)$/i, '_optimized.$1');

    await ImageProcessingService.optimizeImage(filePath, optimizedPath, options);

    const optimizedSize = await storageService.getFileSize(optimizedPath);
    const savings = ((originalSize - optimizedSize) / originalSize) * 100;

    const baseUrl = process.env.CDN_URL || `http://localhost:${process.env.PORT || 3000}`;
    const relativePath = path.relative(path.join(__dirname, '../../uploads'), optimizedPath);
    const optimizedUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;

    return {
      id: file.id,
      url: optimizedUrl,
      originalSize,
      optimizedSize,
      savings: Math.round(savings * 10) / 10,
    };
  }

  /**
   * Resize existing image
   */
  static async resizeImage(imageId, width, height, options = {}) {
    const file = await prisma.file.findUnique({
      where: { id: imageId },
    });

    if (!file) {
      throw new Error('Image not found');
    }

    const filePath = file.path.startsWith('/uploads/')
      ? path.join(__dirname, '../..', file.path)
      : path.join(__dirname, '../../uploads', file.path.replace(/^.*\/uploads\//, ''));
    
    if (!(await storageService.fileExists(filePath))) {
      throw new Error('Image file not found');
    }

    const resizedPath = filePath.replace(/\.(jpg|jpeg|png|webp)$/i, `_${width}x${height}.$1`);
    await ImageProcessingService.resizeImage(filePath, resizedPath, width, height, options);

    const dimensions = await ImageProcessingService.getDimensions(resizedPath);
    const size = await storageService.getFileSize(resizedPath);
    
    const baseUrl = process.env.CDN_URL || `http://localhost:${process.env.PORT || 3000}`;
    const relativePath = path.relative(path.join(__dirname, '../../uploads'), resizedPath);
    const resizedUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;

    return {
      id: file.id,
      url: resizedUrl,
      width: dimensions.width,
      height: dimensions.height,
      size,
    };
  }

  /**
   * Get image variants
   */
  static async getImageVariants(imageId) {
    const file = await prisma.file.findUnique({
      where: { id: imageId },
    });

    if (!file) {
      throw new Error('Image not found');
    }

    const filePath = file.path.startsWith('/uploads/')
      ? path.join(__dirname, '../..', file.path)
      : path.join(__dirname, '../../uploads', file.path.replace(/^.*\/uploads\//, ''));
    
    const dir = path.dirname(filePath);
    const filename = path.basename(file.path);
    const baseName = path.basename(filename, path.extname(filename));
    const ext = path.extname(filename);

    const variants = {
      original: null,
      large: null,
      medium: null,
      thumbnail: null,
    };

    const baseUrl = process.env.CDN_URL || `http://localhost:${process.env.PORT || 3000}`;
    const relativeBase = path.relative(path.join(__dirname, '../../uploads'), dir);

    // Check and get variant URLs
    const variantPaths = {
      original: path.join(dir, 'original', filename),
      large: path.join(dir, 'large', `${baseName}${ext}`),
      medium: path.join(dir, 'medium', `${baseName}${ext}`),
      thumbnail: path.join(dir, 'thumbnails', `${baseName}${ext}`),
    };

    for (const [key, variantPath] of Object.entries(variantPaths)) {
      if (await storageService.fileExists(variantPath)) {
        const dimensions = await ImageProcessingService.getDimensions(variantPath);
        const size = await storageService.getFileSize(variantPath);
        const relativePath = path.relative(path.join(__dirname, '../../uploads'), variantPath);
        variants[key] = {
          url: `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
          width: dimensions.width,
          height: dimensions.height,
          size,
        };
      }
    }

    return variants;
  }
}

module.exports = MediaService;

