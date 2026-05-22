/**
 * Health Insights Page — Eunoia Platform
 * AI-generated insights + Recharts visualizations
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, TrendingUp, Droplets, Moon, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { useApp } from '../context/AppContext';
import LoadingSpinner, { SkeletonCard } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Nutrition:  { bg: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800', icon: '🥗' },
  Wellness:   { bg: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800', icon: '✨' },
  Sleep:      { bg: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800', icon: '😴' },
  Hydration:  { bg: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800', icon: '💧' },
  Exercise:   { bg: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800', icon: '🏃‍♀️' },
  Mood:       { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800', icon: '😊' },
  Cycle:      { bg: 'bg-sakhi-100 text-sakhi-700 border-sakhi-200 dark:bg-sakhi-900/20 dark:text-sakhi-300 dark:border-sakhi-800', icon: '📅' },
  'Getting Started': { bg: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600', icon: '🌸' },
};

const PIE_COLORS = ['#f9a8d4', '#c4b5fd', '#93c5fd', '#86efac', '#fde68a', '#fdba74', '#f87171'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-sakhi-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-card text-xs">
        <p className="font-medium text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-sakhi-500">{payload[0].name}: <strong>{payload[0].value}</strong></p>
      </div>
    );
  }
  return null;
};

const Insights = () => {
  const { user, loginUser } = useApp();
  const [insights, setInsights] = useState([]);
  const [tip, setTip] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchInsights();
  }, [user]);

  const fetchInsights = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/insights/${user.userId}`);
      setInsights(res.data.insights || []);
      setTip(res.data.tip || '');
      setUserData(res.data.userData);
    } catch {
      toast.error('Could not load insights.');
    } finally {
      setLoading(false);
    }
  };

  const symptomData = userData?.commonSymptoms
    ? Object.entries(userData.commonSymptoms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }))
    : [];

  const moodData = userData?.commonMoods
    ? Object.entries(userData.commonMoods).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-gray-800 dark:text-gray-100">Your Health Insights</h2>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-sm py-2"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!user ? (
        <div className="card text-center py-10">
          <Sparkles size={40} className="mx-auto mb-3 text-sakhi-300" />
          <p className="text-gray-500 mb-4">Log in to see your personalized insights</p>
          <button onClick={() => loginUser('')} className="btn-primary">Start Anonymously</button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <SkeletonCard lines={2} />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}
          </div>
          <SkeletonCard lines={4} />
        </div>
      ) : (
        <>
          {/* Wellness Tip */}
          {tip && (
            <div className="card bg-gradient-to-r from-sakhi-50 to-lavender-50 dark:from-gray-800 dark:to-gray-700 border-sakhi-200 dark:border-gray-600">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="text-sakhi-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-sakhi-600 dark:text-sakhi-300 mb-1">✨ AI Wellness Tip</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">{tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats row */}
          {userData && (
            <div className="grid grid-cols-3 gap-3">
              <div className="card text-center border-blue-200 dark:border-blue-800">
                <Droplets size={20} className="mx-auto text-blue-400 mb-1" />
                <p className="text-xl font-bold text-blue-600">{userData.averageWaterIntake}</p>
                <p className="text-xs text-gray-400">Avg Water</p>
              </div>
              <div className="card text-center border-purple-200 dark:border-purple-800">
                <Moon size={20} className="mx-auto text-purple-400 mb-1" />
                <p className="text-xl font-bold text-purple-600">{userData.averageSleepHours}</p>
                <p className="text-xs text-gray-400">Avg Sleep (h)</p>
              </div>
              <div className="card text-center border-sakhi-200">
                <Activity size={20} className="mx-auto text-sakhi-400 mb-1" />
                <p className="text-xl font-bold text-sakhi-600">{userData.totalCycleLogs}</p>
                <p className="text-xs text-gray-400">Cycle Logs</p>
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 text-sm flex items-center gap-2">
              🤖 AI-Generated Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, i) => {
                const meta = CATEGORY_COLORS[insight.category] || CATEGORY_COLORS['Getting Started'];
                return (
                  <div
                    key={i}
                    className="card animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{insight.icon || meta.icon}</span>
                      <div>
                        <span className={`badge text-xs border mb-1 ${meta.bg}`}>
                          {insight.category}
                        </span>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{insight.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          {symptomData.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-sm">📊 Common Symptoms</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={symptomData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Frequency" fill="#ff5b95" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {moodData.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-sm">😊 Mood Distribution</h4>
              <div className="flex justify-center">
                <PieChart width={280} height={200}>
                  <Pie
                    data={moodData}
                    cx={140}
                    cy={90}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {moodData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </div>
            </div>
          )}

          <p className="text-xs text-center text-gray-400 italic">
            ⚠️ These insights are educational only. Consult a healthcare provider for medical advice.
          </p>
        </>
      )}
    </div>
  );
};

export default Insights;
