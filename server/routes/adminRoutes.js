const express = require('express');
const router = express.Router();
const { getStats, getCSVData, downloadCSV, addMyth } = require('../controllers/adminController');
const { addContent } = require('../controllers/educationController');
const { adminAuth } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { sanitizeRequest } = require('../middleware/sanitize');

router.use(adminLimiter);
router.use(adminAuth);

router.get('/stats', getStats);
router.get('/csv/:filename', getCSVData);
router.get('/download/:filename', downloadCSV);
router.post('/myth', sanitizeRequest, addMyth);
router.post('/content', sanitizeRequest, addContent);

module.exports = router;
