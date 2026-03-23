const prisma = require('../config/database');

const calculateTax = async (address, items) => {
  const taxRules = await prisma.taxRule.findMany({
    where: { isActive: true },
  });

  let totalTax = 0;
  const appliedRules = [];

  for (const item of items) {
    const price = item.price != null
      ? Number(item.price)
      : (item.variant?.price != null ? item.variant.price : item.product?.price ?? item.service?.price);
    const itemTotal = (price != null ? Number(price) : 0) * item.quantity;

    for (const rule of taxRules) {
      // Check if rule applies
      const countries = rule.countries || [];
      const states = rule.states || [];

      const appliesToCountry = !countries.length || countries.includes(address.country);
      const appliesToState = !states.length || states.includes(address.state);

      if (!appliesToCountry || !appliesToState) {
        continue;
      }

      // Check applicable to
      if (rule.applicableTo === 'all') {
        // Apply to all items
        let taxAmount = 0;
        if (rule.type === 'PERCENTAGE') {
          taxAmount = (itemTotal * rule.rate) / 100;
        } else {
          taxAmount = rule.rate * item.quantity;
        }
        totalTax += taxAmount;
        appliedRules.push({ rule, amount: taxAmount });
      } else if (rule.applicableTo === 'products') {
        // Check if product is in applicableIds
        const applicableIds = rule.applicableIds || [];
        if (applicableIds.includes(item.productId)) {
          let taxAmount = 0;
          if (rule.type === 'PERCENTAGE') {
            taxAmount = (itemTotal * rule.rate) / 100;
          } else {
            taxAmount = rule.rate * item.quantity;
          }
          totalTax += taxAmount;
          appliedRules.push({ rule, amount: taxAmount });
        }
      }
      // TODO: Handle categories
    }
  }

  return {
    total: totalTax,
    rules: appliedRules,
  };
};

const getTaxRates = async (address) => {
  const taxRules = await prisma.taxRule.findMany({
    where: {
      isActive: true,
      countries: { array_contains: address.country },
    },
  });

  return taxRules;
};

module.exports = {
  calculateTax,
  getTaxRates,
};


