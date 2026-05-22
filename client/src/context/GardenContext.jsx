/**
 * GardenContext — AI Wellness Garden Engine v2
 *
 * The garden is a living emotional mirror. Every wellness action the user
 * takes — logging a cycle, journaling, breathing, chatting — feeds into
 * a multi-dimensional scoring engine that produces a rich, animated
 * garden environment in real time.
 *
 * Architecture:
 *  1. Raw metrics → computeGardenScore() → 0–100 score
 *  2. Score + mood → deriveWeather() → weather state
 *  3. Score + streak → deriveLevel() → garden level (1–7)
 *  4. All metrics → computePlantHealth() → per-zone health
 *  5. Score + mood → deriveCompanionMood() → companion state
 *  6. Level → unlockZones() → available zones
 *  7. All state → persist to localStorage
 */

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, useMemo,
} from 'react';

const GardenContext = createContext(null);

// ─── Garden Levels ────────────────────────────────────────────────────────────
export const GARDEN_LEVELS = [
  { level: 1, name: 'Seedling',    minScore: 0,  color: '#86efac', emoji: '🌱', desc: 'Your journey begins here.' },
  { level: 2, name: 'Sprout',      minScore: 18, color: '#4ade80', emoji: '🌿', desc: 'Small habits are taking root.' },
  { level: 3, name: 'Blooming',    minScore: 32, color: '#f9a8d4', emoji: '🌸', desc: 'Your garden is coming alive.' },
  { level: 4, name: 'Flourishing', minScore: 48, color: '#ff5b95', emoji: '🌺', desc: 'Wellness is blooming beautifully.' },
  { level: 5, name: 'Radiant',     minScore: 63, color: '#a78bfa', emoji: '✨', desc: 'Your light is shining bright.' },
  { level: 6, name: 'Magical',     minScore: 77, color: '#818cf8', emoji: '🌟', desc: 'Magic flows through your garden.' },
  { level: 7, name: 'Ethereal',    minScore: 90, color: '#c084fc', emoji: '🦋', desc: 'You have reached pure harmony.' },
];

// ─── Weather States ───────────────────────────────────────────────────────────
export const WEATHER = {
  SUNNY:   { id: 'sunny',   label: 'Sunny',    emoji: '☀️',  particle: 'sparkle',
    bg: 'from-amber-200 via-yellow-100 to-sky-200',
    textColor: 'text-amber-900', desc: 'Warm and bright — your wellness is glowing.' },
  CLOUDY:  { id: 'cloudy',  label: 'Cloudy',   emoji: '⛅',  particle: 'none',
    bg: 'from-slate-300 via-gray-200 to-blue-100',
    textColor: 'text-slate-700', desc: 'A gentle overcast — rest and recharge.' },
  RAINY:   { id: 'rainy',   label: 'Rainy',    emoji: '🌧️', particle: 'rain',
    bg: 'from-slate-500 via-blue-300 to-slate-400',
    textColor: 'text-slate-100', desc: 'Rain nourishes growth. Be gentle with yourself.' },
  FOGGY:   { id: 'foggy',   label: 'Foggy',    emoji: '🌫️', particle: 'fog',
    bg: 'from-gray-300 via-slate-200 to-gray-200',
    textColor: 'text-gray-600', desc: 'Fog clears with small steps forward.' },
  RAINBOW: { id: 'rainbow', label: 'Rainbow',  emoji: '🌈', particle: 'rainbow',
    bg: 'from-pink-200 via-purple-100 to-sky-200',
    textColor: 'text-purple-900', desc: 'After every storm, a rainbow blooms.' },
  MAGICAL: { id: 'magical', label: 'Magical',  emoji: '✨',  particle: 'firefly',
    bg: 'from-violet-400 via-pink-300 to-indigo-300',
    textColor: 'text-white', desc: 'Pure magic — your garden is ethereal.' },
  STORMY:  { id: 'stormy',  label: 'Stormy',   emoji: '⛈️', particle: 'storm',
    bg: 'from-gray-700 via-slate-600 to-gray-800',
    textColor: 'text-gray-100', desc: 'Storms pass. Your garden is resilient.' },
  MOONLIT: { id: 'moonlit', label: 'Moonlit',  emoji: '🌙', particle: 'stars',
    bg: 'from-indigo-900 via-purple-900 to-slate-900',
    textColor: 'text-indigo-100', desc: 'The moon watches over your garden tonight.' },
  SUNRISE: { id: 'sunrise', label: 'Sunrise',  emoji: '🌅', particle: 'sparkle',
    bg: 'from-orange-300 via-pink-200 to-purple-200',
    textColor: 'text-orange-900', desc: 'A new day dawns — fresh possibilities.' },
  GOLDEN:  { id: 'golden',  label: 'Golden Hour', emoji: '🌇', particle: 'sparkle',
    bg: 'from-yellow-300 via-orange-200 to-pink-200',
    textColor: 'text-yellow-900', desc: 'Golden hour — your efforts are paying off.' },
};

const REMOTE_WEATHER_MAP = {
  sunrise: WEATHER.SUNRISE,
  sunny: WEATHER.SUNNY,
  rain: WEATHER.RAINY,
  fog: WEATHER.FOGGY,
  storm: WEATHER.STORMY,
  moon: WEATHER.MOONLIT,
  magical: WEATHER.MAGICAL,
};

// ─── Companion Spirits ────────────────────────────────────────────────────────
export const COMPANIONS = {
  LUNA: {
    id: 'luna', name: 'Luna', emoji: '🦋', type: 'Butterfly Spirit',
    color: '#ff5b95',
    messages: {
      joyful:    "Your garden is blooming beautifully today! 🌸",
      calm:      "Take a deep breath. You're doing wonderfully, one petal at a time.",
      concerned: "I notice you've been carrying a lot. Let's rest together in the garden.",
      hopeful:   "Every small step you take grows something beautiful here. Keep going! 🌱",
      healing:   "It's okay to have hard days. Your garden still loves you unconditionally. 💙",
      excited:   "Amazing streak! Your garden is glowing with so much pride! 🌟",
      morning:   "Good morning! Your garden is waiting for you. What will you nurture today?",
      night:     "Rest well. Your garden will be here when you wake. 🌙",
    },
  },
  SAGE: {
    id: 'sage', name: 'Sage', emoji: '🌿', type: 'Forest Spirit',
    color: '#22c55e',
    messages: {
      joyful:    "The forest sings with your joy today! 🌲",
      calm:      "Breathe with the trees. You are exactly where you need to be.",
      concerned: "Even the oldest trees have seasons of rest. Be kind to yourself.",
      hopeful:   "Roots grow deep before branches reach high. Trust your process.",
      healing:   "The forest heals in silence. You are healing too.",
      excited:   "Your streak is growing like a mighty oak! 🌳",
      morning:   "The forest awakens with you. A new day of growth begins.",
      night:     "The forest rests. Let your body and mind do the same. 🍃",
    },
  },
  AURORA: {
    id: 'aurora', name: 'Aurora', emoji: '✨', type: 'Moon Fairy',
    color: '#a78bfa',
    messages: {
      joyful:    "The stars are dancing for you tonight! ✨",
      calm:      "The moon holds space for all your feelings. You are safe here.",
      concerned: "Even the moon has dark phases. Yours will pass too.",
      hopeful:   "Stardust is made of ancient light. So are you.",
      healing:   "The universe is gentle with you. Be gentle with yourself too.",
      excited:   "You're shining like a constellation! 🌟",
      morning:   "The aurora greets you with new light. Today is full of possibility.",
      night:     "Sleep under the stars. Tomorrow your garden blooms anew. 🌙",
    },
  },
};

// ─── Garden Zones ─────────────────────────────────────────────────────────────
export const GARDEN_ZONES = [
  {
    id: 'water', name: 'Water Garden', emoji: '💧', unlockLevel: 1,
    metric: 'hydration', description: 'Lotus ponds & crystal waterfalls',
    tip: 'Drink 8 glasses of water to make this zone thrive',
    plants: ['🪷', '🌊', '💦', '🐠'],
    color: '#38bdf8',
  },
  {
    id: 'moon', name: 'Moon Garden', emoji: '🌙', unlockLevel: 2,
    metric: 'cycle', description: 'Lunar flowers & glowing night blooms',
    tip: 'Log your cycle to awaken the moon garden',
    plants: ['🌙', '⭐', '🌺', '🌸'],
    color: '#818cf8',
  },
  {
    id: 'emotional', name: 'Emotional Sky', emoji: '🌤️', unlockLevel: 1,
    metric: 'mood', description: 'Weather mirrors your emotional state',
    tip: 'Log your mood daily to clear the sky',
    plants: ['☀️', '🌈', '⛅', '🌤️'],
    color: '#fbbf24',
  },
  {
    id: 'forest', name: 'Forest of Habits', emoji: '🌲', unlockLevel: 2,
    metric: 'streak', description: 'Ancient trees grow with your consistency',
    tip: 'Maintain your streak to grow the forest',
    plants: ['🌲', '🌳', '🍃', '🌿'],
    color: '#22c55e',
  },
  {
    id: 'temple', name: 'Healing Temple', emoji: '🏛️', unlockLevel: 3,
    metric: 'breathing', description: 'Sacred space for meditation & breath',
    tip: 'Complete breathing exercises to restore the temple',
    plants: ['🕯️', '🪷', '🧘', '🌸'],
    color: '#f9a8d4',
  },
  {
    id: 'butterfly', name: 'Butterfly Sanctuary', emoji: '🦋', unlockLevel: 4,
    metric: 'positivity', description: 'Emotional healing & joyful transformation',
    tip: 'Maintain positive mood and high wellness to attract butterflies',
    plants: ['🦋', '🌺', '🌸', '🌼'],
    color: '#ff5b95',
  },
  {
    id: 'journal', name: 'Journal Tree', emoji: '📖', unlockLevel: 2,
    metric: 'journaling', description: 'Ancient wisdom tree grows with your words',
    tip: 'Write journal entries to grow the wisdom tree',
    plants: ['📖', '🌳', '🍂', '✍️'],
    color: '#f59e0b',
  },
];

// ─── Score Engine ─────────────────────────────────────────────────────────────
const MOOD_SCORES = {
  'Happy': 90, 'Energetic': 95, 'Grateful': 88, '🤗 Energetic': 95,
  'Neutral': 55, '😐 Neutral': 55,
  'Tired': 35, '😴 Tired': 35,
  'Sad': 25, '😔 Sad': 25,
  'Irritable': 30, '😤 Irritable': 30,
  'Anxious': 20, '😰 Anxious': 20,
};

export const moodToScore = (label = '') => MOOD_SCORES[label] ?? 50;

const computeGardenScore = ({
  waterIntake = 0, sleepHours = 0, streak = 0, moodScore = 50,
  journalEntries = 0, breathingDone = false, cycleLogged = false,
  chatInteractions = 0, exerciseDone = false,
}) => {
  const h = Math.min(100, (waterIntake / 8) * 100);
  const s = Math.min(100, (sleepHours / 8) * 100);
  const st = Math.min(100, streak * 6.5);
  const m = Math.max(0, Math.min(100, moodScore));
  const j = Math.min(100, journalEntries * 14);
  const b = breathingDone ? 85 : 0;
  const c = cycleLogged ? 72 : 0;
  const ch = Math.min(100, chatInteractions * 9);
  const e = exerciseDone ? 70 : 0;

  return Math.round(Math.max(0, Math.min(100,
    h * 0.16 + s * 0.18 + st * 0.14 + m * 0.20 +
    j * 0.10 + b * 0.08 + c * 0.05 + ch * 0.05 + e * 0.04
  )));
};

const deriveLevel = (score) =>
  [...GARDEN_LEVELS].reverse().find(l => score >= l.minScore) || GARDEN_LEVELS[0];

const deriveWeather = (score, moodScore, streak, hour = new Date().getHours()) => {
  if (hour >= 5 && hour < 8)  return score >= 40 ? WEATHER.SUNRISE : WEATHER.FOGGY;
  if (hour >= 20 || hour < 5) return score >= 60 ? WEATHER.MOONLIT : WEATHER.STORMY;
  if (score >= 88 && streak >= 7) return WEATHER.MAGICAL;
  if (score >= 78 && moodScore >= 75) return WEATHER.RAINBOW;
  if (score >= 68) return WEATHER.GOLDEN;
  if (score >= 55) return WEATHER.SUNNY;
  if (score >= 42) return WEATHER.SUNRISE;
  if (score >= 30 && moodScore < 38) return WEATHER.RAINY;
  if (score >= 30) return WEATHER.CLOUDY;
  if (score >= 18) return WEATHER.FOGGY;
  if (moodScore < 22) return WEATHER.STORMY;
  return WEATHER.CLOUDY;
};

const deriveCompanion = (score, moodScore, streak, hour = new Date().getHours()) => {
  // Pick companion based on score range
  const spirit = score >= 70 ? COMPANIONS.AURORA : score >= 40 ? COMPANIONS.LUNA : COMPANIONS.SAGE;

  let moodKey;
  if (hour >= 5 && hour < 9)   moodKey = 'morning';
  else if (hour >= 21 || hour < 5) moodKey = 'night';
  else if (streak >= 7 && score >= 70) moodKey = 'excited';
  else if (score >= 75) moodKey = 'joyful';
  else if (score >= 55 && moodScore >= 60) moodKey = 'calm';
  else if (moodScore < 28) moodKey = 'healing';
  else if (score < 32) moodKey = 'concerned';
  else moodKey = 'hopeful';

  return { ...spirit, currentMood: moodKey, message: spirit.messages[moodKey] };
};

const computePlantHealth = (score, m) => ({
  water:     Math.min(100, (m.waterIntake / 8) * 100),
  moon:      m.cycleLogged ? Math.min(100, 60 + score * 0.3) : 25,
  emotional: Math.min(100, m.moodScore),
  forest:    Math.min(100, m.streak * 9),
  temple:    m.breathingDone ? Math.min(100, 70 + score * 0.25) : 15,
  butterfly: Math.min(100, m.moodScore * 0.7 + score * 0.3),
  journal:   Math.min(100, m.journalEntries * 18),
});

const zonesToHealthMap = (zones = []) => zones.reduce((acc, zone) => {
  acc[zone.id] = zone.vitality;
  return acc;
}, {});

const mergeWeather = (weather, remoteWeather) => {
  if (!remoteWeather) return weather;
  return {
    ...(REMOTE_WEATHER_MAP[remoteWeather.id] || weather),
    ...remoteWeather,
  };
};

const mergeCompanion = (companion, remoteCompanion) => {
  if (!remoteCompanion) return companion;
  const base = COMPANIONS[remoteCompanion.id?.toUpperCase()] || companion;
  return {
    ...base,
    ...remoteCompanion,
    color: remoteCompanion.color || base.color,
  };
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const GardenProvider = ({ children }) => {
  const [gardenData, setGardenData] = useState({
    score: 0,
    level: GARDEN_LEVELS[0],
    weather: WEATHER.CLOUDY,
    companion: { ...COMPANIONS.LUNA, currentMood: 'hopeful', message: COMPANIONS.LUNA.messages.hopeful },
    plantHealth: { water: 15, moon: 15, emotional: 45, forest: 0, temple: 0, butterfly: 25, journal: 0 },
    unlockedZones: ['water', 'emotional'],
    particles: 'none',
    ambientTheme: 'calm',
    season: 'spring',
    lastUpdated: null,
    rawMetrics: {},
    zones: [],
    story: { title: 'The garden is resting', body: 'Small actions will gradually wake the world.' },
    recommendations: [],
    heroSignals: [],
    audio: { ambience: 'soft calm', music: 'quiet ambient layers' },
    emotional: { distress: { level: 'none', score: 0, signals: [], needsEscalation: false }, stressScore: 0, moodScore: 50 },
    references: [],
    confidence: 0,
  });

  const [companionMessage, setCompanionMessage] = useState('');
  const [gardenHistory, setGardenHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [newAchievementToast, setNewAchievementToast] = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState('luna');
  const msgTimer = useRef(null);

  // ── Restore from localStorage ────────────────────────────────────────────
  useEffect(() => {
    try {
      const g = localStorage.getItem('eunoia_garden');
      if (g) setGardenData(p => ({ ...p, ...JSON.parse(g) }));
      const a = localStorage.getItem('eunoia_achievements');
      if (a) setAchievements(JSON.parse(a));
      const h = localStorage.getItem('eunoia_garden_history');
      if (h) setGardenHistory(JSON.parse(h));
      const sc = localStorage.getItem('eunoia_companion');
      if (sc) setSelectedCompanion(sc);
    } catch {}
  }, []);

  // ── Core update function ─────────────────────────────────────────────────
  const updateGarden = useCallback((metrics, remoteProfile = null) => {
    const {
      waterIntake = 0, sleepHours = 0, streak = 0, mood = '',
      journalEntries = 0, breathingDone = false, cycleLogged = false,
      chatInteractions = 0, exerciseDone = false,
    } = metrics;

    const moodScore   = moodToScore(mood);
    const localScore  = computeGardenScore({ waterIntake, sleepHours, streak, moodScore, journalEntries, breathingDone, cycleLogged, chatInteractions, exerciseDone });
    const localLevel   = deriveLevel(localScore);
    const localWeather = deriveWeather(localScore, moodScore, streak);
    const localCompanion = deriveCompanion(localScore, moodScore, streak);
    const plantHealth = computePlantHealth(localScore, { waterIntake, sleepHours, streak, moodScore, journalEntries, breathingDone, cycleLogged });
    const unlockedZones = GARDEN_ZONES.filter(z => z.unlockLevel <= localLevel.level).map(z => z.id);

    // Determine season from month
    const month = new Date().getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' : month >= 5 && month <= 7 ? 'summer' : month >= 8 && month <= 10 ? 'autumn' : 'winter';

    const remoteLevel = remoteProfile?.level
      ? { ...localLevel, ...remoteProfile.level, minScore: localLevel.minScore }
      : localLevel;
    const remoteWeather = mergeWeather(localWeather, remoteProfile?.weather);
    const remoteCompanion = mergeCompanion(localCompanion, remoteProfile?.companion);
    const remoteZones = remoteProfile?.zones || [];
    const remoteStory = remoteProfile?.story || null;
    const remoteRecommendations = remoteProfile?.recommendations || [];

    const newState = {
      score: remoteProfile?.score ?? localScore,
      level: remoteLevel,
      weather: remoteWeather,
      companion: remoteCompanion,
      plantHealth: remoteZones.length ? zonesToHealthMap(remoteZones) : plantHealth,
      unlockedZones: remoteZones.length ? remoteZones.filter(z => z.vitality > 0).map(z => z.id) : unlockedZones,
      particles: remoteWeather.particle,
      ambientTheme: remoteProfile?.audio?.ambience ? (localScore >= 70 ? 'magical' : 'calm') : (localScore >= 70 ? 'magical' : localScore >= 45 ? 'calm' : 'healing'),
      season,
      lastUpdated: new Date().toISOString(),
      rawMetrics: metrics,
      zones: remoteZones,
      story: remoteStory || { title: 'The garden is alive', body: 'Your habits are shaping the world in real time.' },
      recommendations: remoteRecommendations,
      heroSignals: remoteProfile?.heroSignals || [],
      audio: remoteProfile?.audio || { ambience: 'soft calm', music: 'quiet ambient layers' },
      emotional: remoteProfile?.emotional || { distress: { level: 'none', score: 0, signals: [], needsEscalation: false }, stressScore: 0, moodScore },
      references: remoteProfile?.references || [],
      confidence: remoteProfile?.confidence ?? 0,
    };

    setGardenData(newState);
    localStorage.setItem('eunoia_garden', JSON.stringify(newState));

    // Companion message
    triggerCompanionMessage(remoteProfile?.companion?.message || localCompanion.message);

    // Achievements
    checkAndAwardAchievements({ score: localScore, streak, journalEntries, breathingDone, cycleLogged, waterIntake, level: remoteLevel });

    // History entry
    setGardenHistory(prev => {
      const entry = { score: localScore, date: new Date().toISOString(), weather: remoteWeather.id, level: remoteLevel.level };
      const updated = [entry, ...prev].slice(0, 60);
      localStorage.setItem('eunoia_garden_history', JSON.stringify(updated));
      return updated;
    });
  }, [achievements]);

  const triggerCompanionMessage = useCallback((msg) => {
    setCompanionMessage(msg);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setCompanionMessage(''), 6000);
  }, []);

  const checkAndAwardAchievements = useCallback(({ score, streak, journalEntries, breathingDone, cycleLogged, waterIntake, level }) => {
    const checks = [
      { id: 'first_bloom',    cond: true },
      { id: 'radiant_garden', cond: score >= 80 },
      { id: 'week_warrior',   cond: streak >= 7 },
      { id: 'month_warrior',  cond: streak >= 30 },
      { id: 'journal_keeper', cond: journalEntries >= 5 },
      { id: 'journal_sage',   cond: journalEntries >= 20 },
      { id: 'breath_master',  cond: breathingDone },
      { id: 'cycle_tracker',  cond: cycleLogged },
      { id: 'hydration_hero', cond: waterIntake >= 8 },
      { id: 'magical_realm',  cond: level.level >= 6 },
      { id: 'ethereal_soul',  cond: level.level >= 7 },
      { id: 'butterfly_soul', cond: level.level >= 4 },
    ];

    const newIds = checks
      .filter(c => c.cond && !achievements.includes(c.id))
      .map(c => c.id);

    if (newIds.length > 0) {
      const updated = [...achievements, ...newIds];
      setAchievements(updated);
      localStorage.setItem('eunoia_achievements', JSON.stringify(updated));
      setNewAchievementToast(newIds[0]);
      setTimeout(() => setNewAchievementToast(null), 4000);
    }
  }, [achievements]);

  const changeCompanion = useCallback((id) => {
    setSelectedCompanion(id);
    localStorage.setItem('eunoia_companion', id);
  }, []);

  return (
    <GardenContext.Provider value={{
      gardenData, updateGarden,
      companionMessage, triggerCompanionMessage,
      gardenHistory, achievements, newAchievementToast,
      selectedCompanion, changeCompanion,
      GARDEN_LEVELS, WEATHER, COMPANIONS, GARDEN_ZONES,
    }}>
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error('useGarden must be used within GardenProvider');
  return ctx;
};
