const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class ImageProcessingService {
  /**
   * Optimize image
   */
  static async optimizeImage(inputPath, outputPath, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.8,
      format = 'jpeg',
    } = options;

    let pipeline = sharp(inputPath);

    // Resize if needed
    const metadata = await pipeline.metadata();
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert format and compress
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality: Math.round(quality * 100) });
    } else if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality: Math.round(quality * 100) });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality: Math.round(quality * 100) });
    }

    await pipeline.toFile(outputPath);
    return outputPath;
  }

  /**
   * Generate thumbnail
   */
  static async generateThumbnail(inputPath, outputPath, size = 300) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    return outputPath;
  }

  /**
   * Generate multiple size variants
   */
  static async generateVariants(inputPath, baseOutputDir, filename) {
    const variants = {
      original: null,
      large: null,
      medium: null,
      thumbnail: null,
    };

    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);

    // Original (copy)
    const originalPath = path.join(baseOutputDir, 'original', filename);
    if (!fs.existsSync(path.dirname(originalPath))) {
      fs.mkdirSync(path.dirname(originalPath), { recursive: true });
    }
    fs.copyFileSync(inputPath, originalPath);
    variants.original = originalPath;

    // Large (1200px)
    const largePath = path.join(baseOutputDir, 'large', `${baseName}${ext}`);
    if (!fs.existsSync(path.dirname(largePath))) {
      fs.mkdirSync(path.dirname(largePath), { recursive: true });
    }
    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(largePath);
    variants.large = largePath;

    // Medium (800px)
    const mediumPath = path.join(baseOutputDir, 'medium', `${baseName}${ext}`);
    if (!fs.existsSync(path.dirname(mediumPath))) {
      fs.mkdirSync(path.dirname(mediumPath), { recursive: true });
    }
    await sharp(inputPath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);
    variants.medium = mediumPath;

    // Thumbnail (300px)
    const thumbnailPath = path.join(baseOutputDir, 'thumbnails', `${baseName}${ext}`);
    if (!fs.existsSync(path.dirname(thumbnailPath))) {
      fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
    }
    await this.generateThumbnail(inputPath, thumbnailPath, 300);
    variants.thumbnail = thumbnailPath;

    return variants;
  }

  /**
   * Extract image metadata
   */
  static async extractMetadata(imagePath) {
    const metadata = await sharp(imagePath).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: fs.statSync(imagePath).size,
      hasAlpha: metadata.hasAlpha,
      space: metadata.space,
    };
  }

  /**
   * Resize image
   */
  static async resizeImage(inputPath, outputPath, width, height, options = {}) {
    const {
      maintainAspectRatio = true,
      crop = false,
    } = options;

    let pipeline = sharp(inputPath);

    if (crop) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center',
      });
    } else if (maintainAspectRatio) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    } else {
      pipeline = pipeline.resize(width, height);
    }

    await pipeline.jpeg({ quality: 85 }).toFile(outputPath);
    return outputPath;
  }

  /**
   * Get image dimensions
   */
  static async getDimensions(imagePath) {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  }
}

module.exports = ImageProcessingService;

