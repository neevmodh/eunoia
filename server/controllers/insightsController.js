/**
 * Health Insights Controller
 */

const { findCSV } = require('../utils/csvHelper');
const { generateInsights, generateWellnessTip } = require('../services/groqService');

/**
 * GET /api/insights/:userId
 */
const getInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    // Gather user data
    const cycleData = findCSV('cycle_tracker.csv', row => row.userId === userId);
    const symptomData = findCSV('symptom_logs.csv', row => row.userId === userId);

    if (cycleData.length === 0 && symptomData.length === 0) {
      return res.json({
        success: true,
        insights: [
          { title: 'Start Tracking', message: 'Log your cycle and symptoms to get personalized insights!', category: 'Getting Started' }
        ],
        tip: 'Welcome to SakhiCare! Start by logging your cycle to get personalized health insights.'
      });
    }

    // Summarize data for AI
    const recentCycle = cycleData.slice(-5);
    const recentSymptoms = symptomData.slice(-10);

    // Calculate averages
    const avgWater = recentCycle.reduce((sum, r) => sum + (parseFloat(r.waterIntake) || 0), 0) / (recentCycle.length || 1);
    const avgSleep = recentCycle.reduce((sum, r) => sum + (parseFloat(r.sleepHours) || 0), 0) / (recentCycle.length || 1);
    
    // Count moods
    const moodCounts = {};
    recentCycle.forEach(r => {
      if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
    });

    // Count symptoms
    const symptomCounts = {};
    recentSymptoms.forEach(r => {
      if (r.symptoms) {
        r.symptoms.split(';').forEach(s => {
          if (s.trim()) symptomCounts[s.trim()] = (symptomCounts[s.trim()] || 0) + 1;
        });
      }
    });

    const userData = {
      totalCycleLogs: cycleData.length,
      averageWaterIntake: avgWater.toFixed(1),
      averageSleepHours: avgSleep.toFixed(1),
      commonMoods: moodCounts,
      commonSymptoms: symptomCounts,
      recentCycleLength: recentCycle[recentCycle.length - 1]?.cycleLength || 28
    };

    const insights = await generateInsights(userData);
    const tip = await generateWellnessTip();

    res.json({ success: true, insights, tip, userData });
  } catch (error) {
    console.error('Insights error:', error.message);
    res.status(500).json({ success: false, message: 'Error generating insights.' });
  }
};

/**
 * GET /api/insights/tip
 */
const getWellnessTip = async (req, res) => {
  try {
    const tip = await generateWellnessTip();
    res.json({ success: true, tip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating tip.' });
  }
};

module.exports = { getInsights, getWellnessTip };
