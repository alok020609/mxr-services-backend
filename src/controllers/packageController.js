const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const packagePricingService = require('../services/packagePricingService');

// ---------- Taxonomy (configurable segments / subcategories) ----------

const getTaxonomyTree = asyncHandler(async (req, res) => {
  const { parentId, flat } = req.query;
  const where = { isActive: true };
  if (parentId !== undefined) {
    where.parentId = parentId === '' || parentId === 'null' ? null : parentId;
  }

  const nodes = await prisma.packageTaxonomy.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { packages: true, children: true } },
    },
  });

  if (flat === 'true') {
    return res.json({ success: true, data: nodes });
  }

  async function buildTree(pid) {
    const list = await prisma.packageTaxonomy.findMany({
      where: { isActive: true, parentId: pid },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { packages: true, children: true } } },
    });
    return Promise.all(
      list.map(async (n) => ({
        ...n,
        children: await buildTree(n.id),
      }))
    );
  }

  const roots = await buildTree(null);
  res.json({ success: true, data: roots });
});

const getTaxonomyNode = asyncHandler(async (req, res) => {
  const node = await prisma.packageTaxonomy.findUnique({
    where: { id: req.params.id },
    include: {
      parent: true,
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: { select: { packages: true } },
    },
  });
  if (!node) {
    return res.status(404).json({ success: false, error: 'Taxonomy node not found' });
  }
  res.json({ success: true, data: node });
});

const createTaxonomyNode = asyncHandler(async (req, res) => {
  const { name, slug, level, parentId, sortOrder, metadata } = req.body;
  const slugToUse = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const node = await prisma.packageTaxonomy.create({
    data: {
      name,
      slug: slugToUse,
      level: level != null ? level : 0,
      parentId: parentId || null,
      sortOrder: sortOrder != null ? sortOrder : 0,
      metadata: metadata || undefined,
    },
  });
  res.status(201).json({ success: true, data: node });
});

const updateTaxonomyNode = asyncHandler(async (req, res) => {
  const { name, slug, level, parentId, sortOrder, isActive, metadata } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (slug !== undefined) update.slug = slug;
  if (level !== undefined) update.level = level;
  if (parentId !== undefined) update.parentId = parentId || null;
  if (sortOrder !== undefined) update.sortOrder = sortOrder;
  if (isActive !== undefined) update.isActive = isActive;
  if (metadata !== undefined) update.metadata = metadata;

  const node = await prisma.packageTaxonomy.update({
    where: { id: req.params.id },
    data: update,
  });
  res.json({ success: true, data: node });
});

const deleteTaxonomyNode = asyncHandler(async (req, res) => {
  await prisma.packageTaxonomy.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Taxonomy node deleted' });
});

// ---------- Packages ----------

const getPackages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, taxonomyId, segmentId, isActive } = req.query;
  const where = {};
  if (taxonomyId !== undefined) where.taxonomyId = taxonomyId || null;
  if (segmentId !== undefined) where.taxonomyId = segmentId;
  // Default to active only (public); admin can pass ?isActive=false to see inactive
  where.isActive = isActive !== undefined ? isActive === 'true' : true;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      skip,
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        taxonomy: true,
        category: true,
        options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.package.count({ where }),
  ]);

  const totalPages = Math.ceil((total || 0) / parseInt(limit, 10));
  res.json({
    success: true,
    data: packages,
    pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: totalPages },
  });
});

const getPackage = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.findUnique({
    where: { id: req.params.id },
    include: {
      taxonomy: true,
      category: true,
      options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!pkg) {
    return res.status(404).json({ success: false, error: 'Package not found' });
  }
  res.json({ success: true, data: pkg });
});

const getPackageBySlug = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.findUnique({
    where: { slug: req.params.slug, isActive: true },
    include: {
      taxonomy: true,
      category: true,
      options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!pkg) {
    return res.status(404).json({ success: false, error: 'Package not found' });
  }
  res.json({ success: true, data: pkg });
});

const createPackage = asyncHandler(async (req, res) => {
  const { name, slug, description, basePrice, defaultFeatures, isPopular, isActive, taxonomyId, categoryId } = req.body;
  const slugToUse = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const pkg = await prisma.package.create({
    data: {
      name,
      slug: slugToUse,
      description: description || null,
      basePrice: Number(basePrice),
      defaultFeatures: Array.isArray(defaultFeatures) ? defaultFeatures : [],
      isPopular: isPopular === true,
      isActive: isActive !== false,
      taxonomyId: taxonomyId || null,
      categoryId: categoryId || null,
    },
    include: {
      taxonomy: true,
      category: true,
      options: true,
    },
  });
  res.status(201).json({ success: true, data: pkg });
});

const updatePackage = asyncHandler(async (req, res) => {
  const { name, slug, description, basePrice, defaultFeatures, isPopular, isActive, taxonomyId, categoryId } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (slug !== undefined) update.slug = slug;
  if (description !== undefined) update.description = description;
  if (basePrice !== undefined) update.basePrice = Number(basePrice);
  if (defaultFeatures !== undefined) update.defaultFeatures = Array.isArray(defaultFeatures) ? defaultFeatures : [];
  if (isPopular !== undefined) update.isPopular = isPopular;
  if (isActive !== undefined) update.isActive = isActive;
  if (taxonomyId !== undefined) update.taxonomyId = taxonomyId || null;
  if (categoryId !== undefined) update.categoryId = categoryId || null;

  const pkg = await prisma.package.update({
    where: { id: req.params.id },
    data: update,
    include: {
      taxonomy: true,
      category: true,
      options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  });
  res.json({ success: true, data: pkg });
});

const deletePackage = asyncHandler(async (req, res) => {
  await prisma.package.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ success: true, message: 'Package deactivated' });
});

const calculatePackagePrice = asyncHandler(async (req, res) => {
  const customization = req.body.customization != null ? req.body.customization : req.body;
  const { includeBreakdown } = req.query;
  const result = await packagePricingService.computePackagePrice(
    req.params.id,
    customization,
    { includeBreakdown: includeBreakdown === 'true' }
  );
  res.json({ success: true, ...result });
});

// ---------- Package options ----------

const getPackageOptions = asyncHandler(async (req, res) => {
  const options = await prisma.packageOption.findMany({
    where: { packageId: req.params.id },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, data: options });
});

const createPackageOption = asyncHandler(async (req, res) => {
  const { key, label, type, config, sortOrder, isRequired } = req.body;
  const opt = await prisma.packageOption.create({
    data: {
      packageId: req.params.id,
      key,
      label: label || key,
      type,
      config: config || {},
      sortOrder: sortOrder != null ? sortOrder : 0,
      isRequired: isRequired === true,
    },
  });
  res.status(201).json({ success: true, data: opt });
});

const updatePackageOption = asyncHandler(async (req, res) => {
  const { key, label, type, config, sortOrder, isRequired, isActive } = req.body;
  const update = {};
  if (key !== undefined) update.key = key;
  if (label !== undefined) update.label = label;
  if (type !== undefined) update.type = type;
  if (config !== undefined) update.config = config;
  if (sortOrder !== undefined) update.sortOrder = sortOrder;
  if (isRequired !== undefined) update.isRequired = isRequired;
  if (isActive !== undefined) update.isActive = isActive;

  const opt = await prisma.packageOption.update({
    where: { id: req.params.optionId },
    data: update,
  });
  res.json({ success: true, data: opt });
});

const deletePackageOption = asyncHandler(async (req, res) => {
  await prisma.packageOption.delete({ where: { id: req.params.optionId } });
  res.json({ success: true, message: 'Option deleted' });
});

module.exports = {
  getTaxonomyTree,
  getTaxonomyNode,
  createTaxonomyNode,
  updateTaxonomyNode,
  deleteTaxonomyNode,
  getPackages,
  getPackage,
  getPackageBySlug,
  createPackage,
  updatePackage,
  deletePackage,
  calculatePackagePrice,
  getPackageOptions,
  createPackageOption,
  updatePackageOption,
  deletePackageOption,
};
