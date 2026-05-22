const express = require('express');
const router = express.Router();
const { getContent, getCategories, getMyths, analyzeMyth, addContent } = require('../controllers/educationController');
const { adminAuth } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/sanitize');

router.get('/', getContent);
router.get('/categories', getCategories);
router.get('/myths', getMyths);
router.post('/myths/analyze', sanitizeRequest, analyzeMyth);
router.post('/', adminAuth, sanitizeRequest, addContent);

module.exports = router;
