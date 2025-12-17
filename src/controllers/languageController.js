const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

const getLanguages = asyncHandler(async (req, res) => {
  const languages = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { isDefault: 'desc' },
  });

  res.json({
    success: true,
    data: languages,
  });
});

const getLanguage = asyncHandler(async (req, res) => {
  const language = await prisma.language.findUnique({
    where: { code: req.params.code },
  });

  if (!language) {
    return res.status(404).json({
      success: false,
      error: 'Language not found',
    });
  }

  res.json({
    success: true,
    data: language,
  });
});

const getTranslations = asyncHandler(async (req, res) => {
  const { entityType, entityId, languageCode } = req.query;

  const translations = await prisma.translation.findMany({
    where: {
      entityType,
      entityId,
      language: {
        code: languageCode,
      },
    },
  });

  res.json({
    success: true,
    data: translations,
  });
});

const createTranslation = asyncHandler(async (req, res) => {
  const { entityType, entityId, languageId, field, value } = req.body;

  const translation = await prisma.translation.upsert({
    where: {
      entityType_entityId_languageId_field: {
        entityType,
        entityId,
        languageId,
        field,
      },
    },
    update: { value },
    create: {
      entityType,
      entityId,
      languageId,
      field,
      value,
    },
  });

  res.status(201).json({
    success: true,
    data: translation,
  });
});

module.exports = {
  getLanguages,
  getLanguage,
  getTranslations,
  createTranslation,
};


