const express = require('express');
const router = express.Router();
const { getMessages, getConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/messages/:userId', getMessages);
router.get('/conversations', getConversations);

module.exports = router;
