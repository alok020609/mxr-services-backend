const express = require('express');
const router = express.Router();
const giftController = require('../controllers/giftController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/registry', giftController.createGiftRegistry);
router.get('/registry', giftController.getGiftRegistries);
router.post('/registry/items', giftController.addToGiftRegistry);
router.post('/send', giftController.sendAsGift);
router.post('/schedule', giftController.scheduleGift);
router.get('/track/:trackingNumber', giftController.trackGift);

module.exports = router;


