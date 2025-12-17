const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    success: true,
    data: addresses,
  });
});

const getAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      error: 'Address not found',
    });
  }

  res.json({
    success: true,
    data: address,
  });
});

const createAddress = asyncHandler(async (req, res) => {
  const { type, street, city, state, zipCode, country, isDefault } = req.body;

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: {
        userId: req.user.id,
        type,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user.id,
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    },
  });

  res.status(201).json({
    success: true,
    data: address,
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const { type, street, city, state, zipCode, country, isDefault } = req.body;

  // Check ownership
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!existingAddress) {
    return res.status(404).json({
      success: false,
      error: 'Address not found',
    });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: {
        userId: req.user.id,
        type: type || existingAddress.type,
        isDefault: true,
        id: { not: req.params.id },
      },
      data: {
        isDefault: false,
      },
    });
  }

  const address = await prisma.address.update({
    where: { id: req.params.id },
    data: {
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    },
  });

  res.json({
    success: true,
    data: address,
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      error: 'Address not found',
    });
  }

  await prisma.address.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Address deleted',
  });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      error: 'Address not found',
    });
  }

  // Unset other defaults of same type
  await prisma.address.updateMany({
    where: {
      userId: req.user.id,
      type: address.type,
      isDefault: true,
      id: { not: req.params.id },
    },
    data: {
      isDefault: false,
    },
  });

  // Set this as default
  const updatedAddress = await prisma.address.update({
    where: { id: req.params.id },
    data: { isDefault: true },
  });

  res.json({
    success: true,
    data: updatedAddress,
  });
});

const getDefaultAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({
    where: {
      userId: req.user.id,
      isDefault: true,
    },
  });

  res.json({
    success: true,
    data: address,
  });
});

module.exports = {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
};


