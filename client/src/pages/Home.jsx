/**
 * Home Page — Eunoia Platform
 * Landing page with hero, wellness tip, feature grid, streak, and emergency info
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, Calendar, BarChart2, BookOpen,
  HelpCircle, Heart, Sparkles, Brain, Flame, Star, ArrowRight, Flower2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGarden } from '../context/GardenContext';
import axios from 'axios';
import WellnessScoreRing from '../components/common/WellnessScoreRing';
import GardenCompanion from '../components/garden/GardenCompanion';
import ParticleSystem from '../components/garden/ParticleSystem';

const features = [
  {
    icon: MessageCircle, title: 'AI Chatbot', desc: 'Ask anything about menstrual health safely',
    path: '/chat', gradient: 'from-purple-400 to-sakhi-500', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600',
  },
  {
    icon: Calendar, title: 'Cycle Tracker', desc: 'Track your cycle and predict next period',
    path: '/tracker', gradient: 'from-blue-400 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600',
  },
  {
    icon: BarChart2, title: 'Health Insights', desc: 'AI-powered insights from your health data',
    path: '/insights', gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600',
  },
  {
    icon: Brain, title: 'AI Predictions', desc: 'PCOS risk analysis & wellness scoring',
    path: '/predict', gradient: 'from-violet-400 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600',
  },
  {
    icon: BookOpen, title: 'Learning Hub', desc: 'Articles on hygiene, nutrition & wellness',
    path: '/learn', gradient: 'from-orange-400 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600',
  },
  {
    icon: HelpCircle, title: 'Myth vs Fact', desc: 'Bust myths with AI-powered analysis',
    path: '/myths', gradient: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600',
  },
  {
    icon: Heart, title: 'Emotional Support', desc: 'Breathing exercises & mood journaling',
    path: '/emotional', gradient: 'from-red-400 to-pink-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, loginUser, wellnessTip, fetchWellnessTip } = useApp();
  const [username, setUsername] = useState('');
  const [wellnessScore, setWellnessScore] = useState(null);

  useEffect(() => {
    fetchWellnessTip();
    if (user) fetchWellnessScore();
  }, [user]);

  const fetchWellnessScore = async () => {
    try {
      const res = await axios.get(`/api/ml/score/${user.userId}`);
      setWellnessScore(res.data);
    } catch {
      // Non-critical
    }
  };

  const handleStart = async () => {
    if (!user) {
      const newUser = await loginUser(username || '');
      if (newUser) navigate('/chat');
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sakhi-500 via-peach-100 to-lavender-100 p-6 md:p-8 text-white shadow-sakhi-lg">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-lavender-300/20 blur-xl" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🌸</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">EUNOIA</h1>
                <p className="text-sakhi-100 text-sm">Your emotionally-intelligent wellness garden</p>
              </div>
            </div>

            <p className="text-sakhi-100 text-lg md:text-xl mb-4">
              A safe, stigma-free companion for adolescents — build healthy habits, track cycles, and find calm.
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="Choose a nickname (optional)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  maxLength={30}
                />
                <button
                  onClick={handleStart}
                  className="bg-white text-sakhi-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-sakhi-50 transition-colors text-sm whitespace-nowrap flex items-center gap-2 shadow-sm"
                >
                  Start Anonymously <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sakhi-100 text-sm">
                  Welcome back, <strong>{user.username}</strong>! 👋
                </span>
                {parseInt(user.wellnessStreak) > 0 && (
                  <div className="streak-badge">
                    <Flame size={12} /> {user.wellnessStreak}-day streak
                  </div>
                )}
                <button
                  onClick={() => navigate('/chat')}
                  className="bg-white text-sakhi-600 font-semibold px-4 py-2 rounded-xl hover:bg-sakhi-50 transition-colors text-sm flex items-center gap-1.5"
                >
                  Open Chatbot <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex justify-center">
            <img src="/assets/image.png" alt="EUNOIA mascot" className="w-72 h-72 object-contain rounded-xl shadow-sakhi-lg bg-white/30 p-3" />
          </div>
        </div>
      </div>

      {/* ── Wellness Score + Tip row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wellness score */}
        {user && wellnessScore && (
          <div
            className="card-hover flex flex-col items-center justify-center gap-2 py-4"
            onClick={() => navigate('/predict')}
          >
            <WellnessScoreRing score={wellnessScore.score} grade={wellnessScore.grade} size={90} />
            <p className="text-xs text-gray-400 text-center">Wellness Score</p>
          </div>
        )}

        {/* Wellness tip */}
        {wellnessTip && (
          <div className={`card bg-gradient-to-r from-mint-50 to-sakhi-50 dark:from-gray-800 dark:to-gray-700 border-mint-200 dark:border-gray-600 flex items-start gap-3 ${user && wellnessScore ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
            <Sparkles size={18} className="text-sakhi-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-sakhi-600 dark:text-sakhi-300 mb-1">✨ Today's Wellness Tip</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{wellnessTip}</p>
            </div>
          </div>
        )}

        {/* If no score yet, tip takes full width */}
        {(!user || !wellnessScore) && !wellnessTip && (
          <div className="sm:col-span-3 card text-center py-6 text-gray-400">
            <Sparkles size={24} className="mx-auto mb-2 text-sakhi-300" />
            <p className="text-sm">Loading your wellness tip...</p>
          </div>
        )}
      </div>

      {/* ── Feature Grid ── */}
      <div>
        <h2 className="text-base font-display font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Explore Features
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {features.map(({ icon: Icon, title, desc, path, bg, text, gradient }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="card text-left hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={20} className={text} />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs mb-1 leading-tight">{title}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight hidden sm:block">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Emergency Info ── */}
      <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
        <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm mb-2 flex items-center gap-2">
          🆘 Emergency Helplines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-red-600 dark:text-red-300">
          <div className="flex items-center gap-1.5">
            <span className="font-bold">Medical Emergency:</span> 108
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold">iCall (Mental Health):</span> 9152987821
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold">Vandrevala Foundation:</span> 1860-2662-345
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
