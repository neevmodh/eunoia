const express = require('express');
const router = express.Router();
const { logCycle, getCycleData, logSymptom, getSymptoms } = require('../controllers/cycleController');
const { sanitizeRequest } = require('../middleware/sanitize');

router.post('/log', sanitizeRequest, logCycle);
router.get('/:userId', getCycleData);
router.post('/symptom', sanitizeRequest, logSymptom);
router.get('/symptoms/:userId', getSymptoms);

module.exports = router;
