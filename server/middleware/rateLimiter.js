/**
 * Rate Limiting Middleware — Eunoia Platform
 * Tiered rate limits for different API surfaces
 */

const rateLimit = require('express-rate-limit');

/** General API — 100 req / 15 min */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
});

/** Chat endpoint — 20 req / min (AI cost protection) */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many chat requests. Please wait a moment.' },
});

/** Admin endpoints — 30 req / 15 min */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many admin requests.' },
});

/** ML prediction — 30 req / 15 min */
const mlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many prediction requests. Please try again later.' },
});

module.exports = { apiLimiter, chatLimiter, adminLimiter, mlLimiter };
