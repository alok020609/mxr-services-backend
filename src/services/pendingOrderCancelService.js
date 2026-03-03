const prisma = require('../config/database');
const logger = require('../utils/logger');
const { restoreOrderInventory } = require('./orderInventoryRestore');

const DEFAULT_THRESHOLD_HOURS = 24;

/**
 * Find orders that are expired unpaid (CREATED/PAYMENT_PENDING, no SUCCEEDED payment, older than threshold)
 * and cancel them: re-check no SUCCEEDED payment in transaction, restore inventory, set CANCELLED, add state history.
 * Payment-confirmed orders are never touched.
 * @returns {{ cancelledCount: number }}
 */
async function cancelExpiredUnpaidOrders() {
  const thresholdHours = parseInt(process.env.PENDING_ORDER_CANCEL_AFTER_HOURS, 10) || DEFAULT_THRESHOLD_HOURS;
  const includeCreated = process.env.PENDING_ORDER_CANCEL_INCLUDE_CREATED === 'true';

  const cutoff = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);
  const statuses = includeCreated ? ['CREATED', 'PAYMENT_PENDING'] : ['PAYMENT_PENDING'];

  const orders = await prisma.order.findMany({
    where: {
      status: { in: statuses },
      updatedAt: { lt: cutoff },
      payments: { none: { status: 'SUCCEEDED' } },
    },
    include: {
      items: { select: { productId: true, variantId: true, quantity: true } },
      payments: { select: { id: true, status: true } },
    },
  });

  let cancelledCount = 0;

  for (const order of orders) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Re-check: no SUCCEEDED payment (guard against race with payment callback)
        const payments = await tx.payment.findMany({
          where: { orderId: order.id },
          select: { status: true },
        });
        if (payments.some((p) => p.status === 'SUCCEEDED')) {
          return { cancelled: false };
        }

        await restoreOrderInventory(tx, order.items);

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });

        await tx.orderStateHistory.create({
          data: {
            orderId: order.id,
            fromState: order.status,
            toState: 'CANCELLED',
            userId: null,
            reason: `Auto-cancelled: payment not completed within ${thresholdHours} hours`,
          },
        });

        return { cancelled: true };
      });

      if (result.cancelled) {
        cancelledCount += 1;
        logger.info('Auto-cancelled expired unpaid order', { orderId: order.id, orderNumber: order.orderNumber });
      }
    } catch (err) {
      logger.error('Failed to auto-cancel order', { orderId: order.id, error: err.message });
      // Continue with other orders
    }
  }

  if (cancelledCount > 0) {
    logger.info('Pending order cancel job completed', { cancelledCount, thresholdHours });
  }

  return { cancelledCount };
}

module.exports = {
  cancelExpiredUnpaidOrders,
};
