/**
 * Restore inventory for order items (mirror of order creation decrement).
 * Used when an order is cancelled so Product, ProductVariant, and Inventory stock are incremented.
 * Only items with productId are processed (service-only lines are skipped).
 * @param {object} tx - Prisma transaction client
 * @param {Array<{ productId: string | null, variantId: string | null, quantity: number }>} items - Order items
 */
async function restoreOrderInventory(tx, items) {
  for (const item of items) {
    if (!item.productId) continue; // Skip service-only lines
    const qty = item.quantity;
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: qty } },
      });
    } else {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: qty } },
      });
      const inv = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });
      if (inv) {
        await tx.inventory.update({
          where: { id: inv.id },
          data: { stock: { increment: qty } },
        });
      }
    }
  }
}

module.exports = {
  restoreOrderInventory,
};
