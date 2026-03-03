const express = require('express');
const router = express.Router();
const adminQuestionController = require('../../controllers/admin/adminQuestionController');
const { auth, admin } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Questions
 *   description: Admin endpoints for managing product questions
 */

router.use(auth, admin);

/**
 * @swagger
 * /api/v1/admin/questions:
 *   get:
 *     summary: Get all product questions
 *     description: Retrieve paginated list of all product questions with optional filters (Admin only)
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: answered
 *         schema:
 *           type: boolean
 *         description: Filter by answered status (true for answered, false for unanswered)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in question or answer text
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductQuestion'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', adminQuestionController.getQuestions);

/**
 * @swagger
 * /api/v1/admin/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     description: Retrieve a specific product question by ID (Admin only)
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/:id', adminQuestionController.getQuestion);

/**
 * @swagger
 * /api/v1/admin/questions/{id}/answer:
 *   post:
 *     summary: Answer a question
 *     description: Answer a product question (Admin only)
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: The answer to the question
 *     responses:
 *       200:
 *         description: Question answered successfully
 *       400:
 *         description: Bad request - Answer is required
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/:id/answer', adminQuestionController.answerQuestion);

/**
 * @swagger
 * /api/v1/admin/questions/{id}/answer:
 *   put:
 *     summary: Update an answer
 *     description: Update an existing answer to a product question (Admin only)
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: The updated answer
 *     responses:
 *       200:
 *         description: Answer updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.put('/:id/answer', adminQuestionController.updateAnswer);

/**
 * @swagger
 * /api/v1/admin/questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     description: Delete a product question (Admin only)
 *     tags: [Admin Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.delete('/:id', adminQuestionController.deleteQuestion);

module.exports = router;
