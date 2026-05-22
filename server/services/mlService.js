/**
 * ML Prediction Service — Eunoia Platform
 * 
 * Implements rule-based + weighted scoring models for:
 *  1. PCOS Risk Prediction
 *  2. Irregular Cycle Detection
 *  3. Emotional Distress Scoring
 *  4. Personalized Wellness Recommendations
 * 
 * These are deterministic, explainable models that run entirely in Node.js
 * without requiring a Python runtime — suitable for hackathon/MVP deployment.
 * In production, replace with trained scikit-learn / XGBoost models served
 * via a FastAPI microservice.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PCOS RISK PREDICTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Feature weights derived from clinical literature on PCOS indicators.
 * Each feature contributes a weighted score toward total risk.
 */
const PCOS_FEATURE_WEIGHTS = {
  irregularCycles: 25,    // Strongest predictor
  cycleLength: 20,        // >35 days is a key marker
  acne: 10,
  excessHairGrowth: 10,
  weightGain: 8,
  fatigue: 7,
  moodSwings: 6,
  sleepIssues: 5,
  highPainLevel: 5,
  lowWaterIntake: 4,
};

/**
 * Predict PCOS risk from user health data
 * @param {Object} data - Health inputs
 * @returns {Object} { risk, score, level, factors, recommendations }
 */
const predictPCOSRisk = (data) => {
  const {
    cycleLength = 28,
    painLevel = 0,
    acne = false,
    excessHairGrowth = false,
    weightGain = false,
    fatigue = false,
    moodSwings = false,
    sleepHours = 7,
    waterIntake = 8,
    irregularCycles = false,
  } = data;

  let score = 0;
  const triggeredFactors = [];

  // Irregular cycles (most significant)
  if (irregularCycles || cycleLength > 35 || cycleLength < 21) {
    score += PCOS_FEATURE_WEIGHTS.irregularCycles;
    triggeredFactors.push({ factor: 'Irregular Cycles', weight: PCOS_FEATURE_WEIGHTS.irregularCycles, present: true });
  } else {
    triggeredFactors.push({ factor: 'Irregular Cycles', weight: PCOS_FEATURE_WEIGHTS.irregularCycles, present: false });
  }

  // Cycle length deviation
  if (cycleLength > 35) {
    score += PCOS_FEATURE_WEIGHTS.cycleLength;
    triggeredFactors.push({ factor: 'Long Cycle (>35 days)', weight: PCOS_FEATURE_WEIGHTS.cycleLength, present: true });
  } else {
    triggeredFactors.push({ factor: 'Long Cycle (>35 days)', weight: PCOS_FEATURE_WEIGHTS.cycleLength, present: false });
  }

  // Acne
  if (acne) {
    score += PCOS_FEATURE_WEIGHTS.acne;
    triggeredFactors.push({ factor: 'Acne', weight: PCOS_FEATURE_WEIGHTS.acne, present: true });
  } else {
    triggeredFactors.push({ factor: 'Acne', weight: PCOS_FEATURE_WEIGHTS.acne, present: false });
  }

  // Excess hair growth (hirsutism)
  if (excessHairGrowth) {
    score += PCOS_FEATURE_WEIGHTS.excessHairGrowth;
    triggeredFactors.push({ factor: 'Excess Hair Growth', weight: PCOS_FEATURE_WEIGHTS.excessHairGrowth, present: true });
  } else {
    triggeredFactors.push({ factor: 'Excess Hair Growth', weight: PCOS_FEATURE_WEIGHTS.excessHairGrowth, present: false });
  }

  // Weight gain
  if (weightGain) {
    score += PCOS_FEATURE_WEIGHTS.weightGain;
    triggeredFactors.push({ factor: 'Unexplained Weight Gain', weight: PCOS_FEATURE_WEIGHTS.weightGain, present: true });
  } else {
    triggeredFactors.push({ factor: 'Unexplained Weight Gain', weight: PCOS_FEATURE_WEIGHTS.weightGain, present: false });
  }

  // Fatigue
  if (fatigue) {
    score += PCOS_FEATURE_WEIGHTS.fatigue;
    triggeredFactors.push({ factor: 'Chronic Fatigue', weight: PCOS_FEATURE_WEIGHTS.fatigue, present: true });
  } else {
    triggeredFactors.push({ factor: 'Chronic Fatigue', weight: PCOS_FEATURE_WEIGHTS.fatigue, present: false });
  }

  // Mood swings
  if (moodSwings) {
    score += PCOS_FEATURE_WEIGHTS.moodSwings;
    triggeredFactors.push({ factor: 'Mood Swings', weight: PCOS_FEATURE_WEIGHTS.moodSwings, present: true });
  } else {
    triggeredFactors.push({ factor: 'Mood Swings', weight: PCOS_FEATURE_WEIGHTS.moodSwings, present: false });
  }

  // Sleep issues
  if (sleepHours < 6) {
    score += PCOS_FEATURE_WEIGHTS.sleepIssues;
    triggeredFactors.push({ factor: 'Poor Sleep (<6 hrs)', weight: PCOS_FEATURE_WEIGHTS.sleepIssues, present: true });
  } else {
    triggeredFactors.push({ factor: 'Poor Sleep (<6 hrs)', weight: PCOS_FEATURE_WEIGHTS.sleepIssues, present: false });
  }

  // High pain level
  if (painLevel >= 7) {
    score += PCOS_FEATURE_WEIGHTS.highPainLevel;
    triggeredFactors.push({ factor: 'High Pain Level (≥7)', weight: PCOS_FEATURE_WEIGHTS.highPainLevel, present: true });
  } else {
    triggeredFactors.push({ factor: 'High Pain Level (≥7)', weight: PCOS_FEATURE_WEIGHTS.highPainLevel, present: false });
  }

  // Low water intake
  if (waterIntake < 5) {
    score += PCOS_FEATURE_WEIGHTS.lowWaterIntake;
    triggeredFactors.push({ factor: 'Low Water Intake (<5 glasses)', weight: PCOS_FEATURE_WEIGHTS.lowWaterIntake, present: true });
  } else {
    triggeredFactors.push({ factor: 'Low Water Intake (<5 glasses)', weight: PCOS_FEATURE_WEIGHTS.lowWaterIntake, present: false });
  }

  // Normalize to 0–100
  const maxScore = Object.values(PCOS_FEATURE_WEIGHTS).reduce((a, b) => a + b, 0);
  const normalizedScore = Math.round((score / maxScore) * 100);

  // Risk level classification
  let level, color, message;
  if (normalizedScore < 25) {
    level = 'Low';
    color = 'green';
    message = 'Your indicators suggest low PCOS risk. Keep maintaining healthy habits!';
  } else if (normalizedScore < 55) {
    level = 'Medium';
    color = 'yellow';
    message = 'Some indicators are present. Consider discussing with a healthcare provider.';
  } else {
    level = 'High';
    color = 'red';
    message = 'Multiple PCOS indicators detected. We strongly recommend consulting a gynecologist.';
  }

  // Personalized recommendations
  const recommendations = generatePCOSRecommendations(triggeredFactors, level);

  return {
    score: normalizedScore,
    level,
    color,
    message,
    factors: triggeredFactors,
    recommendations,
    disclaimer: 'This is an educational risk indicator only, not a medical diagnosis. Please consult a qualified healthcare provider.',
    modelInfo: {
      type: 'Weighted Feature Scoring',
      features: Object.keys(PCOS_FEATURE_WEIGHTS).length,
      maxScore,
      rawScore: score,
    },
  };
};

const generatePCOSRecommendations = (factors, level) => {
  const recs = [];
  const present = factors.filter(f => f.present).map(f => f.factor);

  if (present.includes('Irregular Cycles') || present.includes('Long Cycle (>35 days)')) {
    recs.push({ category: 'Cycle Health', tip: 'Track your cycle consistently for 3+ months and share the data with a gynecologist.' });
  }
  if (present.includes('Acne') || present.includes('Excess Hair Growth')) {
    recs.push({ category: 'Hormonal Balance', tip: 'Consider a hormonal panel test (LH, FSH, testosterone, insulin) with your doctor.' });
  }
  if (present.includes('Chronic Fatigue') || present.includes('Poor Sleep (<6 hrs)')) {
    recs.push({ category: 'Sleep & Energy', tip: 'Aim for 7–9 hours of sleep. Consistent sleep schedules help regulate hormones.' });
  }
  if (present.includes('Unexplained Weight Gain')) {
    recs.push({ category: 'Nutrition', tip: 'A low-glycemic diet rich in fiber, lean protein, and healthy fats can help manage insulin resistance.' });
  }
  if (present.includes('Low Water Intake (<5 glasses)')) {
    recs.push({ category: 'Hydration', tip: 'Drink 8–10 glasses of water daily. Proper hydration supports hormonal balance.' });
  }
  if (level === 'High') {
    recs.push({ category: 'Medical', tip: 'Please schedule an appointment with a gynecologist for an ultrasound and blood tests.' });
  }
  if (recs.length === 0) {
    recs.push({ category: 'Wellness', tip: 'Keep up your healthy habits! Regular exercise, balanced diet, and good sleep are your best tools.' });
  }

  return recs;
};

// ─────────────────────────────────────────────────────────────────────────────
// IRREGULAR CYCLE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyze cycle history for irregularity patterns
 * @param {Array} cycleLogs - Array of cycle log objects from CSV
 * @returns {Object} Analysis result
 */
const detectIrregularCycle = (cycleLogs) => {
  if (!cycleLogs || cycleLogs.length < 2) {
    return {
      isIrregular: false,
      confidence: 0,
      message: 'Not enough data. Log at least 2 cycles for analysis.',
      patterns: [],
    };
  }

  const lengths = cycleLogs
    .map(l => parseInt(l.cycleLength))
    .filter(n => !isNaN(n) && n > 0);

  if (lengths.length < 2) {
    return { isIrregular: false, confidence: 0, message: 'Insufficient cycle length data.', patterns: [] };
  }

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  const patterns = [];
  let irregularCount = 0;

  lengths.forEach((len, i) => {
    if (len < 21) { patterns.push(`Cycle ${i + 1}: Very short (${len} days)`); irregularCount++; }
    else if (len > 35) { patterns.push(`Cycle ${i + 1}: Very long (${len} days)`); irregularCount++; }
    else if (Math.abs(len - avg) > 7) { patterns.push(`Cycle ${i + 1}: Significant deviation (${len} days vs avg ${avg.toFixed(0)})`); irregularCount++; }
  });

  const irregularityRate = irregularCount / lengths.length;
  const isIrregular = irregularityRate > 0.3 || stdDev > 7;
  const confidence = Math.min(100, Math.round(irregularityRate * 100 + (stdDev > 7 ? 20 : 0)));

  let message;
  if (!isIrregular) {
    message = `Your cycles are fairly regular (avg ${avg.toFixed(0)} days, std dev ${stdDev.toFixed(1)} days). Keep tracking!`;
  } else if (confidence < 60) {
    message = `Some cycle variation detected. This can be normal due to stress or lifestyle changes.`;
  } else {
    message = `Significant irregularity detected across ${irregularCount} of ${lengths.length} cycles. Consider consulting a healthcare provider.`;
  }

  return {
    isIrregular,
    confidence,
    message,
    patterns,
    stats: {
      averageCycleLength: parseFloat(avg.toFixed(1)),
      standardDeviation: parseFloat(stdDev.toFixed(1)),
      shortestCycle: Math.min(...lengths),
      longestCycle: Math.max(...lengths),
      totalCyclesAnalyzed: lengths.length,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// EMOTIONAL DISTRESS SCORING
// ─────────────────────────────────────────────────────────────────────────────

const DISTRESS_KEYWORDS = {
  high: ['hopeless', 'worthless', 'can\'t go on', 'no point', 'give up', 'hate myself', 'nobody cares'],
  medium: ['anxious', 'depressed', 'overwhelmed', 'stressed', 'crying', 'lonely', 'scared', 'worried', 'panic'],
  low: ['sad', 'tired', 'frustrated', 'upset', 'irritable', 'moody', 'down'],
};

const POSITIVE_KEYWORDS = ['happy', 'good', 'great', 'better', 'okay', 'fine', 'calm', 'peaceful', 'grateful'];

/**
 * Score emotional distress from a text message
 * @param {string} text - User message
 * @returns {Object} { level, score, signals, needsEscalation }
 */
const scoreEmotionalDistress = (text) => {
  if (!text) return { level: 'none', score: 0, signals: [], needsEscalation: false };

  const lower = text.toLowerCase();
  let score = 0;
  const signals = [];

  // Check high distress
  DISTRESS_KEYWORDS.high.forEach(kw => {
    if (lower.includes(kw)) { score += 30; signals.push({ keyword: kw, severity: 'high' }); }
  });

  // Check medium distress
  DISTRESS_KEYWORDS.medium.forEach(kw => {
    if (lower.includes(kw)) { score += 15; signals.push({ keyword: kw, severity: 'medium' }); }
  });

  // Check low distress
  DISTRESS_KEYWORDS.low.forEach(kw => {
    if (lower.includes(kw)) { score += 5; signals.push({ keyword: kw, severity: 'low' }); }
  });

  // Positive keywords reduce score
  POSITIVE_KEYWORDS.forEach(kw => {
    if (lower.includes(kw)) score = Math.max(0, score - 10);
  });

  score = Math.min(100, score);

  let level;
  if (score === 0) level = 'none';
  else if (score < 20) level = 'low';
  else if (score < 50) level = 'medium';
  else level = 'high';

  const needsEscalation = score >= 50 || signals.some(s => s.severity === 'high');

  return { level, score, signals, needsEscalation };
};

// ─────────────────────────────────────────────────────────────────────────────
// WELLNESS RECOMMENDATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate personalized wellness recommendations from health data
 * @param {Object} userData - Aggregated user health stats
 * @returns {Array} Array of recommendation objects
 */
const generateWellnessRecommendations = (userData) => {
  const recs = [];
  const {
    averageWaterIntake = 8,
    averageSleepHours = 7,
    commonSymptoms = {},
    commonMoods = {},
    totalCycleLogs = 0,
    averagePainLevel = 0,
  } = userData;

  // Hydration
  if (parseFloat(averageWaterIntake) < 6) {
    recs.push({
      category: 'Hydration',
      priority: 'high',
      icon: '💧',
      title: 'Increase Water Intake',
      message: `You're averaging ${averageWaterIntake} glasses/day. Aim for 8–10 glasses to reduce bloating and fatigue.`,
      action: 'Set hourly water reminders on your phone.',
    });
  }

  // Sleep
  if (parseFloat(averageSleepHours) < 6.5) {
    recs.push({
      category: 'Sleep',
      priority: 'high',
      icon: '😴',
      title: 'Improve Sleep Quality',
      message: `You're averaging ${averageSleepHours} hours of sleep. Poor sleep disrupts hormones and worsens PMS.`,
      action: 'Try a consistent bedtime routine and avoid screens 1 hour before bed.',
    });
  }

  // Symptom-based recommendations
  const topSymptoms = Object.entries(commonSymptoms).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

  if (topSymptoms.includes('Cramps')) {
    recs.push({
      category: 'Pain Management',
      priority: 'medium',
      icon: '🌡️',
      title: 'Manage Period Cramps',
      message: 'Cramps are your most frequent symptom. Heat therapy and magnesium-rich foods can help.',
      action: 'Try a heating pad for 15–20 minutes and eat more dark chocolate, nuts, and leafy greens.',
    });
  }

  if (topSymptoms.includes('Bloating')) {
    recs.push({
      category: 'Nutrition',
      priority: 'medium',
      icon: '🥗',
      title: 'Reduce Bloating',
      message: 'Bloating is a recurring symptom. Reducing salt and processed foods can help significantly.',
      action: 'Avoid salty snacks 5 days before your period. Try peppermint tea.',
    });
  }

  if (topSymptoms.includes('Fatigue') || topSymptoms.includes('Headache')) {
    recs.push({
      category: 'Nutrition',
      priority: 'medium',
      icon: '🍃',
      title: 'Boost Iron & Energy',
      message: 'Fatigue and headaches may indicate low iron. Periods cause iron loss.',
      action: 'Eat iron-rich foods: spinach, lentils, beans. Pair with Vitamin C for better absorption.',
    });
  }

  // Mood-based
  const dominantMood = Object.entries(commonMoods).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  if (dominantMood.includes('Anxious') || dominantMood.includes('Irritable')) {
    recs.push({
      category: 'Mental Wellness',
      priority: 'medium',
      icon: '🧘',
      title: 'Stress & Mood Support',
      message: 'Anxiety and irritability are your most common moods. Hormonal fluctuations are often the cause.',
      action: 'Try 10 minutes of daily breathing exercises or journaling. Omega-3 foods also help mood.',
    });
  }

  // Exercise recommendation
  if (totalCycleLogs >= 2) {
    recs.push({
      category: 'Exercise',
      priority: 'low',
      icon: '🏃‍♀️',
      title: 'Cycle-Synced Exercise',
      message: 'Matching exercise intensity to your cycle phase can boost energy and reduce symptoms.',
      action: 'Follicular phase: cardio & strength. Luteal phase: yoga & walking. Menstrual phase: rest & stretching.',
    });
  }

  // Default if no data
  if (recs.length === 0) {
    recs.push({
      category: 'Getting Started',
      priority: 'low',
      icon: '🌸',
      title: 'Start Tracking for Insights',
      message: 'Log your cycle, symptoms, and mood regularly to unlock personalized recommendations.',
      action: 'Head to the Cycle Tracker and log your first entry today!',
    });
  }

  return recs.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// WELLNESS SCORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate an overall wellness score (0–100) from user data
 * @param {Object} userData
 * @returns {Object} { score, grade, breakdown }
 */
const calculateWellnessScore = (userData) => {
  const {
    averageWaterIntake = 0,
    averageSleepHours = 0,
    totalCycleLogs = 0,
    averagePainLevel = 5,
  } = userData;

  const hydrationScore = Math.min(100, (parseFloat(averageWaterIntake) / 8) * 100);
  const sleepScore = Math.min(100, (parseFloat(averageSleepHours) / 8) * 100);
  const trackingScore = Math.min(100, totalCycleLogs * 10);
  const painScore = Math.max(0, 100 - (parseFloat(averagePainLevel) * 10));

  const overall = Math.round(
    hydrationScore * 0.25 +
    sleepScore * 0.30 +
    trackingScore * 0.25 +
    painScore * 0.20
  );

  let grade;
  if (overall >= 80) grade = 'Excellent';
  else if (overall >= 60) grade = 'Good';
  else if (overall >= 40) grade = 'Fair';
  else grade = 'Needs Attention';

  return {
    score: overall,
    grade,
    breakdown: {
      hydration: Math.round(hydrationScore),
      sleep: Math.round(sleepScore),
      tracking: Math.round(trackingScore),
      painManagement: Math.round(painScore),
    },
  };
};

module.exports = {
  predictPCOSRisk,
  detectIrregularCycle,
  scoreEmotionalDistress,
  generateWellnessRecommendations,
  calculateWellnessScore,
};
