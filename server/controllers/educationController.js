/**
 * Educational Content Controller
 */

const { v4: uuidv4 } = require('uuid');
const { readCSV, appendCSV, findCSV } = require('../utils/csvHelper');
const { analyzeMythFact } = require('../services/groqService');

/**
 * GET /api/education
 */
const getContent = async (req, res) => {
  try {
    const { category, search } = req.query;
    let data = readCSV('educational_content.csv');

    if (category && category !== 'All') {
      data = data.filter(item => item.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.tags?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching educational content.' });
  }
};

/**
 * GET /api/education/categories
 */
const getCategories = async (req, res) => {
  try {
    const data = readCSV('educational_content.csv');
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
    res.json({ success: true, categories: ['All', ...categories] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories.' });
  }
};

/**
 * GET /api/myths
 */
const getMyths = async (req, res) => {
  try {
    const data = readCSV('myths_facts.csv');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching myths.' });
  }
};

/**
 * POST /api/myths/analyze
 */
const analyzeMyth = async (req, res) => {
  try {
    const { statement } = req.body;

    if (!statement || statement.trim() === '') {
      return res.status(400).json({ success: false, message: 'Statement is required.' });
    }

    const result = await analyzeMythFact(statement);

    // Save to myths_facts.csv
    appendCSV('myths_facts.csv', {
      id: uuidv4(),
      statement: statement.substring(0, 300),
      classification: result.classification,
      explanation: result.explanation?.substring(0, 500) || '',
      source: 'AI Analysis',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error('Myth analysis error:', error.message);
    res.status(500).json({ success: false, message: 'Error analyzing statement. Please try again.' });
  }
};

/**
 * POST /api/education (Admin)
 */
const addContent = async (req, res) => {
  try {
    const { title, category, summary, content, tags } = req.body;

    if (!title || !category || !summary) {
      return res.status(400).json({ success: false, message: 'Title, category, and summary are required.' });
    }

    const record = {
      id: uuidv4(),
      title,
      category,
      summary,
      content: content || summary,
      tags: tags || '',
      author: 'Admin',
      createdAt: new Date().toISOString()
    };

    appendCSV('educational_content.csv', record);
    res.json({ success: true, message: 'Content added successfully.', record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding content.' });
  }
};

module.exports = { getContent, getCategories, getMyths, analyzeMyth, addContent };
