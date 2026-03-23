const prisma = require('../config/database');

const calculateShipping = async (address, items) => {
  // Get shipping zones
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: {
      rates: {
        include: {
          method: true,
        },
      },
    },
  });

  // Find matching zone
  const matchingZone = zones.find((zone) => {
    const countries = zone.countries || [];
    return countries.includes(address.country);
  });

  if (!matchingZone) {
    return { amount: 0, method: null };
  }

  // Calculate total weight (simplified - would need product weight)
  const totalWeight = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.price != null
      ? Number(item.price)
      : (item.variant?.price != null ? item.variant.price : item.product?.price ?? item.service?.price);
    return sum + (price != null ? Number(price) : 0) * item.quantity;
  }, 0);

  // Find matching rate
  let matchingRate = null;
  for (const rate of matchingZone.rates) {
    if (
      (!rate.minWeight || totalWeight >= rate.minWeight) &&
      (!rate.maxWeight || totalWeight <= rate.maxWeight) &&
      (!rate.minPrice || totalPrice >= rate.minPrice) &&
      (!rate.maxPrice || totalPrice <= rate.maxPrice)
    ) {
      matchingRate = rate;
      break;
    }
  }

  if (!matchingRate) {
    return { amount: 0, method: null };
  }

  return {
    amount: matchingRate.rate,
    method: matchingRate.method,
  };
};

const getShippingMethods = async () => {
  return prisma.shippingMethod.findMany({
    where: { isActive: true },
    include: {
      rates: {
        include: {
          zone: true,
        },
      },
    },
  });
};

module.exports = {
  calculateShipping,
  getShippingMethods,
};


