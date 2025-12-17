const { AdvancedInventoryService } = require('../services/advancedInventoryService');
const { asyncHandler } = require('../utils/asyncHandler');

const calculateReorderPoint = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { leadTimeDays, averageDailyDemand, safetyStock } = req.body;

  const inventory = await AdvancedInventoryService.calculateReorderPoint(
    productId,
    leadTimeDays,
    averageDailyDemand,
    safetyStock
  );

  res.json({
    success: true,
    data: inventory,
  });
});

const transferStock = asyncHandler(async (req, res) => {
  const { fromWarehouseId, toWarehouseId, productId, quantity, reason } = req.body;

  await AdvancedInventoryService.transferStock(
    fromWarehouseId,
    toWarehouseId,
    productId,
    quantity,
    reason
  );

  res.json({
    success: true,
    message: 'Stock transferred successfully',
  });
});

const recordCycleCount = asyncHandler(async (req, res) => {
  const { warehouseId, productId, countedQuantity } = req.body;

  const result = await AdvancedInventoryService.recordCycleCount(
    warehouseId,
    productId,
    countedQuantity,
    req.user.id
  );

  res.json({
    success: true,
    data: result,
  });
});

const getInventoryAgingReport = asyncHandler(async (req, res) => {
  const { warehouseId } = req.query;

  const report = await AdvancedInventoryService.getInventoryAgingReport(warehouseId);

  res.json({
    success: true,
    data: report,
  });
});

const recordShrinkage = asyncHandler(async (req, res) => {
  const { productId, warehouseId, quantity, reason } = req.body;

  await AdvancedInventoryService.recordShrinkage(
    productId,
    warehouseId,
    quantity,
    reason,
    req.user.id
  );

  res.json({
    success: true,
    message: 'Shrinkage recorded',
  });
});

module.exports = {
  calculateReorderPoint,
  transferStock,
  recordCycleCount,
  getInventoryAgingReport,
  recordShrinkage,
};


