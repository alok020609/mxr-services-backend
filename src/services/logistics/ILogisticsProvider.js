/**
 * Base interface for all logistics providers
 * All provider implementations MUST extend this class
 */
class ILogisticsProvider {
  constructor(config, providerConfig = null) {
    this.config = config;
    this.providerConfig = providerConfig;
    this.providerType = null; // Set by implementing class
  }

  // Core operations (all providers must implement)

  /**
   * Track a shipment by tracking number or AWB
   * @param {string} trackingNumber - Tracking number or AWB
   * @returns {Promise<Object>} Tracking information
   */
  async trackShipment(trackingNumber) {
    throw new Error('trackShipment must be implemented');
  }

  /**
   * Calculate shipping rates for a shipment
   * @param {Object} rateRequest - Rate calculation request
   * @param {Object} rateRequest.pickup - Pickup address details
   * @param {Object} rateRequest.delivery - Delivery address details
   * @param {number} rateRequest.weight - Weight in kg
   * @param {Object} rateRequest.dimensions - Dimensions {length, width, height} in cm
   * @param {string} rateRequest.codAmount - COD amount if applicable
   * @returns {Promise<Array>} Array of available rates
   */
  async calculateRates(rateRequest) {
    throw new Error('calculateRates must be implemented');
  }

  /**
   * Create a new shipment
   * @param {Object} shipmentData - Shipment data
   * @param {Object} shipmentData.order - Order information
   * @param {Object} shipmentData.pickup - Pickup address
   * @param {Object} shipmentData.delivery - Delivery address
   * @param {Array} shipmentData.items - Shipment items
   * @returns {Promise<Object>} Created shipment details
   */
  async createShipment(shipmentData) {
    throw new Error('createShipment must be implemented');
  }

  /**
   * Generate shipping label for a shipment
   * @param {string} shipmentId - Provider's shipment ID
   * @returns {Promise<Object>} Label URL and details
   */
  async generateLabel(shipmentId) {
    throw new Error('generateLabel must be implemented');
  }

  /**
   * Schedule a pickup for a shipment
   * @param {string} shipmentId - Provider's shipment ID
   * @param {Object} pickupData - Pickup scheduling data
   * @returns {Promise<Object>} Pickup confirmation
   */
  async schedulePickup(shipmentId, pickupData) {
    throw new Error('schedulePickup must be implemented');
  }

  /**
   * Cancel a shipment
   * @param {string} shipmentId - Provider's shipment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancelShipment(shipmentId, reason) {
    throw new Error('cancelShipment must be implemented');
  }

  /**
   * Handle a return shipment
   * @param {Object} returnData - Return shipment data
   * @returns {Promise<Object>} Return shipment details
   */
  async handleReturn(returnData) {
    throw new Error('handleReturn must be implemented');
  }

  // Optional operations (can throw "not supported" error)

  /**
   * Get manifest for shipments
   * @param {Object} manifestData - Manifest request data
   * @returns {Promise<Object>} Manifest details
   */
  async getManifest(manifestData) {
    throw new Error('getManifest not supported by this provider');
  }

  // Helper methods for standardization

  /**
   * Normalize provider-specific tracking response to standard format
   * @param {Object} rawResponse - Raw response from provider API
   * @returns {Object} Normalized tracking response
   */
  normalizeTrackingResponse(rawResponse) {
    // Override to normalize provider-specific responses
    return rawResponse;
  }

  /**
   * Normalize provider-specific rate response to standard format
   * @param {Object} rawResponse - Raw response from provider API
   * @returns {Array} Normalized rate responses
   */
  normalizeRateResponse(rawResponse) {
    // Override to normalize provider-specific responses
    return rawResponse;
  }

  /**
   * Normalize provider-specific status to standard status
   * @param {string} providerStatus - Provider-specific status
   * @returns {string} Standardized status
   */
  normalizeStatus(providerStatus) {
    // Override to map provider statuses to standard statuses
    return providerStatus;
  }
}

module.exports = ILogisticsProvider;
