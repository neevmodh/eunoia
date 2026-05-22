/**
 * ML Prediction Routes — Eunoia Platform
 */

const express = require('express');
const router = express.Router();
const { getPCOSRisk, getCycleAnalysis, getDistressScore, getWellnessAnalysis, getWellnessScore } = require('../controllers/mlController');
const { mlLimiter } = require('../middleware/rateLimiter');
const { sanitizeRequest } = require('../middleware/sanitize');

router.post('/pcos-risk', mlLimiter, sanitizeRequest, getPCOSRisk);
router.post('/cycle-analysis', mlLimiter, sanitizeRequest, getCycleAnalysis);
router.post('/distress', mlLimiter, sanitizeRequest, getDistressScore);
router.get('/wellness/:userId', mlLimiter, getWellnessAnalysis);
router.get('/score/:userId', mlLimiter, getWellnessScore);

module.exports = router;
