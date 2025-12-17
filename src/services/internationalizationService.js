const prisma = require('../config/database');
const { logger } = require('../utils/logger');

class InternationalizationService {
  // Regional pricing
  static async getRegionalPrice(productId, region) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        regionalPricing: {
          where: { region },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const regionalPrice = product.regionalPricing[0];

    return {
      productId,
      region,
      basePrice: product.price,
      regionalPrice: regionalPrice?.price || product.price,
      currency: regionalPrice?.currency || product.currency,
    };
  }

  // Regional product availability
  static async getRegionalAvailability(productId, region) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        regionalAvailability: {
          where: { region },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const availability = product.regionalAvailability[0];

    return {
      productId,
      region,
      isAvailable: availability?.isAvailable ?? product.isActive,
      availableFrom: availability?.availableFrom,
      availableUntil: availability?.availableUntil,
    };
  }

  // Get regional payment methods
  static async getRegionalPaymentMethods(region) {
    const paymentMethods = await prisma.paymentGateway.findMany({
      where: {
        isActive: true,
        OR: [
          { regions: { has: region } },
          { regions: { isEmpty: true } }, // Global payment methods
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
      },
    });

    return paymentMethods;
  }

  // Get regional shipping carriers
  static async getRegionalShippingCarriers(region) {
    const carriers = await prisma.shippingCarrier.findMany({
      where: {
        isActive: true,
        OR: [
          { regions: { has: region } },
          { regions: { isEmpty: true } }, // Global carriers
        ],
      },
    });

    return carriers;
  }

  // Multi-store management
  static async getStores() {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      include: {
        settings: true,
      },
    });

    return stores;
  }

  static async getStore(storeId) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        settings: true,
        currency: true,
        language: true,
      },
    });

    return store;
  }

  static async createStore(storeData) {
    const store = await prisma.store.create({
      data: {
        name: storeData.name,
        domain: storeData.domain,
        region: storeData.region,
        currencyId: storeData.currencyId,
        languageId: storeData.languageId,
        isActive: storeData.isActive !== undefined ? storeData.isActive : true,
      },
    });

    return store;
  }

  // Regional legal compliance
  static async getRegionalCompliance(region) {
    const compliance = await prisma.regionalCompliance.findFirst({
      where: { region },
    });

    return compliance || {
      region,
      gdprCompliant: false,
      ccpaCompliant: false,
      vatRequired: false,
      taxRules: [],
    };
  }
}

module.exports = { InternationalizationService };


