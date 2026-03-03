const { asyncHandler } = require('../utils/asyncHandler');

// Placeholder controller - to be implemented
const executeBatch = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented yet',
    message: 'Batch request functionality is being implemented'
  });
});

module.exports = {
  executeBatch,
};

