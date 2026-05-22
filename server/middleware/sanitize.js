/**
 * Input Sanitization & Safety Middleware — Eunoia Platform
 * Handles prompt injection, emergency detection, and input cleaning
 */

// Prompt injection / jailbreak patterns
const BLOCKED_PATTERNS = [
  /ignore previous instructions/i,
  /you are now/i,
  /forget your training/i,
  /act as a doctor/i,
  /diagnose me/i,
  /prescribe/i,
  /jailbreak/i,
  /DAN mode/i,
  /system prompt/i,
  /override instructions/i,
  /bypass safety/i,
];

// Emergency / self-harm keywords
const EMERGENCY_KEYWORDS = [
  'suicide', 'kill myself', 'self harm', 'self-harm', 'hurt myself',
  'end my life', 'want to die', 'cutting myself', 'overdose',
  'take my life', 'not worth living', 'harm myself',
];

// Severe physical symptom keywords
const SEVERE_SYMPTOM_KEYWORDS = [
  'severe pain', 'unbearable pain', 'fainting', 'unconscious', 'heavy bleeding',
  'soaking pad every hour', 'chest pain', 'difficulty breathing', 'high fever',
  'vomiting blood', 'extreme dizziness', 'cannot stand', 'passing out',
];

/**
 * Sanitize a string — strip HTML/scripts, trim, limit length
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .substring(0, 2000);
};

/** Check for emergency / self-harm keywords */
const checkEmergency = (message) => {
  const lower = message.toLowerCase();
  return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
};

/** Check for severe physical symptoms */
const checkSevereSymptoms = (message) => {
  const lower = message.toLowerCase();
  return SEVERE_SYMPTOM_KEYWORDS.some(kw => lower.includes(kw));
};

/** Check for prompt injection attempts */
const checkPromptInjection = (message) => {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(message));
};

/**
 * Express middleware — sanitize all string fields in req.body
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  sanitizeRequest,
  sanitizeString,
  checkEmergency,
  checkSevereSymptoms,
  checkPromptInjection,
};
