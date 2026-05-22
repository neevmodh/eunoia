const express = require('express');
const router = express.Router();
const { getInsights, getWellnessTip } = require('../controllers/insightsController');

router.get('/tip', getWellnessTip);
router.get('/:userId', getInsights);

module.exports = router;
