const prisma = require('../config/database');
const LogisticsProviderFactory = require('./logistics/LogisticsProviderFactory');
const logger = require('../utils/logger');

class LogisticsService {
  /**
   * Track shipment - works with any provider
   */
  static async trackShipment(orderId, trackingNumber, providerType = null) {
    // If provider not specified, find from shipment record
    if (!providerType) {
      const shipment = await prisma.logisticsShipment.findFirst({
        where: {
          OR: [{ orderId }, { trackingNumber }],
        },
        include: { provider: true },
      });

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      providerType = shipment.provider.type;
    }

    const provider = await LogisticsProviderFactory.createProvider(providerType);
    const trackingData = await provider.trackShipment(trackingNumber);

    // Update local database
    await this.updateTrackingInfo(orderId, trackingData);

    return trackingData;
  }

  /**
   * Calculate rates - can compare across multiple providers
   */
  static async calculateRates(orderData, options = {}) {
    const { compareAll = false, providerType = null } = options;

    if (compareAll) {
      // Return rates from all active providers
      const providers = await LogisticsProviderFactory.getAvailableProviders();
      const ratePromises = providers.map(async provider => {
        try {
          const providerInstance = await LogisticsProviderFactory.createProvider(provider.type);
          const rates = await providerInstance.calculateRates(orderData);
          return {
            provider: provider.type,
            providerName: provider.name,
            rates,
          };
        } catch (error) {
          logger.error(`Rate calculation failed for ${provider.type}:`, error.message);
          return {
            provider: provider.type,
            providerName: provider.name,
            error: error.message,
          };
        }
      });

      const results = await Promise.all(ratePromises);
      return {
        comparisons: results.filter(r => !r.error),
        errors: results.filter(r => r.error),
      };
    }

    // Use specific provider or default
    let provider;
    if (providerType) {
      provider = await LogisticsProviderFactory.createProvider(providerType);
    } else {
      const defaultProvider = await LogisticsProviderFactory.getDefaultProvider();
      if (!defaultProvider) {
        throw new Error('No active logistics provider available');
      }
      provider = await LogisticsProviderFactory.createProvider(defaultProvider.type);
    }

    return await provider.calculateRates(orderData);
  }

  /**
   * Create shipment - automatically selects best provider if not specified
   */
  static async createShipment(orderId, shipmentData, providerId = null) {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Auto-select provider if not specified
    if (!providerId) {
      const defaultProvider = await LogisticsProviderFactory.getDefaultProvider();
      if (!defaultProvider) {
        throw new Error('No active logistics provider available');
      }
      providerId = defaultProvider.id;
    }

    const providerConfig = await LogisticsProviderFactory.getProviderById(providerId);
    if (!providerConfig || !providerConfig.isActive) {
      throw new Error('Logistics provider not available');
    }

    const provider = await LogisticsProviderFactory.createProvider(providerConfig.type);

    // Prepare shipment data
    const preparedShipmentData = {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotal: parseFloat(order.subtotal),
      },
      pickup: shipmentData.pickup || order.shippingAddress,
      delivery: shipmentData.delivery || order.shippingAddress,
      items: order.items.map(item => ({
        name: item.product.name,
        sku: item.product.sku || item.productId,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      weight: shipmentData.weight || 1, // Default 1kg
      dimensions: shipmentData.dimensions || { length: 10, width: 10, height: 10 },
      codAmount: shipmentData.codAmount || (order.status === 'PAID' ? 0 : parseFloat(order.total)),
      paymentMethod: shipmentData.paymentMethod || (order.status === 'PAID' ? 'Prepaid' : 'COD'),
    };

    const shipment = await provider.createShipment(preparedShipmentData);

    // Store in database
    const dbShipment = await prisma.logisticsShipment.create({
      data: {
        orderId,
        providerId,
        providerShipmentId: shipment.id?.toString(),
        awbNumber: shipment.awbNumber,
        trackingNumber: shipment.trackingNumber,
        status: 'created',
        providerStatus: shipment.status,
        rate: shipment.rate ? parseFloat(shipment.rate) : null,
        labelUrl: shipment.labelUrl,
        metadata: shipment,
      },
    });

    return dbShipment;
  }

  /**
   * Generate shipping label
   */
  static async generateLabel(shipmentId) {
    const shipment = await prisma.logisticsShipment.findUnique({
      where: { id: shipmentId },
      include: { provider: true },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const provider = await LogisticsProviderFactory.createProvider(shipment.provider.type);
    const labelData = await provider.generateLabel(shipment.providerShipmentId);

    // Update shipment with label URL
    await prisma.logisticsShipment.update({
      where: { id: shipmentId },
      data: { labelUrl: labelData.labelUrl },
    });

    return labelData;
  }

  /**
   * Schedule pickup
   */
  static async schedulePickup(shipmentId, pickupData) {
    const shipment = await prisma.logisticsShipment.findUnique({
      where: { id: shipmentId },
      include: { provider: true },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const provider = await LogisticsProviderFactory.createProvider(shipment.provider.type);
    const pickupResult = await provider.schedulePickup(shipment.providerShipmentId, pickupData);

    // Update shipment
    await prisma.logisticsShipment.update({
      where: { id: shipmentId },
      data: {
        pickupScheduled: true,
        pickupDate: pickupData.pickupDate ? new Date(pickupData.pickupDate) : null,
      },
    });

    return pickupResult;
  }

  /**
   * Cancel shipment
   */
  static async cancelShipment(shipmentId, reason) {
    const shipment = await prisma.logisticsShipment.findUnique({
      where: { id: shipmentId },
      include: { provider: true },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    if (['delivered', 'cancelled'].includes(shipment.status)) {
      throw new Error(`Cannot cancel shipment with status: ${shipment.status}`);
    }

    const provider = await LogisticsProviderFactory.createProvider(shipment.provider.type);
    await provider.cancelShipment(shipment.providerShipmentId, reason);

    // Update shipment
    const updated = await prisma.logisticsShipment.update({
      where: { id: shipmentId },
      data: {
        status: 'cancelled',
        providerStatus: 'CANCELLED',
      },
    });

    return updated;
  }

  /**
   * Handle return shipment
   */
  static async handleReturn(orderId, returnData) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get default provider or use specified
    const providerId = returnData.providerId;
    let providerConfig;
    if (providerId) {
      providerConfig = await LogisticsProviderFactory.getProviderById(providerId);
    } else {
      providerConfig = await LogisticsProviderFactory.getDefaultProvider();
    }

    if (!providerConfig || !providerConfig.isActive) {
      throw new Error('Logistics provider not available');
    }

    const provider = await LogisticsProviderFactory.createProvider(providerConfig.type);

    const preparedReturnData = {
      orderId: order.orderNumber,
      pickup: returnData.pickup || order.shippingAddress,
      delivery: returnData.delivery || order.shippingAddress,
      items: returnData.items || order.items.map(item => ({
        name: item.product.name,
        sku: item.product.sku || item.productId,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      total: returnData.total || parseFloat(order.total),
    };

    const returnShipment = await provider.handleReturn(preparedReturnData);

    return returnShipment;
  }

  /**
   * Get shipment status
   */
  static async getShipmentStatus(orderId) {
    const shipments = await prisma.logisticsShipment.findMany({
      where: { orderId },
      include: { provider: true },
      orderBy: { createdAt: 'desc' },
    });

    if (shipments.length === 0) {
      throw new Error('No shipments found for this order');
    }

    return shipments;
  }

  /**
   * Update tracking info in database
   */
  static async updateTrackingInfo(orderId, trackingData) {
    const shipment = await prisma.logisticsShipment.findFirst({
      where: { orderId },
    });

    if (shipment) {
      await prisma.logisticsShipment.update({
        where: { id: shipment.id },
        data: {
          status: trackingData.status,
          providerStatus: trackingData.providerStatus,
          estimatedDelivery: trackingData.estimatedDelivery
            ? new Date(trackingData.estimatedDelivery)
            : null,
          metadata: trackingData,
        },
      });
    }
  }

  /**
   * Parse Shiprocket webhook timestamp (e.g. "23 05 2023 11:43:52" DD MM YYYY HH:mm:ss)
   */
  static parseShiprocketTimestamp(str) {
    if (!str || typeof str !== 'string') return new Date();
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 5) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const timeParts = parts[3].split(':');
      const hour = parseInt(timeParts[0], 10) || 0;
      const min = parseInt(timeParts[1], 10) || 0;
      const sec = parseInt(timeParts[2], 10) || 0;
      const date = new Date(year, month, day, hour, min, sec);
      if (!Number.isNaN(date.getTime())) return date;
    }
    return new Date();
  }

  /**
   * Map Shiprocket current_status / shipment_status to our normalized status
   */
  static mapShiprocketStatusToNormalized(srStatus) {
    const s = (srStatus || '').toString().trim().toUpperCase().replace(/-/g, '_');
    if (['NEW', 'MANIFEST', 'READY_TO_SHIP'].some((k) => s.includes(k))) return 'created';
    if (s.includes('PICKED_UP') || s.includes('PICKED UP')) return 'picked_up';
    if (s.includes('IN_TRANSIT') || s.includes('IN TRANSIT') || s.includes('SHIPPED')) return 'in_transit';
    if (s.includes('OUT_FOR_DELIVERY') || s.includes('OUT FOR DELIVERY')) return 'out_for_delivery';
    if (s.includes('DELIVERED')) return 'delivered';
    if (s.includes('CANCELLED') || s.includes('RTO')) return 'cancelled';
    return 'in_transit';
  }

  /**
   * Process Shiprocket tracking webhook: verify (optional), find shipment, update status and metadata.
   * Always returns; throws are caught by the route which still responds 200.
   */
  static async processShiprocketTrackingWebhook(payload, anxApiKey = null) {
    if (!payload || typeof payload !== 'object') {
      logger.warn('Shiprocket webhook: empty or invalid payload');
      return;
    }

    const shiprocketProvider = await prisma.logisticsProvider.findFirst({
      where: { type: 'SHIPROCKET', isActive: true },
    });
    if (shiprocketProvider?.webhookSecret && anxApiKey !== shiprocketProvider.webhookSecret) {
      logger.warn('Shiprocket webhook: anx-api-key mismatch or missing');
    }

    let shipment = null;
    const awb = payload.awb ? String(payload.awb).trim() : '';
    const srOrderId = payload.sr_order_id != null ? String(payload.sr_order_id) : '';
    const orderIdRef = payload.order_id != null ? String(payload.order_id).trim() : '';

    if (awb) {
      shipment = await prisma.logisticsShipment.findFirst({
        where: { awbNumber: awb },
      });
    }
    if (!shipment && srOrderId) {
      shipment = await prisma.logisticsShipment.findFirst({
        where: { providerShipmentId: srOrderId },
      });
    }
    if (!shipment && orderIdRef) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: orderIdRef }, { id: orderIdRef }],
        },
      });
      if (order) {
        shipment = await prisma.logisticsShipment.findFirst({
          where: { orderId: order.id },
        });
      }
    }

    if (!shipment) {
      logger.warn('Shiprocket webhook: no shipment found', { awb, order_id: payload.order_id, sr_order_id: payload.sr_order_id });
      return;
    }

    const rawStatus = payload.current_status || payload.shipment_status || '';
    const normalizedStatus = this.mapShiprocketStatusToNormalized(rawStatus);
    const isDelivered = normalizedStatus === 'delivered';
    const parsedTimestamp = this.parseShiprocketTimestamp(payload.current_timestamp);

    const existingMeta = (shipment.metadata && typeof shipment.metadata === 'object') ? { ...shipment.metadata } : {};
    const updateData = {
      status: normalizedStatus,
      providerStatus: rawStatus || null,
      metadata: {
        ...existingMeta,
        lastWebhookPayload: {
          awb: payload.awb,
          order_id: payload.order_id,
          sr_order_id: payload.sr_order_id,
          current_status: payload.current_status,
          shipment_status: payload.shipment_status,
          scans: payload.scans,
          current_timestamp: payload.current_timestamp,
          etd: payload.etd,
          courier_name: payload.courier_name,
        },
      },
      ...(isDelivered && { actualDelivery: parsedTimestamp }),
    };

    await prisma.logisticsShipment.update({
      where: { id: shipment.id },
      data: updateData,
    });
    logger.info(`Shiprocket webhook: updated shipment ${shipment.id} status to ${normalizedStatus}`);
  }
}

module.exports = LogisticsService;
