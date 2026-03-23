const prisma = require('../config/database');

const PACKAGE_OPTION_TYPES = {
  NUMBER: 'NUMBER',
  SELECT: 'SELECT',
  BOOLEAN: 'BOOLEAN',
};

/**
 * Validate customization payload against package options.
 * @param {string} packageId
 * @param {Record<string, unknown>} customization - e.g. { camera_count: 4, camera_type: "5MP", ups: true }
 * @returns {{ valid: boolean, errors: string[] }}
 */
async function validateCustomization(packageId, customization) {
  const errors = [];
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!pkg) {
    return { valid: false, errors: ['Package not found'] };
  }

  const custom = customization && typeof customization === 'object' ? customization : {};

  for (const opt of pkg.options) {
    const key = opt.key;
    const value = custom[key];
    const config = opt.config && typeof opt.config === 'object' ? opt.config : {};

    if (opt.isRequired && (value === undefined || value === null || value === '')) {
      errors.push(`Missing required option: ${opt.label || key}`);
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    switch (opt.type) {
      case PACKAGE_OPTION_TYPES.NUMBER: {
        const num = Number(value);
        if (Number.isNaN(num)) {
          errors.push(`${opt.label || key}: must be a number`);
          break;
        }
        const min = config.min != null ? Number(config.min) : -Infinity;
        const max = config.max != null ? Number(config.max) : Infinity;
        const step = config.step != null ? Number(config.step) : 1;
        if (num < min || num > max) {
          errors.push(`${opt.label || key}: must be between ${min} and ${max}`);
        }
        if (step > 0 && Math.abs((num - (config.default ?? min)) % step) > 1e-6) {
          errors.push(`${opt.label || key}: value must align to step ${step}`);
        }
        break;
      }
      case PACKAGE_OPTION_TYPES.SELECT: {
        const options = Array.isArray(config.options) ? config.options : [];
        const allowed = options.map((o) => (o && typeof o === 'object' ? o.value : o));
        const strVal = String(value);
        if (!allowed.includes(strVal)) {
          errors.push(`${opt.label || key}: invalid option. Allowed: ${allowed.join(', ')}`);
        }
        break;
      }
      case PACKAGE_OPTION_TYPES.BOOLEAN:
        if (value !== true && value !== false) {
          errors.push(`${opt.label || key}: must be true or false`);
        }
        break;
      default:
        errors.push(`${opt.label || key}: unknown option type`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compute final price for a package with given customization.
 * @param {string} packageId
 * @param {Record<string, unknown>} customization
 * @param {{ includeBreakdown?: boolean }} options
 * @returns {Promise<{ price: number, breakdown?: Array<{ key: string, label: string, delta: number }> }>}
 */
async function computePackagePrice(packageId, customization, options = {}) {
  const { includeBreakdown = false } = options;

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!pkg) {
    throw new Error('Package not found');
  }

  const validation = await validateCustomization(packageId, customization);
  if (!validation.valid) {
    throw new Error(`Invalid customization: ${validation.errors.join('; ')}`);
  }

  let price = Number(pkg.basePrice);
  const custom = customization && typeof customization === 'object' ? customization : {};
  const breakdown = includeBreakdown ? [] : undefined;

  for (const opt of pkg.options) {
    const key = opt.key;
    const value = custom[key];
    const config = opt.config && typeof opt.config === 'object' ? opt.config : {};
    let delta = 0;

    switch (opt.type) {
      case PACKAGE_OPTION_TYPES.NUMBER: {
        const num = value !== undefined && value !== null ? Number(value) : (config.default != null ? Number(config.default) : config.min != null ? Number(config.min) : 0);
        if (!Number.isNaN(num) && config.pricePerUnit != null) {
          const base = config.default != null ? Number(config.default) : config.min != null ? Number(config.min) : 0;
          delta = (num - base) * Number(config.pricePerUnit);
        }
        break;
      }
      case PACKAGE_OPTION_TYPES.SELECT: {
        const optionsList = Array.isArray(config.options) ? config.options : [];
        const strVal = value !== undefined && value !== null ? String(value) : config.default;
        const chosen = optionsList.find((o) => o && typeof o === 'object' && String(o.value) === strVal);
        if (chosen && chosen.priceDelta != null) {
          delta = Number(chosen.priceDelta);
        }
        break;
      }
      case PACKAGE_OPTION_TYPES.BOOLEAN:
        if (value === true && config.priceWhenTrue != null) {
          delta = Number(config.priceWhenTrue);
        }
        break;
      default:
        break;
    }

    price += delta;
    if (includeBreakdown && delta !== 0) {
      breakdown.push({ key, label: opt.label, delta });
    }
  }

  return {
    price: Math.round(price * 100) / 100,
    breakdown,
  };
}

module.exports = {
  validateCustomization,
  computePackagePrice,
  PACKAGE_OPTION_TYPES,
};
