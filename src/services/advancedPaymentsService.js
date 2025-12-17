const prisma = require('../config/database');
const { logger } = require('../utils/logger');

class AdvancedPaymentsService {
  // Payment links
  static async createPaymentLink(orderId, amount, description, expiresAt) {
    const paymentLink = await prisma.paymentLink.create({
      data: {
        orderId,
        amount,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        status: 'PENDING',
        linkToken: require('crypto').randomBytes(32).toString('hex'),
      },
    });

    const linkUrl = `${process.env.FRONTEND_URL}/pay/${paymentLink.linkToken}`;

    return {
      ...paymentLink,
      linkUrl,
    };
  }

  // Saved payment methods
  static async savePaymentMethod(userId, paymentMethodData) {
    const savedMethod = await prisma.savedPaymentMethod.create({
      data: {
        userId,
        type: paymentMethodData.type, // CARD, BANK_ACCOUNT, etc.
        provider: paymentMethodData.provider, // STRIPE, PAYPAL, etc.
        last4: paymentMethodData.last4,
        brand: paymentMethodData.brand,
        expiryMonth: paymentMethodData.expiryMonth,
        expiryYear: paymentMethodData.expiryYear,
        isDefault: paymentMethodData.isDefault || false,
        metadata: paymentMethodData.metadata || {},
      },
    });

    return savedMethod;
  }

  static async getSavedPaymentMethods(userId) {
    return prisma.savedPaymentMethod.findMany({
      where: { userId, isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // Smart payment routing
  static async routePayment(orderId, amount, currency, region) {
    // Get available payment gateways for region
    const gateways = await prisma.paymentGateway.findMany({
      where: {
        isActive: true,
        OR: [
          { regions: { has: region } },
          { regions: { isEmpty: true } },
        ],
      },
      orderBy: { priority: 'asc' },
    });

    if (gateways.length === 0) {
      throw new Error('No payment gateway available for region');
    }

    // Select best gateway based on:
    // 1. Success rate
    // 2. Fees
    // 3. Processing time
    // 4. Currency support
    const selectedGateway = gateways.find((g) => 
      g.supportedCurrencies?.includes(currency)
    ) || gateways[0];

    return {
      gatewayId: selectedGateway.id,
      gatewayName: selectedGateway.name,
      estimatedFees: this.calculateFees(amount, selectedGateway),
    };
  }

  static calculateFees(amount, gateway) {
    const fixedFee = gateway.fixedFee || 0;
    const percentageFee = (gateway.percentageFee || 0) / 100;
    return fixedFee + (amount * percentageFee);
  }

  // Payment retry logic
  static async retryPayment(paymentId, maxRetries = 3) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    // Update retry count
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        retryCount: { increment: 1 },
        lastRetryAt: new Date(),
      },
    });

    // TODO: Actually retry payment with gateway
    return {
      paymentId,
      retryCount: payment.retryCount + 1,
      status: 'RETRYING',
    };
  }

  // Split payments
  static async splitPayment(orderId, splits) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);

    if (Math.abs(totalSplit - order.total) > 0.01) {
      throw new Error('Split amounts must equal order total');
    }

    // Create payment splits
    const paymentSplits = await Promise.all(
      splits.map((split) =>
        prisma.paymentSplit.create({
          data: {
            orderId,
            amount: split.amount,
            paymentMethod: split.paymentMethod,
            gatewayId: split.gatewayId,
            status: 'PENDING',
          },
        })
      )
    );

    return paymentSplits;
  }

  // Payment reconciliation
  static async reconcilePayments(startDate, endDate) {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { in: ['COMPLETED', 'PENDING'] },
      },
      include: {
        order: true,
        gateway: true,
      },
    });

    const reconciliation = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byStatus: {},
      byGateway: {},
      discrepancies: [],
    };

    payments.forEach((payment) => {
      // Count by status
      reconciliation.byStatus[payment.status] = (reconciliation.byStatus[payment.status] || 0) + 1;

      // Count by gateway
      const gatewayName = payment.gateway?.name || 'UNKNOWN';
      reconciliation.byGateway[gatewayName] = (reconciliation.byGateway[gatewayName] || 0) + 1;

      // Check for discrepancies
      if (payment.order && Math.abs(payment.amount - payment.order.total) > 0.01) {
        reconciliation.discrepancies.push({
          paymentId: payment.id,
          orderId: payment.orderId,
          paymentAmount: payment.amount,
          orderAmount: payment.order.total,
          difference: payment.amount - payment.order.total,
        });
      }
    });

    return reconciliation;
  }

  // Chargeback management
  static async recordChargeback(paymentId, chargebackData) {
    const chargeback = await prisma.chargeback.create({
      data: {
        paymentId,
        reason: chargebackData.reason,
        amount: chargebackData.amount,
        status: 'PENDING',
        receivedAt: new Date(),
        metadata: chargebackData.metadata || {},
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CHARGEBACK',
      },
    });

    return chargeback;
  }
}

module.exports = { AdvancedPaymentsService };


