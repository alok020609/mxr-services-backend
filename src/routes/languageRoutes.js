const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const { auth, admin } = require('../middleware/auth');

router.get('/', languageController.getLanguages);
router.get('/:code', languageController.getLanguage);
router.get('/translations', languageController.getTranslations);

// Admin routes
router.use(auth, admin);
router.post('/translations', languageController.createTranslation);

module.exports = router;


