const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/faqs', supportController.getFAQs);

// Protected routes
router.use(auth);
router.post('/tickets', supportController.createTicket);
router.get('/tickets', supportController.getTickets);
router.get('/tickets/:id', supportController.getTicket);
router.post('/tickets/:id/messages', supportController.addMessage);
router.put('/tickets/:id/close', supportController.closeTicket);

module.exports = router;


