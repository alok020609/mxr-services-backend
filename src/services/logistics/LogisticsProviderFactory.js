const prisma = require('../../config/database');
const ShiprocketGateway = require('./providers/ShiprocketGateway');
// Future: const DelhiveryGateway = require('./providers/DelhiveryGateway');
// Future: const ClickPostGateway = require('./providers/ClickPostGateway');

class LogisticsProviderFactory {
  /**
   * Create provider instance from database configuration
   * @param {string} providerType - Provider type enum value
   * @returns {Promise<ILogisticsProvider>} Provider instance
   */
  static async createProvider(providerType) {
    const providerConfig = await prisma.logisticsProvider.findUnique({
      where: { type: providerType },
    });

    if (!providerConfig || !providerConfig.isActive) {
      throw new Error(`Logistics provider ${providerType} is not available`);
    }

    const config = providerConfig.config;

    // Factory pattern - easily extensible for new providers
    switch (providerType) {
      case 'SHIPROCKET':
        return new ShiprocketGateway(config, providerConfig);

      case 'DELHIVERY':
        // return new DelhiveryGateway(config, providerConfig);
        throw new Error('Delhivery gateway not yet implemented');

      case 'CLICKPOST':
        // return new ClickPostGateway(config, providerConfig);
        throw new Error('ClickPost gateway not yet implemented');

      case 'VAMASHIP':
        // return new VamashipGateway(config, providerConfig);
        throw new Error('Vamaship gateway not yet implemented');

      case 'SHIPJEE':
        // return new ShipjeeGateway(config, providerConfig);
        throw new Error('Shipjee gateway not yet implemented');

      case 'INDISPEED':
        // return new IndiSpeedGateway(config, providerConfig);
        throw new Error('IndiSpeed gateway not yet implemented');

      case 'ULIP':
        // return new ULIPGateway(config, providerConfig);
        throw new Error('ULIP gateway not yet implemented');

      // Add more providers here as they're implemented

      default:
        throw new Error(`Unsupported logistics provider: ${providerType}`);
    }
  }

  /**
   * Get all available (active) providers
   */
  static async getAvailableProviders() {
    return await prisma.logisticsProvider.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { priority: 'asc' }],
    });
  }

  /**
   * Get default active provider
   */
  static async getDefaultProvider() {
    return await prisma.logisticsProvider.findFirst({
      where: { isActive: true, isDefault: true },
    });
  }

  /**
   * Get provider by ID
   */
  static async getProviderById(providerId) {
    return await prisma.logisticsProvider.findUnique({
      where: { id: providerId },
    });
  }

  /**
   * Get provider by type
   */
  static async getProviderByType(providerType) {
    return await prisma.logisticsProvider.findUnique({
      where: { type: providerType },
    });
  }
}

module.exports = LogisticsProviderFactory;
