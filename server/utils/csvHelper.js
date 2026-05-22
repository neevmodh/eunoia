/**
 * CSV Helper Utilities for SakhiCare
 * Handles all CSV read/write operations using fs and papaparse
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * CSV file definitions with their headers
 */
const CSV_SCHEMAS = {
  'users.csv': ['userId', 'username', 'language', 'wellnessStreak', 'totalPoints', 'createdAt', 'lastActive'],
  'chat_history.csv': ['id', 'userId', 'role', 'message', 'language', 'timestamp'],
  'symptom_logs.csv': ['id', 'userId', 'date', 'symptoms', 'mood', 'painLevel', 'notes', 'timestamp'],
  'cycle_tracker.csv': ['id', 'userId', 'lastPeriodDate', 'cycleLength', 'periodDuration', 'waterIntake', 'sleepHours', 'mood', 'symptoms', 'notes', 'timestamp'],
  'educational_content.csv': ['id', 'title', 'category', 'summary', 'content', 'tags', 'author', 'createdAt'],
  'myths_facts.csv': ['id', 'statement', 'classification', 'explanation', 'source', 'createdAt']
};

/**
 * Get full path for a CSV file
 */
const getFilePath = (filename) => path.join(DATA_DIR, filename);

/**
 * Initialize a CSV file with headers if it doesn't exist
 */
const initCSV = (filename) => {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    const headers = CSV_SCHEMAS[filename];
    if (headers) {
      fs.writeFileSync(filePath, headers.join(',') + '\n', 'utf8');
      console.log(`✅ Created CSV: ${filename}`);
    }
  }
};

/**
 * Initialize all CSV files
 */
const initAllCSVs = () => {
  Object.keys(CSV_SCHEMAS).forEach(initCSV);
};

/**
 * Read all records from a CSV file
 * @param {string} filename - CSV filename
 * @returns {Array} Array of objects
 */
const readCSV = (filename) => {
  const filePath = getFilePath(filename);
  initCSV(filename);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) return [];
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });
    return result.data || [];
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return [];
  }
};

/**
 * Write (overwrite) entire CSV file with new data
 * @param {string} filename - CSV filename
 * @param {Array} data - Array of objects to write
 */
const writeCSV = (filename, data) => {
  const filePath = getFilePath(filename);
  try {
    const headers = CSV_SCHEMAS[filename] || Object.keys(data[0] || {});
    const csv = Papa.unparse(data, { columns: headers });
    fs.writeFileSync(filePath, csv + '\n', 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    return false;
  }
};

/**
 * Append a single record to a CSV file
 * @param {string} filename - CSV filename
 * @param {Object} record - Object to append
 */
const appendCSV = (filename, record) => {
  const filePath = getFilePath(filename);
  initCSV(filename);
  try {
    const headers = CSV_SCHEMAS[filename] || Object.keys(record);
    // Sanitize record values
    const row = headers.map(h => {
      const val = record[h] !== undefined ? String(record[h]) : '';
      // Escape commas and quotes in CSV
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    fs.appendFileSync(filePath, row.join(',') + '\n', 'utf8');
    return true;
  } catch (err) {
    console.error(`Error appending to ${filename}:`, err.message);
    return false;
  }
};

/**
 * Update a record in CSV by matching a field value
 * @param {string} filename - CSV filename
 * @param {string} keyField - Field name to match
 * @param {string} keyValue - Value to match
 * @param {Object} updates - Fields to update
 */
const updateCSV = (filename, keyField, keyValue, updates) => {
  try {
    const data = readCSV(filename);
    const updated = data.map(row => {
      if (row[keyField] === keyValue) {
        return { ...row, ...updates };
      }
      return row;
    });
    return writeCSV(filename, updated);
  } catch (err) {
    console.error(`Error updating ${filename}:`, err.message);
    return false;
  }
};

/**
 * Find records matching a condition
 * @param {string} filename - CSV filename
 * @param {Function} predicate - Filter function
 */
const findCSV = (filename, predicate) => {
  const data = readCSV(filename);
  return data.filter(predicate);
};

/**
 * Delete records matching a condition
 * @param {string} filename - CSV filename
 * @param {Function} predicate - Records matching this will be deleted
 */
const deleteFromCSV = (filename, predicate) => {
  try {
    const data = readCSV(filename);
    const filtered = data.filter(row => !predicate(row));
    return writeCSV(filename, filtered);
  } catch (err) {
    console.error(`Error deleting from ${filename}:`, err.message);
    return false;
  }
};

module.exports = {
  initAllCSVs,
  initCSV,
  readCSV,
  writeCSV,
  appendCSV,
  updateCSV,
  findCSV,
  deleteFromCSV,
  getFilePath,
  DATA_DIR
};
