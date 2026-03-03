const { asyncHandler } = require('../../utils/asyncHandler');
const invoiceEmailService = require('../../services/invoiceEmailService');

const sendInvoiceEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await invoiceEmailService.sendInvoiceEmail(id);
  res.json({
    success: true,
    message: `Invoice email sent to ${result.sentTo}`,
    data: result,
  });
});

module.exports = {
  sendInvoiceEmail,
};
