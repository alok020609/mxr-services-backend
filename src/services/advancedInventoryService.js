const prisma = require('../config/database');
const { logger } = require('../utils/logger');

class AdvancedInventoryService {
  // Calculate reorder point based on lead time and average demand
  static calculateReorderPoint(productId, leadTimeDays, averageDailyDemand, safetyStock) {
    const reorderPoint = averageDailyDemand * leadTimeDays + safetyStock;
    
    return prisma.inventory.update({
      where: { id: productId },
      data: {
        reorderPoint: Math.ceil(reorderPoint),
      },
    });
  }

  // Calculate safety stock
  static calculateSafetyStock(leadTimeDays, averageDailyDemand, demandVariability, serviceLevel = 0.95) {
    // Z-score for 95% service level is approximately 1.65
    const zScore = 1.65;
    const safetyStock = zScore * Math.sqrt(leadTimeDays) * demandVariability * averageDailyDemand;
    return Math.ceil(safetyStock);
  }

  // Transfer stock between warehouses
  static async transferStock(fromWarehouseId, toWarehouseId, productId, quantity, reason) {
    // Check source warehouse stock
    const sourceStock = await prisma.warehouseStock.findFirst({
      where: {
        warehouseId: fromWarehouseId,
        productId,
      },
    });

    if (!sourceStock || sourceStock.quantity < quantity) {
      throw new Error('Insufficient stock in source warehouse');
    }

    // Update source warehouse
    await prisma.warehouseStock.update({
      where: { id: sourceStock.id },
      data: {
        quantity: { decrement: quantity },
      },
    });

    // Update or create destination warehouse stock
    await prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: toWarehouseId,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        warehouseId: toWarehouseId,
        productId,
        quantity,
      },
    });

    // Record transfer
    await prisma.inventoryMovement.create({
      data: {
        productId,
        type: 'TRANSFER',
        quantity: -quantity,
        fromWarehouseId,
        toWarehouseId,
        reason,
      },
    });

    logger.info(`Stock transferred: ${quantity} units of product ${productId} from warehouse ${fromWarehouseId} to ${toWarehouseId}`);
  }

  // Cycle counting
  static async recordCycleCount(warehouseId, productId, countedQuantity, countedBy) {
    const stock = await prisma.warehouseStock.findFirst({
      where: {
        warehouseId,
        productId,
      },
    });

    if (!stock) {
      throw new Error('Stock record not found');
    }

    const variance = countedQuantity - stock.quantity;

    // Update stock
    await prisma.warehouseStock.update({
      where: { id: stock.id },
      data: {
        quantity: countedQuantity,
        lastCountedAt: new Date(),
      },
    });

    // Record movement if variance
    if (variance !== 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId,
          warehouseId,
          type: variance > 0 ? 'ADJUSTMENT_UP' : 'ADJUSTMENT_DOWN',
          quantity: variance,
          reason: 'Cycle count adjustment',
          metadata: {
            countedBy,
            systemQuantity: stock.quantity,
            countedQuantity,
          },
        },
      });
    }

    return { variance, previousQuantity: stock.quantity, newQuantity: countedQuantity };
  }

  // Get inventory aging report
  static async getInventoryAgingReport(warehouseId) {
    const stock = await prisma.warehouseStock.findMany({
      where: warehouseId ? { warehouseId } : {},
      include: {
        product: true,
        warehouse: true,
      },
    });

    // Calculate aging based on last movement date
    const agingReport = await Promise.all(
      stock.map(async (item) => {
        const lastMovement = await prisma.inventoryMovement.findFirst({
          where: {
            productId: item.productId,
            warehouseId: item.warehouseId,
          },
          orderBy: { createdAt: 'desc' },
        });

        const daysSinceLastMovement = lastMovement
          ? Math.floor((new Date() - lastMovement.createdAt) / (1000 * 60 * 60 * 24))
          : 999;

        return {
          productId: item.productId,
          productName: item.product.name,
          warehouseId: item.warehouseId,
          warehouseName: item.warehouse?.name,
          quantity: item.quantity,
          daysSinceLastMovement,
          agingCategory:
            daysSinceLastMovement < 30
              ? 'FRESH'
              : daysSinceLastMovement < 90
              ? 'MODERATE'
              : daysSinceLastMovement < 180
              ? 'AGING'
              : 'STALE',
        };
      })
    );

    return agingReport.sort((a, b) => b.daysSinceLastMovement - a.daysSinceLastMovement);
  }

  // Track shrinkage
  static async recordShrinkage(productId, warehouseId, quantity, reason, recordedBy) {
    await prisma.inventoryMovement.create({
      data: {
        productId,
        warehouseId,
        type: 'SHRINKAGE',
        quantity: -quantity,
        reason,
        metadata: {
          recordedBy,
        },
      },
    });

    // Update warehouse stock
    await prisma.warehouseStock.updateMany({
      where: {
        productId,
        warehouseId,
      },
      data: {
        quantity: { decrement: quantity },
      },
    });

    logger.warn(`Shrinkage recorded: ${quantity} units of product ${productId} in warehouse ${warehouseId}`);
  }
}

module.exports = { AdvancedInventoryService };


