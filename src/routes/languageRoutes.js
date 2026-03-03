const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Language
 *   description: Language and translation management endpoints
 */

/**
 * @swagger
 * /api/v1/languages:
 *   get:
 *     summary: Get available languages
 *     description: Retrieve list of available languages
 *     tags: [Language]
 *     responses:
 *       200:
 *         description: Languages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: en
 *                       name:
 *                         type: string
 *                         example: English
 *                       isDefault:
 *                         type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', languageController.getLanguages);

/**
 * @swagger
 * /api/v1/languages/{code}:
 *   get:
 *     summary: Get language by code
 *     description: Retrieve details for a specific language
 *     tags: [Language]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Language code (e.g., en, es, fr)
 *     responses:
 *       200:
 *         description: Language retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Language not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:code', languageController.getLanguage);

/**
 * @swagger
 * /api/v1/languages/translations:
 *   get:
 *     summary: Get translations
 *     description: Retrieve translations for the current or specified language
 *     tags: [Language]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *         description: Language code
 *     responses:
 *       200:
 *         description: Translations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 translations:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/translations', languageController.getTranslations);

// Admin routes
router.use(auth, admin);

/**
 * @swagger
 * /api/v1/languages/translations:
 *   post:
 *     summary: Create translation
 *     description: Create or update a translation (Admin only)
 *     tags: [Language]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - languageCode
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 description: Translation key
 *               languageCode:
 *                 type: string
 *                 description: Language code
 *               value:
 *                 type: string
 *                 description: Translated value
 *     responses:
 *       201:
 *         description: Translation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/translations', languageController.createTranslation);

module.exports = router;


