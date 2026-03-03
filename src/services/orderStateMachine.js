const prisma = require('../config/database');
const logger = require('../utils/logger');

// Order state definitions
const ORDER_STATES = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAID: 'PAID',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  RETURNED: 'RETURNED',
};

// Valid state transitions (base map; filtered by context in getAvailableTransitions)
const STATE_TRANSITIONS = {
  [ORDER_STATES.CREATED]: [ORDER_STATES.PAYMENT_PENDING, ORDER_STATES.CANCELLED],
  [ORDER_STATES.PAYMENT_PENDING]: [ORDER_STATES.PAID, ORDER_STATES.PAYMENT_FAILED, ORDER_STATES.CANCELLED],
  [ORDER_STATES.PAYMENT_FAILED]: [ORDER_STATES.PAYMENT_PENDING, ORDER_STATES.CANCELLED],
  [ORDER_STATES.PAID]: [ORDER_STATES.PACKED, ORDER_STATES.CANCELLED, ORDER_STATES.REFUNDED],
  [ORDER_STATES.PACKED]: [ORDER_STATES.SHIPPED, ORDER_STATES.CANCELLED],
  [ORDER_STATES.SHIPPED]: [ORDER_STATES.DELIVERED, ORDER_STATES.RETURNED],
  [ORDER_STATES.DELIVERED]: [ORDER_STATES.COMPLETED, ORDER_STATES.RETURNED],
  [ORDER_STATES.COMPLETED]: [],
  [ORDER_STATES.CANCELLED]: [],
  [ORDER_STATES.REFUNDED]: [],
  [ORDER_STATES.RETURNED]: [ORDER_STATES.REFUNDED],
};

// Derive order context for transition rules (payment method, shipping)
function deriveOrderContext(order) {
  const payments = order.payments || [];
  const isCod = payments.some((p) => p.gateway === 'COD');
  const shippingAmount = Number(order.shipping) || 0;
  const hasShipments = order.logisticsShipments && order.logisticsShipments.length > 0;
  const hasShippingAddress =
    order.shippingAddress &&
    typeof order.shippingAddress === 'object' &&
    Object.keys(order.shippingAddress).length > 0;
  const requiresShipping = shippingAmount > 0 || hasShipments || !!hasShippingAddress;
  return { isCod, requiresShipping };
}

// State transition guards (use deriveOrderContext so execution matches getAvailableTransitions)
const guards = {
  canCancel: async (order) => {
    const cancellableStates = [ORDER_STATES.CREATED, ORDER_STATES.PAYMENT_PENDING, ORDER_STATES.PAID, ORDER_STATES.PACKED];
    return cancellableStates.includes(order.status);
  },
  canRefund: async (order) => {
    const { isCod } = deriveOrderContext(order);
    const refundableStates = [ORDER_STATES.PAID, ORDER_STATES.PACKED, ORDER_STATES.SHIPPED, ORDER_STATES.DELIVERED, ORDER_STATES.RETURNED];
    if (!refundableStates.includes(order.status)) return false;
    // COD: allow REFUNDED only after delivery (DELIVERED, COMPLETED, RETURNED)
    if (isCod) {
      return [ORDER_STATES.DELIVERED, ORDER_STATES.COMPLETED, ORDER_STATES.RETURNED].includes(order.status);
    }
    return true;
  },
  canShip: async (order) => {
    const { requiresShipping } = deriveOrderContext(order);
    return order.status === ORDER_STATES.PACKED && requiresShipping;
  },
  canDeliver: async (order) => {
    const { requiresShipping } = deriveOrderContext(order);
    return order.status === ORDER_STATES.SHIPPED && requiresShipping;
  },
  canPacked: async (order) => {
    const { isCod } = deriveOrderContext(order);
    if (isCod) {
      return [ORDER_STATES.CREATED, ORDER_STATES.PAYMENT_PENDING, ORDER_STATES.PAID].includes(order.status);
    }
    return order.status === ORDER_STATES.PAID;
  },
  canCompleted: async (order) => {
    const { requiresShipping, isCod } = deriveOrderContext(order);
    if (requiresShipping) {
      // COD: PAID means cash collected after delivery, so allow COMPLETED from PAID too
      if (isCod && order.status === ORDER_STATES.PAID) return true;
      return order.status === ORDER_STATES.DELIVERED;
    }
    return order.status === ORDER_STATES.PAID || order.status === ORDER_STATES.DELIVERED;
  },
  canPaid: async (order) => {
    const { isCod } = deriveOrderContext(order);
    if (isCod) return order.status === ORDER_STATES.DELIVERED;
    return order.status === ORDER_STATES.PAYMENT_PENDING;
  },
};

// State transition actions
const actions = {
  onPaymentPending: async (order) => {
    // Send payment pending notification
    logger.info(`Order ${order.id} moved to PAYMENT_PENDING`);
  },
  onPaid: async (order) => {
    // Update inventory, send confirmation
    logger.info(`Order ${order.id} moved to PAID`);
  },
  onPacked: async (order) => {
    // Prepare for shipping
    logger.info(`Order ${order.id} moved to PACKED`);
  },
  onShipped: async (order) => {
    // Send tracking information
    logger.info(`Order ${order.id} moved to SHIPPED`);
  },
  onDelivered: async (order) => {
    // Mark as delivered, trigger completion timer
    logger.info(`Order ${order.id} moved to DELIVERED`);
  },
  onCompleted: async (order) => {
    // Finalize order, award loyalty points
    logger.info(`Order ${order.id} moved to COMPLETED`);
  },
  onCancelled: async (order) => {
    // Restore inventory, process refund if paid
    logger.info(`Order ${order.id} moved to CANCELLED`);
  },
  onRefunded: async (order) => {
    // Process refund, update payment status
    logger.info(`Order ${order.id} moved to REFUNDED`);
  },
};

class OrderStateMachine {
  static isValidTransition(fromState, toState) {
    const allowedTransitions = STATE_TRANSITIONS[fromState] || [];
    return allowedTransitions.includes(toState);
  }

  /**
   * Get context-aware available transitions for an order (payment method, shipping).
   * Order must have payments and logisticsShipments loaded, or they will be fetched.
   */
  static async getAvailableTransitions(order) {
    let o = order;
    if (!o.payments || !Array.isArray(o.logisticsShipments)) {
      o = await prisma.order.findUnique({
        where: { id: o.id },
        include: { payments: true, logisticsShipments: true },
      });
      if (!o) return { availableTransitions: [], context: { requiresShipping: false, paymentMethod: 'prepaid' } };
    }
    const { isCod, requiresShipping } = deriveOrderContext(o);
    let allowed = [...(STATE_TRANSITIONS[o.status] || [])];

    // No shipping: from PAID skip fulfillment states and allow COMPLETED
    if (!requiresShipping) {
      const fulfillmentStates = [ORDER_STATES.PACKED, ORDER_STATES.SHIPPED, ORDER_STATES.DELIVERED];
      allowed = allowed.filter((s) => !fulfillmentStates.includes(s));
      if (o.status === ORDER_STATES.PAID && !allowed.includes(ORDER_STATES.COMPLETED)) {
        allowed.push(ORDER_STATES.COMPLETED);
      }
    }

    // COD: from CREATED/PAYMENT_PENDING allow PACKED; from DELIVERED allow PAID; from PAID allow COMPLETED only (not PACKED)
    if (isCod) {
      if (
        (o.status === ORDER_STATES.CREATED || o.status === ORDER_STATES.PAYMENT_PENDING) &&
        !allowed.includes(ORDER_STATES.PACKED)
      ) {
        allowed.push(ORDER_STATES.PACKED);
      }
      if (o.status === ORDER_STATES.DELIVERED && !allowed.includes(ORDER_STATES.PAID)) {
        allowed.push(ORDER_STATES.PAID);
      }
      if (o.status === ORDER_STATES.PAID) {
        if (!allowed.includes(ORDER_STATES.COMPLETED)) allowed.push(ORDER_STATES.COMPLETED);
        // COD already delivered and paid; do not allow going back to PACKED
        allowed = allowed.filter((s) => s !== ORDER_STATES.PACKED);
      }
      // COD: REFUNDED only after delivery (remove from PAID/PACKED/SHIPPED)
      if ([ORDER_STATES.PAID, ORDER_STATES.PACKED, ORDER_STATES.SHIPPED].includes(o.status)) {
        allowed = allowed.filter((s) => s !== ORDER_STATES.REFUNDED);
      }
    }

    const context = {
      requiresShipping,
      paymentMethod: isCod ? 'COD' : 'prepaid',
    };
    return { availableTransitions: allowed, context };
  }

  static async isTransitionAllowed(order, newState) {
    const { availableTransitions } = await this.getAvailableTransitions(order);
    return availableTransitions.includes(newState);
  }

  static async transition(orderId, newState, metadata = {}) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true, logisticsShipments: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const allowed = await this.isTransitionAllowed(order, newState);
    if (!allowed) {
      throw new Error(`Invalid transition from ${order.status} to ${newState}`);
    }

    // Execute guard if exists
    const guardName = `can${newState.charAt(0) + newState.slice(1).toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`;
    if (guards[guardName] && !(await guards[guardName](order))) {
      throw new Error(`Guard check failed for transition to ${newState}`);
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newState,
        version: { increment: 1 },
      },
    });

    // When transitioning to PAID, mark order's payment(s) as SUCCEEDED (e.g. COD cash collected)
    if (newState === ORDER_STATES.PAID) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: 'SUCCEEDED' },
      });
    }

    // Record state history (OrderStateHistory for order detail; OrderTracking for tracking)
    await prisma.orderStateHistory.create({
      data: {
        orderId,
        fromState: order.status,
        toState: newState,
        userId: metadata?.userId ?? null,
        reason: metadata?.reason ?? null,
      },
    });
    const message = metadata.message || `Order status changed to ${newState}`;
    await prisma.orderTracking.create({
      data: {
        orderId,
        status: newState,
        events: [{ at: new Date().toISOString(), message, ...metadata }],
      },
    });

    // Execute action
    const actionName = `on${newState.charAt(0) + newState.slice(1).toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`;
    if (actions[actionName]) {
      await actions[actionName](updatedOrder);
    }

    return updatedOrder;
  }

  static async rollback(orderId, previousState) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Rollback to previous state
    const rolledBackOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: previousState,
        version: { increment: 1 },
      },
    });

    await prisma.orderTracking.create({
      data: {
        orderId,
        status: previousState,
        message: `Order rolled back to ${previousState}`,
      },
    });

    return rolledBackOrder;
  }

  static getStateHistory(orderId) {
    return prisma.orderStateHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}

module.exports = { OrderStateMachine, ORDER_STATES, STATE_TRANSITIONS };

