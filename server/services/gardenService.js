/**
 * Garden Intelligence Service — builds the emotional wellness world state.
 *
 * This composes cycle, symptom, chat, and user data into a single garden
 * profile with zone vitality, weather, story beats, and recommendations.
 */

const { findCSV } = require('../utils/csvHelper');
const {
  detectIrregularCycle,
  scoreEmotionalDistress,
  generateWellnessRecommendations,
  calculateWellnessScore,
} = require('./mlService');

const GARDEN_LEVELS = [
  { level: 1, name: 'Seedling', minScore: 0, emoji: '🌱' },
  { level: 2, name: 'Sprout', minScore: 20, emoji: '🌿' },
  { level: 3, name: 'Blooming', minScore: 35, emoji: '🌸' },
  { level: 4, name: 'Flourishing', minScore: 50, emoji: '🌺' },
  { level: 5, name: 'Radiant', minScore: 65, emoji: '✨' },
  { level: 6, name: 'Magical', minScore: 80, emoji: '🌟' },
  { level: 7, name: 'Ethereal', minScore: 92, emoji: '🦋' },
];

const WEATHER_STATES = {
  sunrise: { id: 'sunrise', label: 'Sunrise', emoji: '🌅', mood: 'hopeful', ambience: 'soft piano and birds' },
  sunny: { id: 'sunny', label: 'Sunny', emoji: '☀️', mood: 'bright', ambience: 'warm breezes and birdsong' },
  rain: { id: 'rain', label: 'Gentle Rain', emoji: '🌧️', mood: 'restorative', ambience: 'steady rain and distant waterfall' },
  fog: { id: 'fog', label: 'Foggy', emoji: '🌫️', mood: 'slow', ambience: 'quiet ambient pads' },
  storm: { id: 'storm', label: 'Stormy', emoji: '⛈️', mood: 'protective', ambience: 'deep calming drones' },
  moon: { id: 'moon', label: 'Moonlit', emoji: '🌙', mood: 'tender', ambience: 'night wind and soft chimes' },
  magical: { id: 'magical', label: 'Magical', emoji: '✨', mood: 'radiant', ambience: 'glowing chimes and fireflies' },
};

const COMPANION_SPIRITS = [
  { id: 'luna', name: 'Luna', emoji: '🦋', voice: 'gentle' },
  { id: 'sage', name: 'Sage', emoji: '🌿', voice: 'grounding' },
  { id: 'aurora', name: 'Aurora', emoji: '✨', voice: 'luminous' },
];

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const levelForScore = (score) => [...GARDEN_LEVELS].reverse().find(level => score >= level.minScore) || GARDEN_LEVELS[0];

const weatherForState = (score, stressScore, cycleConfidence, hour = new Date().getHours()) => {
  if (score >= 88 && stressScore < 24) return WEATHER_STATES.magical;
  if (hour >= 20 || hour < 5) return score >= 60 ? WEATHER_STATES.moon : WEATHER_STATES.fog;
  if (stressScore >= 65) return WEATHER_STATES.storm;
  if (stressScore >= 42) return WEATHER_STATES.rain;
  if (cycleConfidence >= 65 && score >= 70) return WEATHER_STATES.sunny;
  if (score >= 70) return WEATHER_STATES.sunny;
  if (score >= 48) return WEATHER_STATES.sunrise;
  if (score >= 30) return WEATHER_STATES.fog;
  return WEATHER_STATES.storm;
};

const companionForState = (score, stressScore, streak, hour = new Date().getHours()) => {
  const spirit = score >= 78 ? COMPANION_SPIRITS[2] : score >= 42 ? COMPANION_SPIRITS[0] : COMPANION_SPIRITS[1];
  let tone = 'hopeful';

  if (hour >= 21 || hour < 6) tone = 'rest';
  else if (stressScore >= 60) tone = 'support';
  else if (score >= 80 && streak >= 7) tone = 'celebrate';
  else if (score >= 60) tone = 'steady';

  const messages = {
    rest: 'Your garden is quiet and safe tonight. Rest is part of growth.',
    support: 'I can feel the weight in your day. We will soften it together, one breath at a time.',
    celebrate: 'Your care is blooming everywhere here. The whole garden is glowing with pride.',
    steady: 'Small habits are becoming roots. Keep tending the garden at your own pace.',
    hopeful: 'Every gentle action you take helps this place become brighter and kinder.',
  };

  return {
    ...spirit,
    tone,
    message: messages[tone],
  };
};

const buildZone = (id, name, emoji, unlockLevel, value, notes) => ({
  id,
  name,
  emoji,
  unlockLevel,
  vitality: clamp(value),
  notes,
});

const buildZoneStates = ({ score, waterIntake, sleepHours, streak, journalEntries, breathingDone, cycleLogged, moodScore, stressScore, cycleAnalysis }) => {
  const cycleBonus = cycleLogged ? 18 : 0;
  const breathingBonus = breathingDone ? 22 : 0;
  const streakBoost = Math.min(22, streak * 2.6);

  return [
    buildZone('water', 'Water Garden', '💧', 1, (waterIntake / 8) * 100, waterIntake >= 6 ? 'Hydration is nurturing the ponds.' : 'The pond needs a little more care.'),
    buildZone('moon', 'Moon Garden', '🌙', 2, cycleLogged ? 68 + cycleBonus : 22, cycleAnalysis.isIrregular ? 'The moon garden is learning your rhythm.' : 'Moonflowers are in harmony with your cycle.'),
    buildZone('emotional', 'Emotional Sky', '🌤️', 1, clamp(100 - stressScore + moodScore * 0.25), stressScore >= 60 ? 'The sky is asking for gentleness.' : 'The sky is opening with calm light.'),
    buildZone('forest', 'Forest of Habits', '🌲', 2, clamp(30 + streakBoost + score * 0.25), streak >= 7 ? 'Ancient trees are growing from consistency.' : 'The forest is rooting itself.'),
    buildZone('temple', 'Healing Temple', '🏛️', 3, clamp(20 + breathingBonus + score * 0.2), breathingDone ? 'Breath practice has lit the temple.' : 'The temple is waiting for a slow return.'),
    buildZone('butterfly', 'Butterfly Sanctuary', '🦋', 4, clamp(score * 0.45 + moodScore * 0.35 - stressScore * 0.1), stressScore < 30 ? 'Butterflies are gathering in the warmth.' : 'Soft transformation is still happening.'),
    buildZone('journal', 'Journal Tree', '📖', 2, clamp(journalEntries * 18 + score * 0.2), journalEntries >= 5 ? 'Your words are growing a wisdom canopy.' : 'The tree is ready for more pages.'),
  ];
};

const buildRecommendations = ({ rawRecommendations, distressScore, cycleAnalysis, lowHydration, lowSleep }) => {
  const items = [...(rawRecommendations || [])].slice(0, 4);

  if (distressScore >= 45) {
    items.unshift({
      category: 'Emotional Care',
      priority: 'high',
      icon: '🫶',
      title: 'Slow the environment down',
      message: 'Your emotional signal is asking for softer input right now.',
      action: 'Try one minute of box breathing or a short grounding audio.',
    });
  }

  if (cycleAnalysis.isIrregular) {
    items.push({
      category: 'Cycle Awareness',
      priority: 'medium',
      icon: '🌙',
      title: 'Watch cycle patterns gently',
      message: 'The moon garden is seeing some variation in cycle rhythm.',
      action: 'Keep tracking dates, symptoms, and stress for a few cycles.',
    });
  }

  if (lowHydration) {
    items.push({
      category: 'Hydration',
      priority: 'medium',
      icon: '💧',
      title: 'Nourish the Water Garden',
      message: 'Your hydration signal is low enough to affect energy and mood.',
      action: 'Add a glass of water before and after school or study sessions.',
    });
  }

  if (lowSleep) {
    items.push({
      category: 'Sleep',
      priority: 'medium',
      icon: '😴',
      title: 'Protect the night cycle',
      message: 'Sleep and emotional recovery are linked in the garden model.',
      action: 'Set a wind-down alarm and keep your phone away for 20 minutes.',
    });
  }

  return items.slice(0, 5);
};

const storyForState = ({ score, streak, stressScore, cycleAnalysis, weather }) => {
  if (stressScore >= 65) {
    return {
      title: 'Storm Resting Over the Garden',
      body: 'The sky is cloudy, but the roots are still alive. This is a rest chapter, not a failure chapter.',
    };
  }
  if (cycleAnalysis.isIrregular) {
    return {
      title: 'Learning the Lunar Rhythm',
      body: 'The moon garden is mapping a softer rhythm so the next bloom can be predicted with more care.',
    };
  }
  if (score >= 80 && streak >= 7) {
    return {
      title: 'The Garden is in Full Bloom',
      body: 'Fireflies, lotus water, and bright petals are emerging because your habits have become a healing ritual.',
    };
  }
  if (weather.id === 'moon') {
    return {
      title: 'A Quiet Night Path',
      body: 'Moonlight is softening the edges of the day so tomorrow can begin from a gentler place.',
    };
  }
  return {
    title: 'A Garden Growing in Layers',
    body: 'Each small action is changing the environment in a visible, calming way. The story is still unfolding.',
  };
};

const buildGardenIntelligence = ({ user, cycleLogs, symptomLogs, chatLogs, journalEntries = [], localMetrics = {} }) => {
  const recentCycles = [...cycleLogs].slice(-10);
  const recentSymptoms = [...symptomLogs].slice(-12);
  const recentChats = [...chatLogs].slice(-8);

  const averageWaterIntake = recentCycles.reduce((sum, row) => sum + (parseFloat(row.waterIntake) || 0), 0) / (recentCycles.length || 1);
  const averageSleepHours = recentCycles.reduce((sum, row) => sum + (parseFloat(row.sleepHours) || 0), 0) / (recentCycles.length || 1);
  const averagePainLevel = recentSymptoms.reduce((sum, row) => sum + (parseFloat(row.painLevel) || 0), 0) / (recentSymptoms.length || 1);
  const totalCycleLogs = cycleLogs.length;

  const commonMoods = {};
  recentCycles.forEach(row => {
    if (row.mood) commonMoods[row.mood] = (commonMoods[row.mood] || 0) + 1;
  });

  const commonSymptoms = {};
  recentSymptoms.forEach(row => {
    if (row.symptoms) {
      row.symptoms.split(';').map(s => s.trim()).filter(Boolean).forEach(symptom => {
        commonSymptoms[symptom] = (commonSymptoms[symptom] || 0) + 1;
      });
    }
  });

  const latestMoodMessage = recentChats.slice(-1)[0]?.message || recentSymptoms.slice(-1)[0]?.notes || '';
  const distress = scoreEmotionalDistress(latestMoodMessage);
  const irregularCycle = detectIrregularCycle(cycleLogs);
  const wellnessScore = calculateWellnessScore({ averageWaterIntake, averageSleepHours, totalCycleLogs, averagePainLevel });
  const rawRecommendations = generateWellnessRecommendations({
    averageWaterIntake,
    averageSleepHours,
    commonSymptoms,
    commonMoods,
    totalCycleLogs,
    averagePainLevel,
  });

  const moodScore = recentCycles.slice(-1)[0]?.mood
    ? Math.max(40, Math.min(95, 55 + (recentCycles.slice(-1)[0].mood.toLowerCase().includes('happy') ? 25 : 0)))
    : 52;

  const stressScore = clamp((distress.score * 0.7) + (irregularCycle.isIrregular ? 18 : 0) + (averagePainLevel * 6));
  const score = clamp(Math.round((wellnessScore.score * 0.7) + ((100 - stressScore) * 0.3)));
  const level = levelForScore(score);
  const weather = weatherForState(score, stressScore, irregularCycle.confidence);
  const companion = companionForState(score, stressScore, parseInt(user?.wellnessStreak, 10) || 0);
  const zones = buildZoneStates({
    score,
    waterIntake: localMetrics.waterIntake ?? averageWaterIntake,
    sleepHours: localMetrics.sleepHours ?? averageSleepHours,
    streak: parseInt(user?.wellnessStreak, 10) || 0,
    journalEntries: journalEntries.length,
    breathingDone: Boolean(localMetrics.breathingDone),
    cycleLogged: cycleLogs.length > 0,
    moodScore,
    stressScore,
    cycleAnalysis: irregularCycle,
  });
  const recommendations = buildRecommendations({
    rawRecommendations,
    distressScore: distress.score,
    cycleAnalysis: irregularCycle,
    lowHydration: averageWaterIntake < 6,
    lowSleep: averageSleepHours < 6.5,
  });

  const heroSignals = [
    `${zones.find(zone => zone.id === 'water')?.vitality || 0}% Water Garden`,
    `${zones.find(zone => zone.id === 'forest')?.vitality || 0}% Habit Forest`,
    distress.score >= 45 ? 'Slow emotional weather' : 'Stable emotional weather',
  ];

  const story = storyForState({ score, streak: parseInt(user?.wellnessStreak, 10) || 0, stressScore, cycleAnalysis: irregularCycle, weather });

  return {
    score,
    level,
    weather,
    companion,
    zones,
    story,
    recommendations,
    heroSignals,
    emotional: {
      distress,
      stressScore,
      moodScore,
    },
    cycleAnalysis: irregularCycle,
    wellnessScore,
    audio: {
      ambience: weather.ambience,
      music: score >= 80 ? 'glowing ambient chimes' : score >= 55 ? 'soft piano layers' : 'grounding rain and wind',
    },
    confidence: clamp(55 + (cycleLogs.length * 3) + (symptomLogs.length * 2) - (distress.score * 0.4)),
    references: [
      { label: 'Cycle tracker data', confidence: cycleLogs.length ? 0.92 : 0.28 },
      { label: 'Symptom history', confidence: symptomLogs.length ? 0.88 : 0.25 },
      { label: 'Chat and journal tone', confidence: recentChats.length || journalEntries.length ? 0.74 : 0.3 },
    ],
  };
};

module.exports = { buildGardenIntelligence };