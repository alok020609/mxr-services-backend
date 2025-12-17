const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              inventory: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                inventory: true,
              },
            },
            variant: true,
          },
        },
      },
    });
  }

  // Calculate totals
  let subtotal = 0;
  cart.items.forEach((item) => {
    const price = item.variant?.price || item.product.price;
    subtotal += price * item.quantity;
  });

  res.json({
    success: true,
    data: {
      ...cart,
      subtotal,
      total: subtotal, // Will add tax, shipping, discount later
    },
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.user.id },
    });
  }

  // Check if item already exists
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  if (existingItem) {
    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: {
        product: true,
        variant: true,
      },
    });

    return res.json({
      success: true,
      data: updatedItem,
    });
  }

  // Create new cart item
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId,
      quantity,
    },
    include: {
      product: true,
      variant: true,
    },
  });

  res.status(201).json({
    success: true,
    data: cartItem,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      error: 'Cart not found',
    });
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: req.params.itemId,
      cartId: cart.id,
    },
  });

  if (!cartItem) {
    return res.status(404).json({
      success: false,
      error: 'Cart item not found',
    });
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
    include: {
      product: true,
      variant: true,
    },
  });

  res.json({
    success: true,
    data: updatedItem,
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      error: 'Cart not found',
    });
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: req.params.itemId,
      cartId: cart.id,
    },
  });

  if (!cartItem) {
    return res.status(404).json({
      success: false,
      error: 'Cart item not found',
    });
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });

  res.json({
    success: true,
    message: 'Item removed from cart',
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  res.json({
    success: true,
    message: 'Cart cleared',
  });
});

const calculateCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.json({
      success: true,
      data: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      },
    });
  }

  let subtotal = 0;
  cart.items.forEach((item) => {
    const price = item.variant?.price || item.product.price;
    subtotal += price * item.quantity;
  });

  // TODO: Calculate tax, shipping, discount
  const tax = 0;
  const shipping = 0;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;

  res.json({
    success: true,
    data: {
      subtotal,
      tax,
      shipping,
      discount,
      total,
    },
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


