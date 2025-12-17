const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const createTicket = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: req.user.id,
      subject,
      status: 'OPEN',
      priority: 'MEDIUM',
      messages: {
        create: {
          userId: req.user.id,
          message,
        },
      },
    },
    include: {
      messages: true,
    },
  });

  res.status(201).json({
    success: true,
    data: ticket,
  });
});

const getTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId: req.user.id,
    ...(status && { status }),
  };

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  res.json({
    success: true,
    data: tickets,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getTicket = asyncHandler(async (req, res) => {
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      messages: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: 'Ticket not found',
    });
  }

  res.json({
    success: true,
    data: ticket,
  });
});

const addMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: 'Ticket not found',
    });
  }

  const supportMessage = await prisma.supportMessage.create({
    data: {
      ticketId: ticket.id,
      userId: req.user.id,
      message,
    },
  });

  // Update ticket status if it was closed
  if (ticket.status === 'CLOSED') {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'OPEN' },
    });
  }

  res.status(201).json({
    success: true,
    data: supportMessage,
  });
});

const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: 'Ticket not found',
    });
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: 'CLOSED' },
  });

  res.json({
    success: true,
    data: updatedTicket,
  });
});

const getFAQs = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const faqs = await prisma.fAQ.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
    },
    orderBy: { order: 'asc' },
  });

  res.json({
    success: true,
    data: faqs,
  });
});

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  addMessage,
  closeTicket,
  getFAQs,
};


