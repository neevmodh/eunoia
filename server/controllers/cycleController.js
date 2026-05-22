/**
 * Cycle Tracker Controller
 */

const { v4: uuidv4 } = require('uuid');
const { appendCSV, findCSV, updateCSV, readCSV } = require('../utils/csvHelper');

/**
 * Calculate next period date
 */
const predictNextPeriod = (lastPeriodDate, cycleLength = 28) => {
  const last = new Date(lastPeriodDate);
  const next = new Date(last);
  next.setDate(next.getDate() + parseInt(cycleLength));
  return next.toISOString().split('T')[0];
};

/**
 * Calculate cycle phase
 */
const getCyclePhase = (lastPeriodDate, cycleLength = 28) => {
  const last = new Date(lastPeriodDate);
  const today = new Date();
  const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const dayInCycle = daysSince % cycleLength;

  if (dayInCycle <= 5) return { phase: 'Menstrual', day: dayInCycle + 1, description: 'Your period phase. Rest and self-care are important.' };
  if (dayInCycle <= 13) return { phase: 'Follicular', day: dayInCycle + 1, description: 'Energy is building up. Great time for light exercise.' };
  if (dayInCycle === 14) return { phase: 'Ovulation', day: dayInCycle + 1, description: 'Peak energy day. You may feel your best today.' };
  return { phase: 'Luteal', day: dayInCycle + 1, description: 'PMS symptoms may appear. Practice self-care.' };
};

/**
 * POST /api/cycle/log
 */
const logCycle = async (req, res) => {
  try {
    const { userId, lastPeriodDate, cycleLength = 28, periodDuration = 5, waterIntake, sleepHours, mood, symptoms, notes } = req.body;

    if (!userId || !lastPeriodDate) {
      return res.status(400).json({ success: false, message: 'userId and lastPeriodDate are required.' });
    }

    const nextPeriod = predictNextPeriod(lastPeriodDate, cycleLength);
    const phase = getCyclePhase(lastPeriodDate, cycleLength);

    const record = {
      id: uuidv4(),
      userId,
      lastPeriodDate,
      cycleLength,
      periodDuration,
      waterIntake: waterIntake || '',
      sleepHours: sleepHours || '',
      mood: mood || '',
      symptoms: Array.isArray(symptoms) ? symptoms.join(';') : (symptoms || ''),
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    appendCSV('cycle_tracker.csv', record);

    res.json({
      success: true,
      message: 'Cycle data logged successfully.',
      nextPeriod,
      phase,
      record
    });
  } catch (error) {
    console.error('Cycle log error:', error.message);
    res.status(500).json({ success: false, message: 'Error logging cycle data.' });
  }
};

/**
 * GET /api/cycle/:userId
 */
const getCycleData = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = findCSV('cycle_tracker.csv', row => row.userId === userId);
    
    // Sort by timestamp descending
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const latest = data[0];
    let prediction = null;
    let phase = null;

    if (latest && latest.lastPeriodDate) {
      prediction = predictNextPeriod(latest.lastPeriodDate, latest.cycleLength || 28);
      phase = getCyclePhase(latest.lastPeriodDate, latest.cycleLength || 28);
    }

    res.json({
      success: true,
      data: data.slice(0, 12), // Last 12 entries
      prediction,
      phase,
      totalEntries: data.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cycle data.' });
  }
};

/**
 * POST /api/cycle/symptom
 */
const logSymptom = async (req, res) => {
  try {
    const { userId, date, symptoms, mood, painLevel, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const record = {
      id: uuidv4(),
      userId,
      date: date || new Date().toISOString().split('T')[0],
      symptoms: Array.isArray(symptoms) ? symptoms.join(';') : (symptoms || ''),
      mood: mood || '',
      painLevel: painLevel || '',
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    appendCSV('symptom_logs.csv', record);

    res.json({ success: true, message: 'Symptom logged successfully.', record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging symptom.' });
  }
};

/**
 * GET /api/cycle/symptoms/:userId
 */
const getSymptoms = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = findCSV('symptom_logs.csv', row => row.userId === userId);
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, data: data.slice(0, 30) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching symptoms.' });
  }
};

module.exports = { logCycle, getCycleData, logSymptom, getSymptoms };
