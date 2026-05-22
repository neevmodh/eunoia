const express = require('express');
const router = express.Router();
const { chat, getChatHistory } = require('../controllers/chatController');
const { chatLimiter } = require('../middleware/rateLimiter');
const { sanitizeRequest } = require('../middleware/sanitize');

router.post('/', chatLimiter, sanitizeRequest, chat);
router.get('/history/:userId', getChatHistory);

module.exports = router;
