const prisma = require('../config/database');
const { OrderStateMachine, ORDER_STATES } = require('../services/orderStateMachine');
const { asyncHandler } = require('../utils/asyncHandler');

const transitionOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { newState, metadata: bodyMetadata } = req.body;

  if (!Object.values(ORDER_STATES).includes(newState)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order state',
    });
  }

  const metadata = { ...(bodyMetadata || {}), userId: req.user?.id };
  const order = await OrderStateMachine.transition(orderId, newState, metadata);

  res.json({
    success: true,
    data: order,
    message: `Order status changed to ${newState}`,
  });
});

const rollbackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { previousState } = req.body;

  const order = await OrderStateMachine.rollback(orderId, previousState);

  res.json({
    success: true,
    data: order,
    message: `Order rolled back to ${previousState}`,
  });
});

const getStateHistory = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const history = await OrderStateMachine.getStateHistory(orderId);

  res.json({
    success: true,
    data: history,
  });
});

const getAvailableTransitions = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true, logisticsShipments: true },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const { availableTransitions, context } = await OrderStateMachine.getAvailableTransitions(order);

  res.json({
    success: true,
    data: {
      currentState: order.status,
      availableTransitions,
      context,
    },
  });
});

module.exports = {
  transitionOrder,
  rollbackOrder,
  getStateHistory,
  getAvailableTransitions,
};


