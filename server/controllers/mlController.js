/**
 * ML Prediction Controller — Eunoia Platform
 * 
 * Endpoints:
 *  POST /api/ml/pcos-risk       — PCOS risk prediction
 *  POST /api/ml/cycle-analysis  — Irregular cycle detection
 *  POST /api/ml/distress        — Emotional distress scoring
 *  GET  /api/ml/wellness/:userId — Full wellness analysis
 *  GET  /api/ml/score/:userId   — Wellness score
 */

const {
  predictPCOSRisk,
  detectIrregularCycle,
  scoreEmotionalDistress,
  generateWellnessRecommendations,
  calculateWellnessScore,
} = require('../services/mlService');

const { generatePersonalizedPlan } = require('../services/groqService');
const { findCSV } = require('../utils/csvHelper');

/**
 * POST /api/ml/pcos-risk
 * Body: { cycleLength, painLevel, acne, excessHairGrowth, weightGain,
 *         fatigue, moodSwings, sleepHours, waterIntake, irregularCycles }
 */
const getPCOSRisk = async (req, res) => {
  try {
    const result = predictPCOSRisk(req.body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('PCOS prediction error:', error.message);
    res.status(500).json({ success: false, message: 'Error running PCOS risk analysis.' });
  }
};

/**
 * POST /api/ml/cycle-analysis
 * Body: { userId } — fetches cycle logs from CSV
 */
const getCycleAnalysis = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required.' });

    const cycleLogs = findCSV('cycle_tracker.csv', row => row.userId === userId);
    const result = detectIrregularCycle(cycleLogs);

    res.json({ success: true, result, totalLogs: cycleLogs.length });
  } catch (error) {
    console.error('Cycle analysis error:', error.message);
    res.status(500).json({ success: false, message: 'Error analyzing cycle data.' });
  }
};

/**
 * POST /api/ml/distress
 * Body: { message }
 */
const getDistressScore = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

    const result = scoreEmotionalDistress(message);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error scoring distress.' });
  }
};

/**
 * GET /api/ml/wellness/:userId
 * Full wellness analysis with AI-generated plan
 */
const getWellnessAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;

    const cycleLogs = findCSV('cycle_tracker.csv', row => row.userId === userId);
    const symptomLogs = findCSV('symptom_logs.csv', row => row.userId === userId);

    // Aggregate stats
    const recentCycles = cycleLogs.slice(-10);
    const avgWater = recentCycles.reduce((s, r) => s + (parseFloat(r.waterIntake) || 0), 0) / (recentCycles.length || 1);
    const avgSleep = recentCycles.reduce((s, r) => s + (parseFloat(r.sleepHours) || 0), 0) / (recentCycles.length || 1);

    const moodCounts = {};
    recentCycles.forEach(r => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1; });

    const symptomCounts = {};
    symptomLogs.slice(-20).forEach(r => {
      if (r.symptoms) r.symptoms.split(';').forEach(s => {
        const sym = s.trim();
        if (sym) symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
      });
    });

    const avgPain = symptomLogs.reduce((s, r) => s + (parseFloat(r.painLevel) || 0), 0) / (symptomLogs.length || 1);

    const userData = {
      totalCycleLogs: cycleLogs.length,
      averageWaterIntake: parseFloat(avgWater.toFixed(1)),
      averageSleepHours: parseFloat(avgSleep.toFixed(1)),
      commonMoods: moodCounts,
      commonSymptoms: symptomCounts,
      averagePainLevel: parseFloat(avgPain.toFixed(1)),
    };

    const recommendations = generateWellnessRecommendations(userData);
    const wellnessScore = calculateWellnessScore(userData);
    const cycleAnalysis = detectIrregularCycle(cycleLogs);

    // Generate AI plan (non-blocking — if it fails, still return ML results)
    let aiPlan = null;
    try {
      aiPlan = await generatePersonalizedPlan(recommendations, userData);
    } catch {
      aiPlan = null;
    }

    res.json({
      success: true,
      userData,
      recommendations,
      wellnessScore,
      cycleAnalysis,
      aiPlan,
    });
  } catch (error) {
    console.error('Wellness analysis error:', error.message);
    res.status(500).json({ success: false, message: 'Error generating wellness analysis.' });
  }
};

/**
 * GET /api/ml/score/:userId
 * Quick wellness score only
 */
const getWellnessScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const cycleLogs = findCSV('cycle_tracker.csv', row => row.userId === userId);
    const symptomLogs = findCSV('symptom_logs.csv', row => row.userId === userId);

    const recentCycles = cycleLogs.slice(-10);
    const avgWater = recentCycles.reduce((s, r) => s + (parseFloat(r.waterIntake) || 0), 0) / (recentCycles.length || 1);
    const avgSleep = recentCycles.reduce((s, r) => s + (parseFloat(r.sleepHours) || 0), 0) / (recentCycles.length || 1);
    const avgPain = symptomLogs.reduce((s, r) => s + (parseFloat(r.painLevel) || 0), 0) / (symptomLogs.length || 1);

    const score = calculateWellnessScore({
      averageWaterIntake: avgWater,
      averageSleepHours: avgSleep,
      totalCycleLogs: cycleLogs.length,
      averagePainLevel: avgPain,
    });

    res.json({ success: true, ...score });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error calculating wellness score.' });
  }
};

module.exports = { getPCOSRisk, getCycleAnalysis, getDistressScore, getWellnessAnalysis, getWellnessScore };
