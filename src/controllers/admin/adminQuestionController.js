const prisma = require('../../config/database');
const { asyncHandler } = require('../../utils/asyncHandler');

/**
 * Get all product questions with pagination and filters
 */
const getQuestions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    productId,
    answered,
    search,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const where = {};
  
  if (productId) {
    where.productId = productId;
  }
  
  if (answered !== undefined) {
    if (answered === 'true') {
      where.answer = { not: null };
    } else {
      where.answer = null;
    }
  }
  
  if (search) {
    where.OR = [
      { question: { contains: search, mode: 'insensitive' } },
      { answer: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [questions, total] = await Promise.all([
    prisma.productQuestion.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productQuestion.count({ where }),
  ]);

  // Fetch answeredBy user details if answeredBy exists
  const answeredByUserIds = questions
    .filter(q => q.answeredBy)
    .map(q => q.answeredBy);
  
  const answeredByUsers = answeredByUserIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: answeredByUserIds } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      })
    : [];

  const answeredByUsersMap = answeredByUsers.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  // Add answeredByUser to each question
  const questionsWithAnsweredBy = questions.map(question => ({
    ...question,
    answeredByUser: question.answeredBy ? answeredByUsersMap[question.answeredBy] : null,
  }));

  res.json({
    success: true,
    data: questionsWithAnsweredBy,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get a single question by ID
 */
const getQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.productQuestion.findUnique({
    where: { id: req.params.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }
  
  if (question.answeredBy) {
    const answeredByUser = await prisma.user.findUnique({
      where: { id: question.answeredBy },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    question.answeredByUser = answeredByUser;
  } else {
    question.answeredByUser = null;
  }

  res.json({
    success: true,
    data: question,
  });
});

/**
 * Answer a question
 */
const answerQuestion = asyncHandler(async (req, res) => {
  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({
      success: false,
      error: 'Answer is required',
    });
  }

  const question = await prisma.productQuestion.findUnique({
    where: { id: req.params.id },
  });

  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  const updatedQuestion = await prisma.productQuestion.update({
    where: { id: req.params.id },
    data: {
      answer,
      answeredBy: req.user.id,
      answeredAt: new Date(),
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  
  // Add answeredByUser
  updatedQuestion.answeredByUser = {
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
  };

  res.json({
    success: true,
    data: updatedQuestion,
    message: 'Question answered successfully',
  });
});

/**
 * Update an answer
 */
const updateAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({
      success: false,
      error: 'Answer is required',
    });
  }

  const question = await prisma.productQuestion.findUnique({
    where: { id: req.params.id },
  });

  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  if (!question.answer) {
    return res.status(400).json({
      success: false,
      error: 'Question has not been answered yet',
    });
  }

  const updatedQuestion = await prisma.productQuestion.update({
    where: { id: req.params.id },
    data: {
      answer,
      answeredBy: req.user.id,
      answeredAt: new Date(),
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  
  // Add answeredByUser
  updatedQuestion.answeredByUser = {
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
  };

  res.json({
    success: true,
    data: updatedQuestion,
    message: 'Answer updated successfully',
  });
});

/**
 * Delete a question
 */
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.productQuestion.findUnique({
    where: { id: req.params.id },
  });

  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  await prisma.productQuestion.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Question deleted successfully',
  });
});

module.exports = {
  getQuestions,
  getQuestion,
  answerQuestion,
  updateAnswer,
  deleteQuestion,
};
