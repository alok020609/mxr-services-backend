const { SearchIndexService } = require('../services/searchIndexService');
const { asyncHandler } = require('../utils/asyncHandler');

const indexProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const indexed = await SearchIndexService.indexProduct(productId);

  res.json({
    success: true,
    data: indexed,
  });
});

const batchIndexProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const results = await SearchIndexService.batchIndexProducts(productIds);

  res.json({
    success: true,
    data: results,
  });
});

const reindexAll = asyncHandler(async (req, res) => {
  const job = await SearchIndexService.reindexAllProducts();

  res.json({
    success: true,
    data: job,
    message: 'Full reindex job queued',
  });
});

const reindexCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const results = await SearchIndexService.reindexCategory(categoryId);

  res.json({
    success: true,
    data: results,
  });
});

const search = asyncHandler(async (req, res) => {
  const { q, ...filters } = req.query;

  const results = await SearchIndexService.search(q, filters);

  res.json({
    success: true,
    data: results,
  });
});

module.exports = {
  indexProduct,
  batchIndexProducts,
  reindexAll,
  reindexCategory,
  search,
};


