/**
 * Garden.jsx — AI Wellness Garden Page (Part 1: imports + state + data)
 * The emotional heart of Eunoia. A living digital sanctuary that evolves
 * with the user's wellness habits.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Sparkles, RefreshCw, Trophy, Flame, Star, Heart,
  Droplets, Moon, Wind, BookOpen, MessageCircle,
  ChevronDown, ChevronUp, Info, Zap, TreePine,
  CloudRain, Sun, Cloud, Music, Volume2, VolumeX,
  ArrowRight, Wand2, ShieldCheck, Sprout, Flower2, PlayCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGarden, GARDEN_ZONES, WEATHER } from '../context/GardenContext';
import ParticleSystem from '../components/garden/ParticleSystem';
import GardenCompanion from '../components/garden/GardenCompanion';
import GardenZone from '../components/garden/GardenZone';
import WellnessScoreRing from '../components/common/WellnessScoreRing';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ─── Quick-log actions ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'water',    emoji: '💧', label: 'Drank Water',    metric: 'waterIntake',   delta: 1,    color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' },
  { id: 'sleep',    emoji: '😴', label: 'Good Sleep',     metric: 'sleepHours',    delta: 7,    color: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' },
  { id: 'breathe',  emoji: '🌬️', label: 'Breathed',       metric: 'breathingDone', delta: true, color: 'bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800' },
  { id: 'journal',  emoji: '📖', label: 'Journaled',      metric: 'journalEntries',delta: 1,    color: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' },
  { id: 'mood',     emoji: '😊', label: 'Feeling Good',   metric: 'mood',          delta: 'Happy', color: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800' },
  { id: 'cycle',    emoji: '🌙', label: 'Logged Cycle',   metric: 'cycleLogged',   delta: true, color: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' },
];

// ─── Achievement definitions ──────────────────────────────────────────────────
const ALL_ACHIEVEMENTS = [
  { id: 'first_bloom',    emoji: '🌸', title: 'First Bloom',     desc: 'Opened your garden for the first time' },
  { id: 'radiant_garden', emoji: '🌟', title: 'Radiant Garden',  desc: 'Reached 80+ wellness score' },
  { id: 'week_warrior',   emoji: '🔥', title: 'Week Warrior',    desc: '7-day wellness streak' },
  { id: 'journal_keeper', emoji: '📖', title: 'Journal Keeper',  desc: '5 journal entries written' },
  { id: 'breath_master',  emoji: '🌬️', title: 'Breath Master',   desc: 'Completed a breathing exercise' },
  { id: 'cycle_tracker',  emoji: '🌙', title: 'Cycle Tracker',   desc: 'Logged your first cycle' },
  { id: 'hydration_hero', emoji: '💧', title: 'Hydration Hero',  desc: 'Drank 8+ glasses in a day' },
  { id: 'moonlit_garden', emoji: '🌙', title: 'Moonlit Garden',  desc: 'Visited garden at night' },
  { id: 'butterfly_soul', emoji: '🦋', title: 'Butterfly Soul',  desc: 'Unlocked Butterfly Sanctuary' },
  { id: 'magical_realm',  emoji: '✨', title: 'Magical Realm',   desc: 'Reached Magical garden level' },
];

// ─── Mood options ─────────────────────────────────────────────────────────────
const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Irritable' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤗', label: 'Grateful' },
  { emoji: '🤩', label: 'Energetic' },
];

// ─── Garden Sky component ─────────────────────────────────────────────────────
const GardenSky = ({ weather, score, level, children }) => {
  const timeOfDay = new Date().getHours();
  const isNight = timeOfDay < 6 || timeOfDay >= 20;
  const activeBg = isNight && score < 50 ? WEATHER.MOONLIT.bg : weather.bg;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${activeBg} transition-all duration-2000`}
      style={{ minHeight: '280px' }}
    >
      {/* Layered sky depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none rounded-3xl" />

      {/* Ground strip */}
      <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-3xl"
        style={{ background: 'linear-gradient(to top, rgba(134,239,172,0.3), transparent)' }} />

      {/* Particles */}
      <ParticleSystem type={weather.particle} />

      {/* Content */}
      <div className="relative z-10 p-5">
        {children}
      </div>
    </div>
  );
};

// ─── Score history sparkline ──────────────────────────────────────────────────
const ScoreSparkline = ({ history }) => {
  if (!history || history.length < 2) return null;
  const pts = history.slice(0, 10).reverse();
  const max = Math.max(...pts.map(p => p.score), 1);
  const w = 120, h = 32;
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = h - (p.score / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke="#ff5b95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const x = (i / (pts.length - 1)) * w;
        const y = h - (p.score / max) * h;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#ff5b95" />;
      })}
    </svg>
  );
};

// ─── Main Garden Component ────────────────────────────────────────────────────
const Garden = () => {
  const navigate = useNavigate();
  const { user, loginUser, incrementStreak } = useApp();
  const { gardenData, updateGarden, gardenHistory, achievements, triggerCompanionMessage, GARDEN_LEVELS } = useGarden();

  const [tab, setTab] = useState('garden');
  const [localMetrics, setLocalMetrics] = useState({
    waterIntake: 0, sleepHours: 7, streak: 0, mood: '',
    journalEntries: 0, breathingDone: false, cycleLogged: false, chatInteractions: 0,
  });
  const [quickLogDone, setQuickLogDone] = useState({});
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [gardenProfile, setGardenProfile] = useState(null);
  const initialized = useRef(false);

  // Load user data and seed garden
  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true;
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cycleRes, gardenRes, journalRes] = await Promise.allSettled([
        axios.get(`/api/cycle/${user.userId}`),
        axios.get(`/api/garden/${user.userId}`),
        Promise.resolve(JSON.parse(localStorage.getItem('sakhicare_journal') || '[]')),
      ]);

      const cycleData = cycleRes.status === 'fulfilled' ? cycleRes.value.data : {};
      const gardenProfileData = gardenRes.status === 'fulfilled' ? gardenRes.value.data : null;
      const entries = journalRes.status === 'fulfilled' && Array.isArray(journalRes.value) ? journalRes.value : [];

      const recentCycle = cycleData.data?.[0] || {};
      const streak = parseInt(user.wellnessStreak) || 0;
      const chatCount = parseInt(localStorage.getItem('eunoia_chat_count') || '0');

      const metrics = {
        waterIntake: parseFloat(recentCycle.waterIntake) || 0,
        sleepHours: parseFloat(recentCycle.sleepHours) || 7,
        streak,
        mood: recentCycle.mood || '',
        journalEntries: entries.length,
        breathingDone: localStorage.getItem('eunoia_breathing_done') === 'today',
        cycleLogged: cycleData.data?.length > 0,
        chatInteractions: chatCount,
      };

      setLocalMetrics(metrics);
      setGardenProfile(gardenProfileData?.profile || null);
      updateGarden(metrics, gardenProfileData?.profile || null);

      // First visit achievement
      const ach = JSON.parse(localStorage.getItem('eunoia_achievements') || '[]');
      if (!ach.includes('first_bloom')) {
        const updated = [...ach, 'first_bloom'];
        localStorage.setItem('eunoia_achievements', JSON.stringify(updated));
        toast.success('🌸 Achievement unlocked: First Bloom!', { duration: 4000 });
      }
    } catch (err) {
      // Use defaults
      updateGarden(localMetrics);
    } finally {
      setLoading(false);
    }
  };

  // Quick-log a wellness action
  const handleQuickLog = useCallback((action) => {
    if (quickLogDone[action.id]) return;

    setQuickLogDone(prev => ({ ...prev, [action.id]: true }));

    setLocalMetrics(prev => {
      const updated = { ...prev };
      if (action.metric === 'breathingDone' || action.metric === 'cycleLogged') {
        updated[action.metric] = true;
        if (action.metric === 'breathingDone') {
          localStorage.setItem('eunoia_breathing_done', 'today');
        }
      } else if (action.metric === 'mood') {
        updated.mood = action.delta;
      } else {
        updated[action.metric] = (parseFloat(prev[action.metric]) || 0) + action.delta;
      }
      updateGarden(updated);
      return updated;
    });

    triggerCompanionMessage(`Great job! ${action.emoji} ${action.label} logged to your garden!`);
    toast.success(`${action.emoji} ${action.label} — garden updated!`, { duration: 2000 });

    // Award streak
    if (['water', 'breathe', 'journal'].includes(action.id)) {
      incrementStreak();
    }
  }, [quickLogDone, updateGarden, triggerCompanionMessage, incrementStreak]);

  const handleMoodSelect = (mood) => {
    setLocalMetrics(prev => {
      const updated = { ...prev, mood: mood.label };
      updateGarden(updated);
      return updated;
    });
    setShowMoodPicker(false);
    triggerCompanionMessage(`I feel your ${mood.label.toLowerCase()} energy. Your garden reflects it. 🌸`);
    toast.success(`${mood.emoji} Mood updated!`, { duration: 2000 });
  };

  const { score, level, weather, companion, plantHealth, unlockedZones } = gardenData;
  const earnedAchievements = ALL_ACHIEVEMENTS.filter(a => achievements.includes(a.id));
  const lockedAchievements = ALL_ACHIEVEMENTS.filter(a => !achievements.includes(a.id));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-7xl animate-float">🌸</div>
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text mb-2">Your Wellness Garden Awaits</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            A living sanctuary that grows with your wellness habits. Start your journey to unlock it.
          </p>
        </div>
        <button onClick={() => loginUser('')} className="btn-primary flex items-center gap-2 text-base px-6 py-3">
          <Sparkles size={18} /> Enter Your Garden
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">

      {/* ── Tab bar ── */}
      <div className="flex gap-2">
        {[
          { id: 'garden',       label: '🌸 Garden',      },
          { id: 'zones',        label: '🗺️ Zones',       },
          { id: 'achievements', label: '🏆 Achievements' },
          { id: 'history',      label: '📈 History',     },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-sakhi-500 text-white shadow-sm' : 'bg-white/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600 hover:bg-sakhi-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GARDEN TAB ── */}
      {tab === 'garden' && (
        <div className="space-y-4">

          {/* Sky / Main Garden View */}
          <GardenSky weather={weather} score={score} level={level}>
            <div className="flex items-start justify-between">
              {/* Left: weather + level */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{weather.emoji}</span>
                  <div>
                    <p className="text-white/90 font-display font-bold text-lg leading-tight">{weather.label}</p>
                    <p className="text-white/60 text-xs">{level.emoji} {level.name} Garden</p>
                  </div>
                </div>
                {/* Score */}
                <div className="mt-3 flex items-center gap-3">
                  <WellnessScoreRing score={score} grade={level.name} size={80} showLabel={false} />
                  <div>
                    <p className="text-white/70 text-xs">Wellness Score</p>
                    <p className="text-white font-display font-bold text-3xl leading-none">{score}</p>
                    <p className="text-white/60 text-xs">/ 100</p>
                  </div>
                </div>
              </div>

              {/* Right: companion */}
              <GardenCompanion />
            </div>

            {/* Progress to next level */}
            {(() => {
              const nextLevel = GARDEN_LEVELS.find(l => l.minScore > score);
              if (!nextLevel) return null;
              const pct = Math.round(((score - level.minScore) / (nextLevel.minScore - level.minScore)) * 100);
              return (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>{level.name}</span>
                    <span>{nextLevel.emoji} {nextLevel.name} in {nextLevel.minScore - score} pts</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="h-2 rounded-full bg-white/80 transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}
          </GardenSky>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="card-glass relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-pink-100/40 pointer-events-none" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-sakhi-500 font-semibold">Garden story mode</p>
                  <h3 className="mt-1 text-xl font-display font-bold text-gray-900 dark:text-white">
                    {gardenData.story?.title || 'The garden is learning your rhythm'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                    {gardenData.story?.body || 'Your habits are quietly changing the environment around you.'}
                  </p>
                </div>
                <div className="min-w-[120px] rounded-2xl px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-white/50 dark:border-gray-700/60 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Confidence</p>
                  <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{Math.round(gardenData.confidence || score)}%</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Garden signal strength</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">{gardenData.audio?.ambience?.includes('rain') ? '🌧️' : '🎐'}</div>
                    <div>
                      <p className="text-xs text-white/60">Ambient layer</p>
                      <p className="font-semibold">{gardenData.audio?.ambience || 'Soft calm'}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/75 dark:bg-gray-800/75 p-4 border border-white/50 dark:border-gray-700/60">
                  <p className="text-xs text-gray-400 mb-1">Companion tone</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{gardenData.companion?.name || 'Luna'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{gardenData.companion?.message || companion?.message}</p>
                </div>
                <div className="rounded-2xl bg-white/75 dark:bg-gray-800/75 p-4 border border-white/50 dark:border-gray-700/60">
                  <p className="text-xs text-gray-400 mb-1">Weather pulse</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{gardenData.weather?.emoji} {gardenData.weather?.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{gardenData.weather?.desc}</p>
                </div>
              </div>

              {gardenData.heroSignals?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gardenData.heroSignals.map(signal => (
                    <span key={signal} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 border border-white/50 dark:border-gray-700/60 text-xs font-medium text-gray-700 dark:text-gray-200">
                      <Wand2 size={12} className="text-sakhi-500" />
                      {signal}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {gardenData.recommendations?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-green-500" /> Personalized guidance
                </p>
                <p className="text-[11px] text-gray-400">Gentle suggestions, never pressure</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {gardenData.recommendations.slice(0, 4).map((item, index) => (
                  <div key={`${item.title}-${index}`} className="card border-sakhi-100/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-sakhi-50 dark:bg-sakhi-900/20 flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-sakhi-500 font-semibold">{item.category}</p>
                        <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{item.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{item.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1.5">
                          <ArrowRight size={11} className="mt-0.5 text-sakhi-400" />
                          {item.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick-log actions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Zap size={12} className="text-sakhi-400" /> Quick-log to grow your garden
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => action.id === 'mood' ? setShowMoodPicker(true) : handleQuickLog(action)}
                  disabled={quickLogDone[action.id] && action.id !== 'mood'}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 text-center ${
                    quickLogDone[action.id]
                      ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      : `${action.color} hover:-translate-y-0.5 hover:shadow-md active:scale-95`
                  }`}
                >
                  <span className="text-xl">{quickLogDone[action.id] ? '✅' : action.emoji}</span>
                  <span className="text-xs font-semibold leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood picker overlay */}
          {showMoodPicker && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowMoodPicker(false)}>
              <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-5 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <p className="text-sm font-display font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">How are you feeling right now?</p>
                <div className="grid grid-cols-4 gap-3">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m.label} onClick={() => handleMoodSelect(m)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all hover:scale-105 ${
                        localMetrics.mood === m.label
                          ? 'border-sakhi-400 bg-sakhi-50 dark:bg-sakhi-900/20'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}>
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Current mood display */}
          {localMetrics.mood && (
            <div className="card flex items-center gap-3 py-3">
              <span className="text-2xl">{MOOD_OPTIONS.find(m => m.label === localMetrics.mood)?.emoji || '😊'}</span>
              <div>
                <p className="text-xs text-gray-400">Current mood</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{localMetrics.mood}</p>
              </div>
              <button onClick={() => setShowMoodPicker(true)} className="ml-auto text-xs text-sakhi-500 hover:text-sakhi-700">Change</button>
            </div>
          )}

          {/* Today's metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card flex items-center gap-3">
              <Droplets size={20} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Water Today</p>
                <p className="font-bold text-blue-600 dark:text-blue-300">{localMetrics.waterIntake} glasses</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <Moon size={20} className="text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Sleep</p>
                <p className="font-bold text-purple-600 dark:text-purple-300">{localMetrics.sleepHours}h</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <Flame size={20} className="text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Streak</p>
                <p className="font-bold text-orange-600 dark:text-orange-300">{localMetrics.streak} days</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <BookOpen size={20} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Journal Entries</p>
                <p className="font-bold text-amber-600 dark:text-amber-300">{localMetrics.journalEntries}</p>
              </div>
            </div>
          </div>

          {/* Navigate to features */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Grow your garden by using these features</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Log Cycle', emoji: '📅', path: '/tracker', tip: '+15 pts' },
                { label: 'Chat with AI', emoji: '💬', path: '/chat', tip: '+5 pts' },
                { label: 'Breathe', emoji: '🌬️', path: '/emotional', tip: '+10 pts' },
                { label: 'Learn', emoji: '📚', path: '/learn', tip: '+5 pts' },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-sakhi-50 dark:bg-gray-700/50 hover:bg-sakhi-100 dark:hover:bg-gray-700 border border-sakhi-100 dark:border-gray-600 transition-all hover:-translate-y-0.5 text-left">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.label}</p>
                    <p className="text-xs text-sakhi-500">{item.tip}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {gardenData.references?.length > 0 && (
            <div className="card-glass border border-white/40 dark:border-gray-700/60">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <Flower2 size={12} className="text-pink-500" /> Signal sources
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {gardenData.references.map((ref) => (
                  <div key={ref.label} className="rounded-2xl bg-white/70 dark:bg-gray-800/70 px-3 py-2 border border-white/50 dark:border-gray-700/60">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{ref.label}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Confidence {Math.round((ref.confidence || 0) * 100)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh */}
          <button onClick={loadUserData} disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing garden...' : 'Refresh Garden'}
          </button>
        </div>
      )}

      {/* ── ZONES TAB ── */}
      {tab === 'zones' && (
        <div className="space-y-4">
          <div className="card bg-gradient-to-r from-sakhi-50 to-lavender-50 dark:from-gray-800 dark:to-gray-700">
            <p className="text-xs font-semibold text-sakhi-600 dark:text-sakhi-300 mb-1">🗺️ Your Garden Zones</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Each zone reflects a different aspect of your wellness. Keep your habits strong to unlock and grow all zones.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {GARDEN_ZONES.map(zone => (
              <GardenZone
                key={zone.id}
                zone={zone}
                health={plantHealth[zone.id] || 0}
                unlocked={unlockedZones.includes(zone.id)}
                onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
              />
            ))}
          </div>

          {/* Zone detail panel */}
          {selectedZone && (
            <div className="card border-sakhi-200 dark:border-sakhi-800 bg-sakhi-50/50 dark:bg-sakhi-900/10 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{selectedZone.emoji}</span>
                <div>
                  <p className="font-display font-bold text-gray-800 dark:text-gray-100">{selectedZone.name}</p>
                  <p className="text-xs text-gray-400">{selectedZone.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-sakhi-400 transition-all duration-700"
                    style={{ width: `${plantHealth[selectedZone.id] || 0}%` }} />
                </div>
                <span className="text-xs font-bold text-sakhi-600 dark:text-sakhi-300">
                  {Math.round(plantHealth[selectedZone.id] || 0)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Improve by tracking: <strong>{selectedZone.metric}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── ACHIEVEMENTS TAB ── */}
      {tab === 'achievements' && (
        <div className="space-y-4">
          {earnedAchievements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                🏆 Earned ({earnedAchievements.length})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {earnedAchievements.map(a => (
                  <div key={a.id} className="card border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10 flex items-center gap-3 animate-scale-in">
                    <span className="text-3xl">{a.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{a.title}</p>
                      <p className="text-xs text-gray-400 leading-tight">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lockedAchievements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">🔒 Locked ({lockedAchievements.length})</p>
              <div className="grid grid-cols-2 gap-3">
                {lockedAchievements.map(a => (
                  <div key={a.id} className="card opacity-50 flex items-center gap-3">
                    <span className="text-3xl grayscale">{a.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{a.title}</p>
                      <p className="text-xs text-gray-400 leading-tight">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {earnedAchievements.length === 0 && (
            <div className="empty-state">
              <span className="text-5xl">🏆</span>
              <p className="font-display font-semibold text-gray-600 dark:text-gray-300">No achievements yet</p>
              <p className="text-sm text-gray-400">Start logging your wellness habits to earn your first achievement!</p>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">📈 Garden Score History</p>
            {gardenHistory.length >= 2 ? (
              <div className="flex items-end gap-1 h-24">
                {gardenHistory.slice(0, 14).reverse().map((entry, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${(entry.score / 100) * 80}px`,
                        background: entry.score >= 70 ? '#ff5b95' : entry.score >= 45 ? '#a78bfa' : '#94a3b8',
                        minHeight: '4px',
                      }}
                      title={`Score: ${entry.score}`}
                    />
                    <span className="text-[8px] text-gray-400 rotate-45 origin-left">
                      {new Date(entry.date).toLocaleDateString('en', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Log wellness data to see your history</p>
            )}
          </div>

          {/* Level progression */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">🌱 Level Progression</p>
            <div className="space-y-2">
              {GARDEN_LEVELS.map(lvl => (
                <div key={lvl.level} className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                  score >= lvl.minScore ? 'bg-sakhi-50 dark:bg-sakhi-900/20' : 'opacity-40'
                }`}>
                  <span className="text-xl">{lvl.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{lvl.name}</p>
                    <p className="text-xs text-gray-400">Requires {lvl.minScore}+ score</p>
                  </div>
                  {score >= lvl.minScore && (
                    <span className="text-xs text-green-500 font-bold">✓ Unlocked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-center text-gray-400 italic">
        🌸 Your garden is a reflection of your wellness journey — not a medical assessment.
      </p>
    </div>
  );
};

export default Garden;
