const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// CMS Pages
const getCMSPages = asyncHandler(async (req, res) => {
  const pages = await prisma.cMSPage.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: pages,
  });
});

const getCMSPage = asyncHandler(async (req, res) => {
  const page = await prisma.cMSPage.findUnique({
    where: { slug: req.params.slug },
  });

  if (!page || !page.isPublished) {
    return res.status(404).json({
      success: false,
      error: 'Page not found',
    });
  }

  res.json({
    success: true,
    data: page,
  });
});

// Blog Posts
const getBlogPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isPublished: true,
    ...(category && { category }),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getBlogPost = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
  });

  if (!post || !post.isPublished) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  res.json({
    success: true,
    data: post,
  });
});

// Banners
const getBanners = asyncHandler(async (req, res) => {
  const { position } = req.query;
  const now = new Date();

  const banners = await prisma.banner.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
      ...(position && { position }),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: banners,
  });
});

module.exports = {
  getCMSPages,
  getCMSPage,
  getBlogPosts,
  getBlogPost,
  getBanners,
};


