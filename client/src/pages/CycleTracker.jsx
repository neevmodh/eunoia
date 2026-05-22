import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Droplets, Moon, Smile, Plus, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood swings', 'Back pain', 'Nausea', 'Spotting', 'Heavy flow', 'Light flow'];
const MOODS = ['😊 Happy', '😐 Neutral', '😔 Sad', '😤 Irritable', '😰 Anxious', '😴 Tired', '🤗 Energetic'];

const CycleTracker = () => {
  const { user, loginUser, incrementStreak } = useApp();
  const [tab, setTab] = useState('log');
  const [cycleData, setCycleData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [phase, setPhase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    lastPeriodDate: '',
    cycleLength: 28,
    periodDuration: 5,
    waterIntake: '',
    sleepHours: '',
    mood: '',
    symptoms: [],
    notes: ''
  });

  useEffect(() => {
    if (user) fetchCycleData();
  }, [user]);

  const fetchCycleData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/cycle/${user.userId}`);
      setCycleData(res.data.data || []);
      setPrediction(res.data.prediction);
      setPhase(res.data.phase);
    } catch {
      toast.error('Could not load cycle data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      const u = await loginUser('');
      if (!u) return;
    }
    if (!form.lastPeriodDate) {
      toast.error('Please enter your last period date.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/cycle/log', {
        ...form,
        userId: user?.userId
      });
      toast.success('Cycle logged successfully! 🌸');
      setPrediction(res.data.nextPeriod);
      setPhase(res.data.phase);
      fetchCycleData();
      setTab('insights');
      incrementStreak(); // Award streak point
    } catch {
      toast.error('Could not save cycle data.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSymptom = (s) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter(x => x !== s)
        : [...prev.symptoms, s]
    }));
  };

  // Chart data for Recharts
  const chartData = cycleData.slice(0, 8).reverse().map((d, i) => ({
    name: `Entry ${i + 1}`,
    water: parseFloat(d.waterIntake) || 0,
    sleep: parseFloat(d.sleepHours) || 0,
  }));

  return (
    <div className="space-y-4">
      {/* Phase card */}
      {phase && (
        <div className="bg-gradient-to-r from-sakhi-400 to-purple-400 text-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sakhi-100 text-xs mb-1">Current Cycle Phase</p>
              <h3 className="text-xl font-bold">{phase.phase} Phase</h3>
              <p className="text-sakhi-100 text-sm mt-1">{phase.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sakhi-100 text-xs">Day</p>
              <p className="text-3xl font-bold">{phase.day}</p>
            </div>
          </div>
        </div>
      )}

      {/* Prediction card */}
      {prediction && (
        <div className="card border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-blue-500" />
            <div>
              <p className="text-xs text-blue-500 font-medium">Next Period Prediction</p>
              <p className="font-semibold text-blue-700 dark:text-blue-300">
                {new Date(prediction).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {['log', 'history', 'insights'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-sakhi-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600'
            }`}
          >
            {t === 'log' ? '📝 Log' : t === 'history' ? '📅 History' : '📊 Charts'}
          </button>
        ))}
      </div>

      {/* Log Form */}
      {tab === 'log' && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Plus size={18} className="text-sakhi-500" /> Log Your Cycle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Period Start Date *
              </label>
              <input
                type="date"
                value={form.lastPeriodDate}
                onChange={e => setForm(p => ({ ...p, lastPeriodDate: e.target.value }))}
                className="input-field"
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cycle Length (days)
              </label>
              <input
                type="number"
                value={form.cycleLength}
                onChange={e => setForm(p => ({ ...p, cycleLength: e.target.value }))}
                className="input-field"
                min={21} max={45}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Droplets size={14} className="inline mr-1 text-blue-400" />
                Water Intake (glasses)
              </label>
              <input
                type="number"
                value={form.waterIntake}
                onChange={e => setForm(p => ({ ...p, waterIntake: e.target.value }))}
                className="input-field"
                min={0} max={20} placeholder="e.g. 8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Moon size={14} className="inline mr-1 text-purple-400" />
                Sleep Hours
              </label>
              <input
                type="number"
                value={form.sleepHours}
                onChange={e => setForm(p => ({ ...p, sleepHours: e.target.value }))}
                className="input-field"
                min={0} max={24} placeholder="e.g. 7"
              />
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Smile size={14} className="inline mr-1 text-yellow-400" />
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, mood: m }))}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    form.mood === m
                      ? 'bg-sakhi-500 text-white'
                      : 'bg-sakhi-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600 hover:bg-sakhi-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Symptoms (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    form.symptoms.includes(s)
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="input-field resize-none"
              rows={2}
              placeholder="Any additional notes..."
              maxLength={300}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : '💾 Save Cycle Log'}
          </button>
        </form>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-3">
          {loading ? <LoadingSpinner /> : cycleData.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p>No cycle data yet. Start logging!</p>
            </div>
          ) : cycleData.map((entry, i) => (
            <div key={i} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                    Period started: {new Date(entry.lastPeriodDate).toLocaleDateString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-400">Cycle: {entry.cycleLength} days</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {entry.mood && <span className="badge bg-yellow-100 text-yellow-700">{entry.mood}</span>}
                {entry.waterIntake && <span className="badge bg-blue-100 text-blue-700">💧 {entry.waterIntake} glasses</span>}
                {entry.sleepHours && <span className="badge bg-purple-100 text-purple-700">😴 {entry.sleepHours}h sleep</span>}
                {entry.symptoms && entry.symptoms.split(';').filter(Boolean).map(s => (
                  <span key={s} className="badge bg-red-100 text-red-600">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {tab === 'insights' && (
        <div className="space-y-4">
          {cycleData.length < 2 ? (
            <div className="card text-center py-8 text-gray-400">
              <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
              <p>Log at least 2 cycles to see charts.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 text-sm">💧 Water Intake Trend</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="water" name="Glasses" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 text-sm">😴 Sleep Hours Trend</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="sleep" name="Hours" stroke="#8b5cf6" fill="url(#sleepGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CycleTracker;
