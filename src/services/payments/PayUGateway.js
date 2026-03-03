const crypto = require('crypto');
const IPaymentGateway = require('./IPaymentGateway');

const PAYU_URLS = {
  test: 'https://test.payu.in/_payment',
  sandbox: 'https://test.payu.in/_payment',
  production: 'https://secure.payu.in/_payment',
};

/**
 * PayU Hosted Checkout – redirect flow with SHA-512 hash.
 * Server builds form params + hash; client POSTs to PayU; PayU POSTs back to surl/furl.
 */
class PayUGateway extends IPaymentGateway {
  constructor(config) {
    super();
    this.key = config.key;
    this.salt = config.salt;
    this.environment = config.environment || 'test';
    this.redirectUrl = config.successRedirectUrl || null;
    this.failureRedirectUrl = config.failureRedirectUrl || null;
  }

  getBaseUrl() {
    return PAYU_URLS[this.environment] || PAYU_URLS.test;
  }

  /**
   * Request hash: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
   * Empty string for missing udf.
   */
  static generateRequestHash(params, salt) {
    const udf1 = params.udf1 || '';
    const udf2 = params.udf2 || '';
    const udf3 = params.udf3 || '';
    const udf4 = params.udf4 || '';
    const udf5 = params.udf5 || '';
    const str =
      `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|` +
      `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    return crypto.createHash('sha512').update(str).digest('hex').toLowerCase();
  }

  /**
   * Response hash (reverse): sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
   * Compare computed digest to payload.hash (case-sensitive).
   */
  static verifyResponseHash(payload, salt) {
    const status = payload.status || '';
    const udf1 = payload.udf1 || '';
    const udf2 = payload.udf2 || '';
    const udf3 = payload.udf3 || '';
    const udf4 = payload.udf4 || '';
    const udf5 = payload.udf5 || '';
    const email = payload.email || '';
    const firstname = payload.firstname || '';
    const productinfo = payload.productinfo || '';
    const amount = payload.amount || '';
    const txnid = payload.txnid || '';
    const key = payload.key || '';
    const str =
      `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const computed = crypto.createHash('sha512').update(str).digest('hex');
    return computed === (payload.hash || '');
  }

  async createPayment(paymentData) {
    const {
      amount,
      currency,
      orderId,
      orderNumber,
      firstname,
      email,
      phone,
      surl,
      furl,
      txnid,
    } = paymentData;

    const productinfo = paymentData.productinfo || `Order ${orderNumber || orderId}`;
    const udf1 = orderId || '';
    const formParams = {
      key: this.key,
      txnid: txnid || `${orderId}-${Date.now()}`,
      amount: String(Number(amount).toFixed(2)),
      productinfo,
      firstname: firstname || 'Customer',
      email: email || '',
      phone: phone || '',
      surl: surl || '',
      furl: furl || '',
      udf1,
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };

    formParams.hash = PayUGateway.generateRequestHash(formParams, this.salt);

    return {
      redirectUrl: this.getBaseUrl(),
      formData: formParams,
      transactionId: formParams.txnid,
    };
  }

  async confirmPayment(paymentId, verificationData) {
    throw new Error('PayU uses redirect callback; do not call confirmPayment');
  }

  async refundPayment(paymentId, amount, reason) {
    throw new Error('PayU refund not yet implemented');
  }

  async getPaymentStatus(paymentId) {
    return {
      status: 'PENDING',
      message: 'PayU status should be confirmed via callback or Verify Payment API',
    };
  }

  async handleWebhook(webhookData, signature) {
    throw new Error('PayU S2S webhook not yet implemented');
  }
}

module.exports = PayUGateway;
