const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

function serializeCurrency(c) {
  return {
    ...c,
    exchangeRate: c.exchangeRate ? Number(c.exchangeRate) : 1,
  };
}

const getCurrencies = asyncHandler(async (req, res) => {
  const currencies = await prisma.currency.findMany({
    where: { isActive: true },
    orderBy: { isDefault: 'desc' },
  });

  res.json({
    success: true,
    data: currencies.map(serializeCurrency),
  });
});

const getDefaultCurrency = asyncHandler(async (req, res) => {
  const currency = await prisma.currency.findFirst({
    where: { isDefault: true, isActive: true },
  });

  if (!currency) {
    return res.status(404).json({
      success: false,
      error: 'Default currency not found',
    });
  }

  res.json({
    success: true,
    data: serializeCurrency(currency),
  });
});

const getCurrency = asyncHandler(async (req, res) => {
  const currency = await prisma.currency.findUnique({
    where: { code: req.params.code },
  });

  if (!currency) {
    return res.status(404).json({
      success: false,
      error: 'Currency not found',
    });
  }

  res.json({
    success: true,
    data: serializeCurrency(currency),
  });
});

const convertCurrency = asyncHandler(async (req, res) => {
  const { from, to, amount } = req.query;

  const fromCurrency = await prisma.currency.findUnique({
    where: { code: from },
  });

  const toCurrency = await prisma.currency.findUnique({
    where: { code: to },
  });

  if (!fromCurrency || !toCurrency) {
    return res.status(400).json({
      success: false,
      error: 'Invalid currency codes',
    });
  }

  // Convert: amount * (toRate / fromRate)
  const fromRate = Number(fromCurrency.exchangeRate) || 1;
  const toRate = Number(toCurrency.exchangeRate) || 1;
  const convertedAmount = (parseFloat(amount) * toRate) / fromRate;
  const rate = toRate / fromRate;

  res.json({
    success: true,
    data: {
      from: {
        code: fromCurrency.code,
        amount: parseFloat(amount),
      },
      to: {
        code: toCurrency.code,
        amount: convertedAmount,
      },
      rate,
    },
  });
});

const updateExchangeRates = asyncHandler(async (req, res) => {
  const { rates } = req.body; // { USD: 1, EUR: 0.85, ... }

  const updates = Object.entries(rates).map(([code, rate]) =>
    prisma.currency.updateMany({
      where: { code },
      data: { exchangeRate: parseFloat(rate) },
    })
  );

  await Promise.all(updates);

  res.json({
    success: true,
    message: 'Exchange rates updated',
  });
});

module.exports = {
  getCurrencies,
  getDefaultCurrency,
  getCurrency,
  convertCurrency,
  updateExchangeRates,
};


