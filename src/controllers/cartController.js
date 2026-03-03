const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const cartWithItems = {
  include: {
    items: {
      include: {
        product: true,
        variant: true,
        service: true,
      },
    },
  },
};

const getCart = asyncHandler(async (req, res) => {
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    ...cartWithItems,
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.user.id },
      ...cartWithItems,
    });
  }
  res.json({ success: true, data: cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, serviceId, quantity: rawQty } = req.body;
  const quantity = Math.max(1, parseInt(rawQty, 10) || 1);

  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
  } else if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const stock = variantId
      ? (product.variants.find((v) => v.id === variantId)?.stock ?? 0)
      : product.stock;
    if (stock < quantity) {
      return res.status(422).json({ success: false, error: 'Insufficient stock available' });
    }
  } else {
    return res.status(400).json({ success: false, error: 'productId or serviceId is required' });
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: true },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.user.id },
      include: { items: true },
    });
  }

  const existing = cart.items.find(
    (i) =>
      (productId && i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId)) ||
      (serviceId && i.serviceId === serviceId)
  );
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: productId || null,
        variantId: variantId || null,
        serviceId: serviceId || null,
        quantity,
      },
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    ...cartWithItems,
  });
  res.json({ success: true, data: updated });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true, variant: true } } },
  });
  if (!cart) {
    return res.status(404).json({ success: false, error: 'Cart not found' });
  }
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Cart item not found' });
  }
  const stock = item.variant
    ? item.variant.stock
    : item.product
      ? item.product.stock
      : null;
  if (stock != null && stock < quantity) {
    return res.status(422).json({ success: false, error: 'Insufficient stock available' });
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    ...cartWithItems,
  });
  res.json({ success: true, data: updated });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: true },
  });
  if (!cart) {
    return res.status(404).json({ success: false, error: 'Cart not found' });
  }
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Cart item not found' });
  }
  await prisma.cartItem.delete({ where: { id: itemId } });
  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    ...cartWithItems,
  });
  res.json({ success: true, message: 'Item removed from cart', data: updated });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  res.json({ success: true, message: 'Cart cleared successfully' });
});

function itemLineTotal(item) {
  if (item.service) {
    return Number(item.service.price) * item.quantity;
  }
  const price = item.variant && item.variant.price != null ? item.variant.price : item.product?.price;
  return (price ? Number(price) : 0) * item.quantity;
}

const calculateCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    ...cartWithItems,
  });
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + itemLineTotal(item), 0);
  const tax = 0;
  const shipping = 0;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;
  res.json({
    success: true,
    cart: { subtotal, tax, shipping, discount, total },
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  calculateCart,
};
