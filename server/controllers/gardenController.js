/**
 * Garden Controller — returns a composite wellness garden profile.
 */

const { findCSV } = require('../utils/csvHelper');
const { buildGardenIntelligence } = require('../services/gardenService');

const getGardenIntelligence = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const users = findCSV('users.csv', row => row.userId === userId);
    const cycleLogs = findCSV('cycle_tracker.csv', row => row.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const symptomLogs = findCSV('symptom_logs.csv', row => row.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const chatLogs = findCSV('chat_history.csv', row => row.userId === userId && row.role === 'user').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const profile = buildGardenIntelligence({
      user: users[0] || { wellnessStreak: 0 },
      cycleLogs,
      symptomLogs,
      chatLogs,
      localMetrics: {
        waterIntake: cycleLogs[0]?.waterIntake ? parseFloat(cycleLogs[0].waterIntake) : 0,
        sleepHours: cycleLogs[0]?.sleepHours ? parseFloat(cycleLogs[0].sleepHours) : 0,
        breathingDone: false,
      },
      journalEntries: [],
    });

    res.json({
      success: true,
      profile,
      meta: {
        userFound: users.length > 0,
        cycleLogs: cycleLogs.length,
        symptomLogs: symptomLogs.length,
        chatLogs: chatLogs.length,
      },
    });
  } catch (error) {
    console.error('Garden intelligence error:', error.message);
    res.status(500).json({ success: false, message: 'Error building garden intelligence.' });
  }
};

module.exports = { getGardenIntelligence };