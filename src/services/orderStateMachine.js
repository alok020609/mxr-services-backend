const prisma = require('../config/database');
const { logger } = require('../utils/logger');

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

// Valid state transitions
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

// State transition guards
const guards = {
  canCancel: async (order) => {
    const cancellableStates = [ORDER_STATES.CREATED, ORDER_STATES.PAYMENT_PENDING, ORDER_STATES.PAID, ORDER_STATES.PACKED];
    return cancellableStates.includes(order.status);
  },
  canRefund: async (order) => {
    return [ORDER_STATES.PAID, ORDER_STATES.PACKED, ORDER_STATES.SHIPPED, ORDER_STATES.DELIVERED, ORDER_STATES.RETURNED].includes(order.status);
  },
  canShip: async (order) => {
    return order.status === ORDER_STATES.PACKED;
  },
  canDeliver: async (order) => {
    return order.status === ORDER_STATES.SHIPPED;
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

  static async transition(orderId, newState, metadata = {}) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!this.isValidTransition(order.status, newState)) {
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

    // Record state history
    await prisma.orderTracking.create({
      data: {
        orderId,
        status: newState,
        message: metadata.message || `Order status changed to ${newState}`,
        metadata: metadata,
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
    return prisma.orderTracking.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = { OrderStateMachine, ORDER_STATES, STATE_TRANSITIONS };

