const prisma = require('../../config/database');
const { asyncHandler } = require('../../utils/asyncHandler');

const CODE_REGEX = /^[A-Z]{3}$/;

function serializeCurrency(c) {
  return {
    ...c,
    exchangeRate: c.exchangeRate ? Number(c.exchangeRate) : 1,
  };
}

// List all currencies (admin) - optional ?activeOnly=true
const listCurrencies = asyncHandler(async (req, res) => {
  const activeOnly = req.query.activeOnly === 'true';
  const where = activeOnly ? { isActive: true } : {};
  const currencies = await prisma.currency.findMany({
    where,
    orderBy: [{ isDefault: 'desc' }, { code: 'asc' }],
  });
  res.json({
    success: true,
    data: currencies.map(serializeCurrency),
  });
});

// Create currency (admin)
const createCurrency = asyncHandler(async (req, res) => {
  const { code, name, symbol, exchangeRate, isDefault, isActive } = req.body;

  const codeStr = String(code || '').trim().toUpperCase();
  if (!CODE_REGEX.test(codeStr)) {
    return res.status(400).json({
      success: false,
      error: 'Currency code must be exactly 3 uppercase letters (e.g. USD, EUR)',
    });
  }
  const nameStr = String(name || '').trim();
  if (!nameStr) {
    return res.status(400).json({
      success: false,
      error: 'Currency name is required',
    });
  }
  const symbolStr = String(symbol ?? '').trim();
  if (symbolStr.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Currency symbol is required',
    });
  }
  const rate = exchangeRate != null ? parseFloat(exchangeRate) : 1;
  if (Number.isNaN(rate) || rate <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Exchange rate must be a positive number',
    });
  }

  const existing = await prisma.currency.findUnique({
    where: { code: codeStr },
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `Currency with code ${codeStr} already exists`,
    });
  }

  if (isDefault === true) {
    await prisma.currency.updateMany({
      data: { isDefault: false },
    });
  }

  const currency = await prisma.currency.create({
    data: {
      code: codeStr,
      name: nameStr,
      symbol: symbolStr,
      exchangeRate: rate,
      isDefault: Boolean(isDefault),
      isActive: isActive !== false,
    },
  });

  res.status(201).json({
    success: true,
    data: serializeCurrency(currency),
  });
});

// Get single currency (admin)
const getCurrency = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const currency = await prisma.currency.findUnique({
    where: { code: code.toUpperCase() },
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

// Update currency (admin)
const updateCurrency = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { name, symbol, exchangeRate, isDefault, isActive } = req.body;

  const currency = await prisma.currency.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!currency) {
    return res.status(404).json({
      success: false,
      error: 'Currency not found',
    });
  }

  const updates = {};
  if (name !== undefined) {
    const nameStr = String(name).trim();
    if (!nameStr) {
      return res.status(400).json({
        success: false,
        error: 'Currency name cannot be empty',
      });
    }
    updates.name = nameStr;
  }
  if (symbol !== undefined) {
    const symbolStr = String(symbol).trim();
    if (symbolStr.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Currency symbol cannot be empty',
      });
    }
    updates.symbol = symbolStr;
  }
  if (exchangeRate !== undefined) {
    const rate = parseFloat(exchangeRate);
    if (Number.isNaN(rate) || rate <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Exchange rate must be a positive number',
      });
    }
    updates.exchangeRate = rate;
  }
  if (isActive !== undefined) {
    updates.isActive = Boolean(isActive);
  }
  if (isDefault === true) {
    await prisma.currency.updateMany({
      data: { isDefault: false },
    });
    updates.isDefault = true;
  } else if (isDefault === false) {
    updates.isDefault = false;
  }

  const updated = await prisma.currency.update({
    where: { code: currency.code },
    data: updates,
  });

  res.json({
    success: true,
    data: serializeCurrency(updated),
  });
});

// Delete currency (admin) - soft delete: set isActive = false; forbid if isDefault
const deleteCurrency = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const currency = await prisma.currency.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!currency) {
    return res.status(404).json({
      success: false,
      error: 'Currency not found',
    });
  }
  if (currency.isDefault) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete the default currency. Set another currency as default first.',
    });
  }

  await prisma.currency.update({
    where: { code: currency.code },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Currency deactivated successfully',
  });
});

module.exports = {
  listCurrencies,
  createCurrency,
  getCurrency,
  updateCurrency,
  deleteCurrency,
};
