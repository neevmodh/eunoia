/**
 * AI Predictions Page — Eunoia Platform
 * 
 * Features:
 *  - PCOS Risk Assessment with feature importance chart
 *  - Irregular Cycle Detection
 *  - Wellness Score Ring
 *  - Personalized Recommendations
 *  - AI-generated wellness plan
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Brain, AlertTriangle, CheckCircle, TrendingUp,
  RefreshCw, ChevronDown, ChevronUp, Sparkles, Activity,
  Droplets, Moon, Heart, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WellnessScoreRing from '../components/common/WellnessScoreRing';

// ─── PCOS Form ────────────────────────────────────────────────────────────────

const defaultPCOSForm = {
  cycleLength: 28,
  painLevel: 3,
  acne: false,
  excessHairGrowth: false,
  weightGain: false,
  fatigue: false,
  moodSwings: false,
  sleepHours: 7,
  waterIntake: 8,
  irregularCycles: false,
};

const riskColors = {
  Low:    { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  text: 'text-green-700 dark:text-green-300',  bar: '#22c55e' },
  Medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', bar: '#eab308' },
  High:   { bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800',      text: 'text-red-700 dark:text-red-300',      bar: '#ef4444' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const Predictions = () => {
  const { user, loginUser } = useApp();
  const [tab, setTab] = useState('pcos');

  // PCOS state
  const [pcosForm, setPcosForm] = useState(defaultPCOSForm);
  const [pcosResult, setPcosResult] = useState(null);
  const [pcosLoading, setPcosLoading] = useState(false);
  const [showFactors, setShowFactors] = useState(false);

  // Wellness state
  const [wellnessData, setWellnessData] = useState(null);
  const [wellnessLoading, setWellnessLoading] = useState(false);

  useEffect(() => {
    if (user && tab === 'wellness') fetchWellness();
  }, [user, tab]);

  // ── PCOS Prediction ──────────────────────────────────────────────────────────

  const runPCOSPrediction = async () => {
    setPcosLoading(true);
    setPcosResult(null);
    try {
      const res = await axios.post('/api/ml/pcos-risk', pcosForm);
      setPcosResult(res.data.result);
    } catch {
      toast.error('Could not run prediction. Please try again.');
    } finally {
      setPcosLoading(false);
    }
  };

  // ── Wellness Analysis ────────────────────────────────────────────────────────

  const fetchWellness = async () => {
    if (!user) return;
    setWellnessLoading(true);
    try {
      const res = await axios.get(`/api/ml/wellness/${user.userId}`);
      setWellnessData(res.data);
    } catch {
      toast.error('Could not load wellness analysis.');
    } finally {
      setWellnessLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const colors = pcosResult ? riskColors[pcosResult.level] : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-sm">
          <Brain size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-gray-800 dark:text-gray-100">AI Health Predictions</h1>
          <p className="text-xs text-gray-400">Powered by ML models • Educational only</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'pcos',     label: '🧬 PCOS Risk' },
          { id: 'wellness', label: '✨ Wellness Analysis' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-sakhi-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600 hover:bg-sakhi-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PCOS Tab ── */}
      {tab === 'pcos' && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Brain size={16} className="text-violet-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">PCOS Risk Assessment</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Answer the questions below. Our ML model will analyze your inputs and estimate risk level.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cycle length */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Average Cycle Length (days)
                </label>
                <input
                  type="number"
                  value={pcosForm.cycleLength}
                  onChange={e => setPcosForm(p => ({ ...p, cycleLength: parseInt(e.target.value) || 28 }))}
                  className="input-field"
                  min={15} max={60}
                />
              </div>

              {/* Pain level */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Period Pain Level (1–10): <span className="text-sakhi-500 font-bold">{pcosForm.painLevel}</span>
                </label>
                <input
                  type="range"
                  value={pcosForm.painLevel}
                  onChange={e => setPcosForm(p => ({ ...p, painLevel: parseInt(e.target.value) }))}
                  className="w-full accent-sakhi-500"
                  min={1} max={10}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Mild</span><span>Severe</span>
                </div>
              </div>

              {/* Sleep */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Average Sleep Hours: <span className="text-sakhi-500 font-bold">{pcosForm.sleepHours}h</span>
                </label>
                <input
                  type="range"
                  value={pcosForm.sleepHours}
                  onChange={e => setPcosForm(p => ({ ...p, sleepHours: parseInt(e.target.value) }))}
                  className="w-full accent-sakhi-500"
                  min={3} max={12}
                />
              </div>

              {/* Water intake */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Daily Water Intake (glasses): <span className="text-sakhi-500 font-bold">{pcosForm.waterIntake}</span>
                </label>
                <input
                  type="range"
                  value={pcosForm.waterIntake}
                  onChange={e => setPcosForm(p => ({ ...p, waterIntake: parseInt(e.target.value) }))}
                  className="w-full accent-sakhi-500"
                  min={1} max={15}
                />
              </div>
            </div>

            {/* Boolean symptoms */}
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                Do you experience any of the following? (select all that apply)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'irregularCycles',  label: 'Irregular Cycles' },
                  { key: 'acne',             label: 'Acne / Breakouts' },
                  { key: 'excessHairGrowth', label: 'Excess Hair Growth' },
                  { key: 'weightGain',       label: 'Unexplained Weight Gain' },
                  { key: 'fatigue',          label: 'Chronic Fatigue' },
                  { key: 'moodSwings',       label: 'Mood Swings' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPcosForm(p => ({ ...p, [key]: !p[key] }))}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all text-left ${
                      pcosForm[key]
                        ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-400 text-violet-700 dark:text-violet-300'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-300'
                    }`}
                  >
                    {pcosForm[key] ? '✓ ' : ''}{label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runPCOSPrediction}
              disabled={pcosLoading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {pcosLoading
                ? <><RefreshCw size={16} className="animate-spin" /> Analyzing...</>
                : <><Brain size={16} /> Run PCOS Risk Analysis</>
              }
            </button>
          </div>

          {/* Result */}
          {pcosLoading && <LoadingSpinner text="Running ML analysis..." />}

          {pcosResult && colors && (
            <div className={`card border-2 ${colors.border} ${colors.bg} animate-fade-in-up space-y-4`}>
              {/* Risk level header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pcosResult.level === 'Low'
                    ? <CheckCircle size={28} className="text-green-500" />
                    : pcosResult.level === 'Medium'
                    ? <AlertTriangle size={28} className="text-yellow-500" />
                    : <AlertTriangle size={28} className="text-red-500" />
                  }
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PCOS Risk Level</p>
                    <p className={`text-2xl font-display font-bold ${colors.text}`}>{pcosResult.level}</p>
                  </div>
                </div>
                {/* Score gauge */}
                <div className="text-right">
                  <p className={`text-4xl font-bold ${colors.text}`}>{pcosResult.score}</p>
                  <p className="text-xs text-gray-400">/ 100</p>
                </div>
              </div>

              {/* Score bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${pcosResult.score}%`, backgroundColor: colors.bar }}
                />
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-200">{pcosResult.message}</p>

              {/* Feature importance chart */}
              <div>
                <button
                  onClick={() => setShowFactors(!showFactors)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sakhi-600 transition-colors"
                >
                  {showFactors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showFactors ? 'Hide' : 'Show'} Feature Analysis
                </button>

                {showFactors && (
                  <div className="mt-3 animate-fade-in">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={pcosResult.factors.filter(f => f.present)}
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="factor" type="category" tick={{ fontSize: 10 }} width={130} />
                        <Tooltip
                          formatter={(v) => [`Weight: ${v}`, 'Contribution']}
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        />
                        <Bar dataKey="weight" fill={colors.bar} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">💡 Personalized Recommendations</p>
                <div className="space-y-2">
                  {pcosResult.recommendations.map((rec, i) => (
                    <div key={i} className="bg-white/60 dark:bg-gray-700/60 rounded-xl p-3">
                      <p className="text-xs font-semibold text-sakhi-600 dark:text-sakhi-300 mb-0.5">{rec.category}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{rec.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 italic">{pcosResult.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Wellness Tab ── */}
      {tab === 'wellness' && (
        <div className="space-y-4">
          {!user ? (
            <div className="card text-center py-10">
              <Sparkles size={40} className="mx-auto mb-3 text-sakhi-300" />
              <p className="text-gray-500 mb-4">Log in to see your personalized wellness analysis</p>
              <button onClick={() => loginUser('')} className="btn-primary">Start Anonymously</button>
            </div>
          ) : wellnessLoading ? (
            <LoadingSpinner text="Running wellness analysis..." />
          ) : wellnessData ? (
            <>
              {/* Wellness Score */}
              <div className="card text-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">Your Wellness Score</p>
                <div className="flex justify-center mb-4">
                  <WellnessScoreRing
                    score={wellnessData.wellnessScore.score}
                    grade={wellnessData.wellnessScore.grade}
                    size={140}
                  />
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Object.entries(wellnessData.wellnessScore.breakdown).map(([key, val]) => {
                    const labels = {
                      hydration: { label: 'Hydration', icon: <Droplets size={14} className="text-blue-400" /> },
                      sleep: { label: 'Sleep', icon: <Moon size={14} className="text-purple-400" /> },
                      tracking: { label: 'Tracking', icon: <Activity size={14} className="text-green-400" /> },
                      painManagement: { label: 'Pain Mgmt', icon: <Heart size={14} className="text-red-400" /> },
                    };
                    const meta = labels[key] || { label: key, icon: <Zap size={14} /> };
                    return (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          {meta.icon}
                          <span className="text-xs text-gray-500 dark:text-gray-400">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-sakhi-400 transition-all duration-700"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cycle Analysis */}
              {wellnessData.cycleAnalysis && (
                <div className={`card border ${wellnessData.cycleAnalysis.isIrregular ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10' : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className={wellnessData.cycleAnalysis.isIrregular ? 'text-yellow-500' : 'text-green-500'} />
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100">Cycle Pattern Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{wellnessData.cycleAnalysis.message}</p>
                  {wellnessData.cycleAnalysis.stats && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'Avg Length', value: `${wellnessData.cycleAnalysis.stats.averageCycleLength}d` },
                        { label: 'Std Dev', value: `±${wellnessData.cycleAnalysis.stats.standardDeviation}d` },
                        { label: 'Cycles', value: wellnessData.cycleAnalysis.stats.totalCyclesAnalyzed },
                      ].map(s => (
                        <div key={s.label} className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-2">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{s.value}</p>
                          <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-sakhi-500" />
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {wellnessData.recommendations.map((rec, i) => (
                    <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`badge text-xs ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="text-xs text-gray-400">{rec.category}</span>
                          </div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{rec.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rec.message}</p>
                          <p className="text-xs text-sakhi-600 dark:text-sakhi-300 mt-1.5 font-medium">
                            → {rec.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Plan */}
              {wellnessData.aiPlan && (
                <div className="card bg-gradient-to-br from-sakhi-50 to-lavender-50 dark:from-gray-800 dark:to-gray-700 border-sakhi-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-sakhi-500" />
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100">AI-Generated 3-Day Wellness Plan</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {wellnessData.aiPlan}
                  </p>
                </div>
              )}

              <button
                onClick={fetchWellness}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={14} /> Refresh Analysis
              </button>
            </>
          ) : (
            <div className="card text-center py-10">
              <Brain size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400 mb-4">Log cycle data to unlock wellness analysis</p>
              <button onClick={fetchWellness} className="btn-primary">Analyze Now</button>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="card border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          ⚠️ <strong>Important:</strong> These predictions are educational indicators based on self-reported data, not clinical diagnoses. 
          Always consult a qualified healthcare provider for medical evaluation.
        </p>
      </div>
    </div>
  );
};

export default Predictions;
