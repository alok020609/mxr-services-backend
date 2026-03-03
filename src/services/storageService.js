const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class StorageService {
  constructor() {
    this.baseDir = path.join(__dirname, '../../uploads');
    this.cdnUrl = process.env.CDN_URL || 'http://localhost:3000';
    this.storageType = process.env.STORAGE_TYPE || 'local';
  }

  /**
   * Get full URL for a file
   */
  getUrl(filePath, folder = '') {
    if (this.storageType === 'local') {
      const relativePath = path.relative(this.baseDir, filePath);
      return `${this.cdnUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
    }
    // For cloud storage, return the cloud URL
    return filePath;
  }

  /**
   * Save file
   */
  async saveFile(file, folder = 'general') {
    const folderPath = path.join(this.baseDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `img_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(folderPath, filename);

    if (file.buffer) {
      // Memory storage (for chunks)
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
      // Disk storage (multer)
      // File already saved by multer
      return file.path;
    }

    return filePath;
  }

  /**
   * Delete file
   */
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Get file size
   */
  async getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = new StorageService();

