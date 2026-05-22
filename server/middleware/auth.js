/**
 * Authentication Middleware — Eunoia Platform
 * Handles JWT auth for users + password-based admin auth
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eunoia_dev_secret_change_in_production';

/**
 * Admin password-based auth (existing, preserved)
 */
const adminAuth = (req, res, next) => {
  const password = req.headers['password'] || req.headers['x-admin-password'];
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password || password !== adminPassword) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid admin credentials.'
    });
  }
  next();
};

/**
 * Generate a JWT token for a user
 * @param {Object} payload - { userId, username }
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Verify JWT token middleware (optional — non-blocking)
 * Attaches user to req if token is valid, otherwise continues
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    // Invalid token — just continue without user
  }
  next();
};

/**
 * Require JWT token middleware (blocking)
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = { adminAuth, generateToken, optionalAuth, requireAuth };
