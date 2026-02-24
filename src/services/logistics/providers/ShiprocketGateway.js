const ILogisticsProvider = require('../ILogisticsProvider');
const axios = require('axios');
const logger = require('../../../utils/logger');

class ShiprocketGateway extends ILogisticsProvider {
  constructor(config, providerConfig = null) {
    super(config, providerConfig);
    this.providerType = 'SHIPROCKET';
    this.baseUrl = config.environment === 'production'
      ? 'https://apiv2.shiprocket.in/v1/external'
      : 'https://apiv2.shiprocket.in/v1/external'; // Shiprocket uses same URL for both
    this.email = config.email;
    this.password = config.password;
    this.apiKey = config.apiKey;
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate and get access token
   */
  async authenticate() {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: this.email,
        password: this.password,
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        // Token typically expires in 24 hours, set expiry to 23 hours for safety
        this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);
        return this.token;
      }

      throw new Error('Failed to authenticate with Shiprocket');
    } catch (error) {
      logger.error('Shiprocket authentication error:', error.response?.data || error.message);
      throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(method, endpoint, data = null) {
    const token = await this.authenticate();
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      logger.error(`Shiprocket API error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw new Error(
        `Shiprocket API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Track shipment by AWB number
   */
  async trackShipment(trackingNumber) {
    try {
      const response = await this.makeRequest('GET', `/courier/track/awb/${trackingNumber}`);
      return this.normalizeTrackingResponse(response);
    } catch (error) {
      logger.error('Shiprocket trackShipment error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate shipping rates
   */
  async calculateRates(rateRequest) {
    try {
      const payload = {
        pickup_postcode: rateRequest.pickup.pincode,
        delivery_postcode: rateRequest.delivery.pincode,
        weight: rateRequest.weight,
        cod_amount: rateRequest.codAmount || 0,
      };

      if (rateRequest.dimensions) {
        payload.length = rateRequest.dimensions.length;
        payload.width = rateRequest.dimensions.width;
        payload.height = rateRequest.dimensions.height;
      }

      const response = await this.makeRequest('POST', '/courier/serviceability/', payload);
      return this.normalizeRateResponse(response);
    } catch (error) {
      logger.error('Shiprocket calculateRates error:', error.message);
      throw error;
    }
  }

  /**
   * Create shipment
   */
  async createShipment(shipmentData) {
    try {
      const payload = {
        order_id: shipmentData.order.orderNumber || shipmentData.order.id,
        order_date: new Date().toISOString(),
        pickup_location: shipmentData.pickup.name || 'Default',
        billing_customer_name: shipmentData.delivery.name,
        billing_last_name: shipmentData.delivery.lastName || '',
        billing_address: shipmentData.delivery.address,
        billing_address_2: shipmentData.delivery.address2 || '',
        billing_city: shipmentData.delivery.city,
        billing_pincode: shipmentData.delivery.pincode,
        billing_state: shipmentData.delivery.state,
        billing_country: shipmentData.delivery.country || 'India',
        billing_email: shipmentData.delivery.email,
        billing_phone: shipmentData.delivery.phone,
        shipping_is_billing: true,
        order_items: shipmentData.items.map(item => ({
          name: item.name,
          sku: item.sku,
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: shipmentData.paymentMethod || 'Prepaid',
        sub_total: shipmentData.order.subtotal,
        length: shipmentData.dimensions?.length || 10,
        breadth: shipmentData.dimensions?.width || 10,
        height: shipmentData.dimensions?.height || 10,
        weight: shipmentData.weight,
      };

      if (shipmentData.codAmount) {
        payload.cod_amount = shipmentData.codAmount;
      }

      const response = await this.makeRequest('POST', '/orders/create/adhoc', payload);
      
      return {
        id: response.order_id,
        awbNumber: response.awb_code,
        trackingNumber: response.awb_code,
        status: response.status,
        labelUrl: response.label_url,
        manifestUrl: response.manifest_url,
        rate: response.shipping_charges,
        ...response,
      };
    } catch (error) {
      logger.error('Shiprocket createShipment error:', error.message);
      throw error;
    }
  }

  /**
   * Generate shipping label
   */
  async generateLabel(shipmentId) {
    try {
      const response = await this.makeRequest('GET', `/courier/generate/label`, {
        shipment_id: shipmentId,
      });
      
      return {
        labelUrl: response.label_url,
        awbNumber: response.awb_code,
        ...response,
      };
    } catch (error) {
      logger.error('Shiprocket generateLabel error:', error.message);
      throw error;
    }
  }

  /**
   * Schedule pickup
   */
  async schedulePickup(shipmentId, pickupData) {
    try {
      const payload = {
        shipment_id: [shipmentId],
        pickup_date: pickupData.pickupDate || new Date().toISOString().split('T')[0],
        pickup_time: pickupData.pickupTime || '10:00-17:00',
      };

      const response = await this.makeRequest('POST', '/courier/assign/awb', payload);
      
      return {
        success: true,
        pickupDate: pickupData.pickupDate,
        ...response,
      };
    } catch (error) {
      logger.error('Shiprocket schedulePickup error:', error.message);
      throw error;
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(shipmentId, reason) {
    try {
      const response = await this.makeRequest('POST', '/orders/cancel/shipment/awbs', {
        awbs: [shipmentId],
        reason: reason || 'Cancelled by merchant',
      });
      
      return {
        success: true,
        cancelled: true,
        ...response,
      };
    } catch (error) {
      logger.error('Shiprocket cancelShipment error:', error.message);
      throw error;
    }
  }

  /**
   * Handle return shipment
   */
  async handleReturn(returnData) {
    try {
      const payload = {
        order_id: returnData.orderId,
        order_date: new Date().toISOString(),
        pickup_location: returnData.pickup.name || 'Default',
        billing_customer_name: returnData.pickup.name,
        billing_address: returnData.pickup.address,
        billing_city: returnData.pickup.city,
        billing_pincode: returnData.pickup.pincode,
        billing_state: returnData.pickup.state,
        billing_country: returnData.pickup.country || 'India',
        billing_email: returnData.pickup.email,
        billing_phone: returnData.pickup.phone,
        shipping_customer_name: returnData.delivery.name,
        shipping_address: returnData.delivery.address,
        shipping_city: returnData.delivery.city,
        shipping_pincode: returnData.delivery.pincode,
        shipping_state: returnData.delivery.state,
        shipping_country: returnData.delivery.country || 'India',
        shipping_email: returnData.delivery.email,
        shipping_phone: returnData.delivery.phone,
        order_items: returnData.items.map(item => ({
          name: item.name,
          sku: item.sku,
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: 'Prepaid',
        sub_total: returnData.total,
      };

      const response = await this.makeRequest('POST', '/orders/create/return-shipment', payload);
      
      return {
        id: response.order_id,
        awbNumber: response.awb_code,
        trackingNumber: response.awb_code,
        ...response,
      };
    } catch (error) {
      logger.error('Shiprocket handleReturn error:', error.message);
      throw error;
    }
  }

  /**
   * Normalize tracking response
   */
  normalizeTrackingResponse(rawResponse) {
    if (!rawResponse || !rawResponse.tracking_data) {
      return rawResponse;
    }

    const tracking = rawResponse.tracking_data;
    const events = tracking.track_status || [];

    return {
      trackingNumber: tracking.awb_code,
      status: this.normalizeStatus(tracking.current_status),
      providerStatus: tracking.current_status,
      events: events.map(event => ({
        timestamp: event.timestamp,
        location: event.location || '',
        status: this.normalizeStatus(event.status),
        description: event.status || '',
      })),
      estimatedDelivery: tracking.etd ? new Date(tracking.etd) : null,
      currentLocation: {
        city: tracking.current_location?.city || '',
        state: tracking.current_location?.state || '',
        pincode: tracking.current_location?.pincode || '',
      },
    };
  }

  /**
   * Normalize rate response
   */
  normalizeRateResponse(rawResponse) {
    if (!rawResponse || !rawResponse.data) {
      return [];
    }

    return rawResponse.data.available_courier_companies.map(company => ({
      provider: 'SHIPROCKET',
      courierCompanyId: company.courier_company_id,
      courierName: company.courier_name,
      rate: company.rate,
      estimatedDays: company.estimated_delivery_days,
      codAvailable: company.cod_available || false,
    }));
  }

  /**
   * Normalize status
   */
  normalizeStatus(providerStatus) {
    const statusMap = {
      'NEW': 'created',
      'READY_TO_SHIP': 'ready',
      'PICKED_UP': 'picked_up',
      'IN_TRANSIT': 'in_transit',
      'OUT_FOR_DELIVERY': 'out_for_delivery',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RTO': 'returned',
    };

    return statusMap[providerStatus] || providerStatus?.toLowerCase() || 'unknown';
  }
}

module.exports = ShiprocketGateway;
