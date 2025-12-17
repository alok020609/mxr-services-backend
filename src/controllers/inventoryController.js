const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getInventory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, lowStock } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (lowStock === 'true') {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: true,
      },
    });
    const lowStockItems = inventories.filter(
      (inv) => inv.stock <= inv.lowStockThreshold
    );
    return res.json({
      success: true,
      data: lowStockItems,
    });
  }

  const [inventory, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.inventory.count({ where }),
  ]);

  res.json({
    success: true,
    data: inventory,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const updateStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { stock, reserved, lowStockThreshold } = req.body;

  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!inventory) {
    return res.status(404).json({
      success: false,
      error: 'Inventory not found',
    });
  }

  const oldStock = inventory.stock;
  const updatedInventory = await prisma.inventory.update({
    where: { productId },
    data: {
      stock: stock !== undefined ? stock : inventory.stock,
      reserved: reserved !== undefined ? reserved : inventory.reserved,
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : inventory.lowStockThreshold,
    },
  });

  // Record movement
  await prisma.inventoryMovement.create({
    data: {
      productId,
      type: stock > oldStock ? 'in' : stock < oldStock ? 'out' : 'adjustment',
      quantity: Math.abs(stock - oldStock),
      reason: 'Manual update',
      adminId: req.user.id,
    },
  });

  res.json({
    success: true,
    data: updatedInventory,
  });
});

const getMovements = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const movements = await prisma.inventoryMovement.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: {
      inventory: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: movements,
  });
});

module.exports = {
  getInventory,
  updateStock,
  getMovements,
};


