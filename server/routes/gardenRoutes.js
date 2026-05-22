/**
 * Garden Intelligence Routes
 */

const express = require('express');
const router = express.Router();
const { getGardenIntelligence } = require('../controllers/gardenController');
const { mlLimiter } = require('../middleware/rateLimiter');

router.get('/:userId', mlLimiter, getGardenIntelligence);

module.exports = router;