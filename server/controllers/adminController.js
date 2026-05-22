/**
 * Admin Controller
 */

const path = require('path');
const { readCSV, appendCSV } = require('../utils/csvHelper');
const { getFilePath } = require('../utils/csvHelper');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const users = readCSV('users.csv');
    const chats = readCSV('chat_history.csv');
    const cycles = readCSV('cycle_tracker.csv');
    const symptoms = readCSV('symptom_logs.csv');
    const content = readCSV('educational_content.csv');
    const myths = readCSV('myths_facts.csv');

    // Symptom frequency
    const symptomCounts = {};
    symptoms.forEach(row => {
      if (row.symptoms) {
        row.symptoms.split(';').forEach(s => {
          const sym = s.trim();
          if (sym) symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
        });
      }
    });

    // Chat usage by day (last 7 days)
    const chatByDay = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      chatByDay[d.toISOString().split('T')[0]] = 0;
    }
    chats.forEach(row => {
      const day = row.timestamp?.split('T')[0];
      if (day && chatByDay.hasOwnProperty(day)) {
        chatByDay[day]++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalChats: chats.length,
        totalCycleLogs: cycles.length,
        totalSymptomLogs: symptoms.length,
        totalContent: content.length,
        totalMyths: myths.length,
        topSymptoms: Object.entries(symptomCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        chatByDay: Object.entries(chatByDay).map(([date, count]) => ({ date, count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
};

/**
 * GET /api/admin/csv/:filename
 */
const getCSVData = async (req, res) => {
  try {
    const { filename } = req.params;
    const allowed = ['users.csv', 'chat_history.csv', 'symptom_logs.csv', 'cycle_tracker.csv', 'educational_content.csv', 'myths_facts.csv'];
    
    if (!allowed.includes(filename)) {
      return res.status(400).json({ success: false, message: 'Invalid filename.' });
    }

    const data = readCSV(filename);
    res.json({ success: true, data, filename });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reading CSV.' });
  }
};

/**
 * GET /api/admin/download/:filename
 */
const downloadCSV = async (req, res) => {
  try {
    const { filename } = req.params;
    const allowed = ['users.csv', 'chat_history.csv', 'symptom_logs.csv', 'cycle_tracker.csv', 'educational_content.csv', 'myths_facts.csv'];
    
    if (!allowed.includes(filename)) {
      return res.status(400).json({ success: false, message: 'Invalid filename.' });
    }

    const filePath = getFilePath(filename);
    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downloading CSV.' });
  }
};

/**
 * POST /api/admin/myth
 */
const addMyth = async (req, res) => {
  try {
    const { statement, classification, explanation, source } = req.body;

    if (!statement || !classification || !explanation) {
      return res.status(400).json({ success: false, message: 'Statement, classification, and explanation are required.' });
    }

    const record = {
      id: uuidv4(),
      statement,
      classification,
      explanation,
      source: source || 'Admin',
      createdAt: new Date().toISOString()
    };

    appendCSV('myths_facts.csv', record);
    res.json({ success: true, message: 'Myth/Fact added.', record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding myth/fact.' });
  }
};

module.exports = { getStats, getCSVData, downloadCSV, addMyth };
