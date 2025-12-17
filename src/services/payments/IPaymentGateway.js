/**
 * Payment Gateway Interface
 * All payment gateways must implement this interface
 */
class IPaymentGateway {
  /**
   * Create a payment intent/order
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment intent/order response
   */
  async createPayment(paymentData) {
    throw new Error('createPayment must be implemented');
  }

  /**
   * Confirm/verify a payment
   * @param {string} paymentId - Payment ID
   * @param {Object} verificationData - Verification data
   * @returns {Promise<Object>} Payment confirmation response
   */
  async confirmPayment(paymentId, verificationData) {
    throw new Error('confirmPayment must be implemented');
  }

  /**
   * Process a refund
   * @param {string} paymentId - Payment ID
   * @param {number} amount - Refund amount
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund response
   */
  async refundPayment(paymentId, amount, reason) {
    throw new Error('refundPayment must be implemented');
  }

  /**
   * Get payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(paymentId) {
    throw new Error('getPaymentStatus must be implemented');
  }

  /**
   * Handle webhook event
   * @param {Object} webhookData - Webhook payload
   * @param {string} signature - Webhook signature
   * @returns {Promise<Object>} Processed webhook event
   */
  async handleWebhook(webhookData, signature) {
    throw new Error('handleWebhook must be implemented');
  }
}

module.exports = IPaymentGateway;


