const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getWallet = asyncHandler(async (req, res) => {
  let wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: req.user.id,
        balance: 0,
        currency: 'USD',
      },
      include: {
        transactions: true,
      },
    });
  }

  res.json({
    success: true,
    data: wallet,
  });
});

const addToWallet = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;

  let wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.id },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: req.user.id,
        balance: 0,
        currency: 'USD',
      },
    });
  }

  // Add to wallet
  const updatedWallet = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: wallet.balance + parseFloat(amount),
    },
  });

  // Record transaction
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: 'CREDIT',
      amount: parseFloat(amount),
      description: description || 'Wallet top-up',
    },
  });

  res.json({
    success: true,
    data: updatedWallet,
  });
});

const getStoreCredits = asyncHandler(async (req, res) => {
  const storeCredits = await prisma.storeCredit.findMany({
    where: {
      userId: req.user.id,
      balance: { gt: 0 },
    },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalBalance = storeCredits.reduce((sum, credit) => sum + credit.balance, 0);

  res.json({
    success: true,
    data: {
      credits: storeCredits,
      totalBalance,
    },
  });
});

const getInvoices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        order: {
          userId: req.user.id,
        },
      },
      skip,
      take: parseInt(limit),
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({
      where: {
        order: {
          userId: req.user.id,
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: invoices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: req.params.id,
      order: {
        userId: req.user.id,
      },
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found',
    });
  }

  res.json({
    success: true,
    data: invoice,
  });
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: req.params.id,
      order: {
        userId: req.user.id,
      },
    },
  });

  if (!invoice || !invoice.pdfUrl) {
    return res.status(404).json({
      success: false,
      error: 'Invoice PDF not found',
    });
  }

  // TODO: Generate PDF if not exists
  res.json({
    success: true,
    data: {
      pdfUrl: invoice.pdfUrl,
    },
  });
});

module.exports = {
  getWallet,
  addToWallet,
  getStoreCredits,
  getInvoices,
  getInvoice,
  downloadInvoice,
};


