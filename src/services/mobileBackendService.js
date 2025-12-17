const prisma = require('../config/database');
const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

// Initialize Firebase Admin (for FCM)
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      logger.info('Firebase Admin initialized');
    } catch (error) {
      logger.error('Firebase initialization error:', error);
    }
  }
};

class MobileBackendService {
  // Push notification service
  static async sendPushNotification(userId, title, body, data = {}) {
    initializeFirebase();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        devices: {
          where: {
            pushToken: { not: null },
            isActive: true,
          },
        },
      },
    });

    if (!user || !user.devices || user.devices.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const device of user.devices) {
      try {
        const message = {
          notification: {
            title,
            body,
          },
          data: {
            ...data,
            type: data.type || 'GENERAL',
          },
          token: device.pushToken,
        };

        await admin.messaging().send(message);
        sent++;
      } catch (error) {
        logger.error(`Failed to send push to device ${device.id}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  // Register device for push notifications
  static async registerDevice(userId, deviceInfo) {
    const { deviceId, platform, pushToken, appVersion, deviceModel } = deviceInfo;

    const device = await prisma.device.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
      update: {
        platform,
        pushToken,
        appVersion,
        deviceModel,
        lastUsedAt: new Date(),
        isActive: true,
      },
      create: {
        userId,
        deviceId,
        platform,
        pushToken,
        appVersion,
        deviceModel,
        isActive: true,
        lastUsedAt: new Date(),
      },
    });

    return device;
  }

  // Deep linking
  static async createDeepLink(type, entityId, metadata = {}) {
    const deepLink = `${process.env.MOBILE_APP_SCHEME}://${type}/${entityId}?${new URLSearchParams(metadata).toString()}`;

    // Store deep link for analytics
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'DEEP_LINK_CREATED',
        entityType: type.toUpperCase(),
        entityId,
        metadata: {
          deepLink,
          ...metadata,
        },
      },
    });

    return { deepLink, shortLink: deepLink }; // Could use URL shortener
  }

  // App version management
  static async checkAppVersion(platform, currentVersion) {
    const version = await prisma.appVersion.findFirst({
      where: {
        platform,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!version) {
      return {
        updateAvailable: false,
        currentVersion,
      };
    }

    const updateAvailable = this.compareVersions(currentVersion, version.version) < 0;

    return {
      updateAvailable,
      currentVersion,
      latestVersion: version.version,
      minRequiredVersion: version.minRequiredVersion,
      forceUpdate: this.compareVersions(currentVersion, version.minRequiredVersion) < 0,
      updateUrl: version.updateUrl,
      releaseNotes: version.releaseNotes,
    };
  }

  static compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }

  // Mobile-optimized images
  static getMobileImageUrl(imageUrl, width = 400, quality = 80) {
    // TODO: Integrate with image CDN (e.g., Cloudinary, Imgix)
    // For now, return original URL
    return imageUrl;
  }

  // Apple Pay / Google Pay / Samsung Pay integration
  static async processMobilePayment(orderId, paymentMethod, paymentData) {
    // TODO: Implement mobile payment processing
    // This would integrate with Apple Pay, Google Pay, Samsung Pay APIs
    return {
      success: true,
      message: 'Mobile payment processed',
      transactionId: `mobile_${Date.now()}`,
    };
  }
}

module.exports = { MobileBackendService };


