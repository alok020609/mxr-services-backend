const DataLoader = require('dataloader');
const prisma = require('../config/database');

// Create DataLoaders to prevent N+1 queries
const createUserLoader = () => {
  return new DataLoader(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    return userIds.map((id) => userMap.get(id) || null);
  });
};

const createProductLoader = () => {
  return new DataLoader(async (productIds) => {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    return productIds.map((id) => productMap.get(id) || null);
  });
};

const createCategoryLoader = () => {
  return new DataLoader(async (categoryIds) => {
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categories.map((category) => [category.id, category]));

    return categoryIds.map((id) => categoryMap.get(id) || null);
  });
};

const createOrderLoader = () => {
  return new DataLoader(async (orderIds) => {
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
    });

    const orderMap = new Map(orders.map((order) => [order.id, order]));

    return orderIds.map((id) => orderMap.get(id) || null);
  });
};

// Middleware to attach loaders to request
const attachDataLoaders = (req, res, next) => {
  req.loaders = {
    user: createUserLoader(),
    product: createProductLoader(),
    category: createCategoryLoader(),
    order: createOrderLoader(),
  };

  next();
};

module.exports = {
  createUserLoader,
  createProductLoader,
  createCategoryLoader,
  createOrderLoader,
  attachDataLoaders,
};


