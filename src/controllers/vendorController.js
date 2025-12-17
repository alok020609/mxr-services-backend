const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const registerAsVendor = asyncHandler(async (req, res) => {
  // Check if user already has vendor account
  const existingVendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (existingVendor) {
    return res.status(400).json({
      success: false,
      error: 'You are already registered as a vendor',
    });
  }

  const { name, commissionRate } = req.body;

  const vendor = await prisma.vendor.create({
    data: {
      userId: req.user.id,
      name,
      commissionRate: commissionRate || 10,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    success: true,
    data: vendor,
    message: 'Vendor registration submitted. Waiting for approval.',
  });
});

const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      error: 'Vendor account not found',
    });
  }

  const [
    totalProducts,
    activeProducts,
    totalOrders,
    totalRevenue,
    pendingPayouts,
  ] = await Promise.all([
    prisma.vendorProduct.count({
      where: { vendorId: vendor.id },
    }),
    prisma.vendorProduct.count({
      where: {
        vendorId: vendor.id,
        status: 'APPROVED',
      },
    }),
    prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              vendorProducts: {
                some: {
                  vendorId: vendor.id,
                },
              },
            },
          },
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        items: {
          some: {
            product: {
              vendorProducts: {
                some: {
                  vendorId: vendor.id,
                },
              },
            },
          },
        },
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
      },
      _sum: { total: true },
    }),
    prisma.vendorPayout.aggregate({
      where: {
        vendorId: vendor.id,
        status: 'PENDING',
      },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      vendor,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingPayouts: pendingPayouts._sum.amount || 0,
      },
    },
  });
});

const getVendorProducts = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      error: 'Vendor account not found',
    });
  }

  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    vendorId: vendor.id,
    ...(status && { status }),
  };

  const [vendorProducts, total] = await Promise.all([
    prisma.vendorProduct.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        product: {
          include: {
            category: true,
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vendorProduct.count({ where }),
  ]);

  res.json({
    success: true,
    data: vendorProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const addVendorProduct = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor || vendor.status !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      error: 'Vendor account not approved',
    });
  }

  const { productId, commission } = req.body;

  const vendorProduct = await prisma.vendorProduct.create({
    data: {
      vendorId: vendor.id,
      productId,
      status: 'PENDING',
      commission: commission || vendor.commissionRate,
    },
    include: {
      product: true,
    },
  });

  res.status(201).json({
    success: true,
    data: vendorProduct,
    message: 'Product submitted for approval',
  });
});

const getVendorPayouts = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      error: 'Vendor account not found',
    });
  }

  const payouts = await prisma.vendorPayout.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: payouts,
  });
});

module.exports = {
  registerAsVendor,
  getVendorDashboard,
  getVendorProducts,
  addVendorProduct,
  getVendorPayouts,
};


