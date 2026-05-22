const express = require('express');
const router = express.Router();
const { registerUser, getUser, updateUser, updateStreak } = require('../controllers/userController');
const { sanitizeRequest } = require('../middleware/sanitize');

router.post('/register', sanitizeRequest, registerUser);
router.get('/:userId', getUser);
router.put('/:userId', sanitizeRequest, updateUser);
router.post('/:userId/streak', updateStreak);

module.exports = router;
