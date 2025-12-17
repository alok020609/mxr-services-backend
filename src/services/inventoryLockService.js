const prisma = require('../config/database');
const { withLock } = require('../utils/lock');

class InventoryLockService {
  static async reserveInventory(productId, variantId, quantity) {
    return withLock(`inventory:${productId}:${variantId}`, async () => {
      const inventory = await prisma.inventory.findFirst({
        where: {
          productId,
          variantId: variantId || null,
        },
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      // Check optimistic locking
      const currentVersion = inventory.version;

      if (inventory.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      // Update with version check
      const updated = await prisma.inventory.updateMany({
        where: {
          id: inventory.id,
          version: currentVersion, // Optimistic lock
        },
        data: {
          stock: inventory.stock - quantity,
          reserved: inventory.reserved + quantity,
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new Error('Concurrent modification detected. Please retry.');
      }

      return prisma.inventory.findUnique({
        where: { id: inventory.id },
      });
    });
  }

  static async releaseInventory(productId, variantId, quantity) {
    return withLock(`inventory:${productId}:${variantId}`, async () => {
      const inventory = await prisma.inventory.findFirst({
        where: {
          productId,
          variantId: variantId || null,
        },
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const updated = await prisma.inventory.updateMany({
        where: {
          id: inventory.id,
          version: inventory.version,
        },
        data: {
          stock: inventory.stock + quantity,
          reserved: Math.max(0, inventory.reserved - quantity),
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new Error('Concurrent modification detected. Please retry.');
      }

      return prisma.inventory.findUnique({
        where: { id: inventory.id },
      });
    });
  }
}

module.exports = { InventoryLockService };


