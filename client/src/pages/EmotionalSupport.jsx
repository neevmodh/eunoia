import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, Wind, BookOpen, Smile, Send, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { emoji: '😔', label: 'Sad', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { emoji: '😤', label: 'Irritable', color: 'bg-red-100 border-red-300 text-red-700' },
  { emoji: '😰', label: 'Anxious', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { emoji: '😴', label: 'Tired', color: 'bg-gray-100 border-gray-300 text-gray-700' },
  { emoji: '🤗', label: 'Grateful', color: 'bg-green-100 border-green-300 text-green-700' },
];

const BREATHING_STEPS = [
  { phase: 'Inhale', duration: 4, color: 'bg-blue-400', instruction: 'Breathe in slowly through your nose' },
  { phase: 'Hold', duration: 4, color: 'bg-purple-400', instruction: 'Hold your breath gently' },
  { phase: 'Exhale', duration: 6, color: 'bg-green-400', instruction: 'Breathe out slowly through your mouth' },
  { phase: 'Rest', duration: 2, color: 'bg-gray-300', instruction: 'Rest before the next breath' },
];

const JOURNAL_PROMPTS = [
  'What made me smile today?',
  'What am I grateful for right now?',
  'How is my body feeling today?',
  'What do I need most right now?',
  'What would I tell my best friend if she felt this way?',
  'What is one kind thing I can do for myself today?',
  'What emotions am I experiencing and why?',
];

const EmotionalSupport = () => {
  const { user, language } = useApp();
  const [selectedMood, setSelectedMood] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('support');
  const [breathStep, setBreathStep] = useState(null);
  const [breathIndex, setBreathIndex] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [journalPrompt, setJournalPrompt] = useState(JOURNAL_PROMPTS[0]);

  const getSupport = async () => {
    if (!message.trim() && !selectedMood) {
      toast.error('Please share how you\'re feeling or select a mood.');
      return;
    }
    setLoading(true);
    const text = message.trim() || `I'm feeling ${selectedMood?.label} today.`;
    try {
      const res = await axios.post('/api/chat', {
        message: text,
        history: [],
        userId: user?.userId,
        language,
        mode: 'emotional'
      });
      setResponse(res.data.response);
    } catch {
      toast.error('Could not get support response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startBreathing = () => {
    setBreathIndex(0);
    setBreathStep(BREATHING_STEPS[0]);
    let idx = 0;
    const cycle = () => {
      idx = (idx + 1) % BREATHING_STEPS.length;
      setBreathIndex(idx);
      setBreathStep(BREATHING_STEPS[idx]);
    };
    // Cycle through steps
    const intervals = BREATHING_STEPS.map((step, i) => {
      const delay = BREATHING_STEPS.slice(0, i).reduce((sum, s) => sum + s.duration * 1000, 0);
      return setTimeout(() => {
        setBreathIndex(i);
        setBreathStep(BREATHING_STEPS[i]);
      }, delay);
    });
    // Repeat after full cycle
    const totalDuration = BREATHING_STEPS.reduce((sum, s) => sum + s.duration * 1000, 0);
    const repeat = setInterval(() => {
      BREATHING_STEPS.forEach((step, i) => {
        setTimeout(() => {
          setBreathIndex(i);
          setBreathStep(BREATHING_STEPS[i]);
        }, BREATHING_STEPS.slice(0, i).reduce((sum, s) => sum + s.duration * 1000, 0));
      });
    }, totalDuration);
    // Stop after 3 cycles
    setTimeout(() => {
      clearInterval(repeat);
      setBreathStep(null);
      toast.success('Great job! Breathing exercise complete. 💙');
    }, totalDuration * 3);
  };

  const randomPrompt = () => {
    const p = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setJournalPrompt(p);
    setJournalText('');
  };

  const saveJournal = () => {
    if (!journalText.trim()) return;
    const entries = JSON.parse(localStorage.getItem('sakhicare_journal') || '[]');
    entries.unshift({ prompt: journalPrompt, text: journalText, date: new Date().toISOString() });
    localStorage.setItem('sakhicare_journal', JSON.stringify(entries.slice(0, 20)));
    toast.success('Journal entry saved! 📔');
    setJournalText('');
  };

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
        💙 <strong>Mental Health Disclaimer:</strong> This is a supportive companion, not a therapist. 
        For professional help, contact iCall: <strong>9152987821</strong> or Vandrevala: <strong>1860-2662-345</strong>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'support', label: '💙 Support', icon: Heart },
          { id: 'breathing', label: '🌬️ Breathe', icon: Wind },
          { id: 'journal', label: '📔 Journal', icon: BookOpen },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? 'bg-sakhi-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Support Tab */}
      {tab === 'support' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Smile size={18} className="text-yellow-400" /> How are you feeling?
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {MOODS.map(m => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m)}
                  className={`px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                    selectedMood?.label === m.label
                      ? m.color + ' border-current scale-105'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:scale-105'
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Share what's on your mind... I'm here to listen 💙"
              className="input-field resize-none mb-3"
              rows={3}
              maxLength={500}
            />

            <button
              onClick={getSupport}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Getting support...' : 'Get Support'}
            </button>
          </div>

          {response && (
            <div className="card bg-gradient-to-br from-sakhi-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-sakhi-200 dark:border-gray-600 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🌸</span>
                <span className="font-medium text-sakhi-700 dark:text-sakhi-300 text-sm">SakhiCare says:</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">{response}</p>
            </div>
          )}
        </div>
      )}

      {/* Breathing Tab */}
      {tab === 'breathing' && (
        <div className="card text-center space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">4-4-6 Breathing Exercise</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">A calming technique to reduce stress and anxiety</p>
          </div>

          {breathStep ? (
            <div className="space-y-4">
              <div className={`w-32 h-32 rounded-full ${breathStep.color} mx-auto flex items-center justify-center transition-all duration-1000 shadow-lg`}>
                <div className="text-center text-white">
                  <p className="text-2xl font-bold">{breathStep.phase}</p>
                  <p className="text-sm">{breathStep.duration}s</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{breathStep.instruction}</p>
              <div className="flex justify-center gap-2">
                {BREATHING_STEPS.map((s, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === breathIndex ? s.color : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-32 h-32 rounded-full bg-sakhi-100 dark:bg-sakhi-900/20 mx-auto flex items-center justify-center">
                <Wind size={40} className="text-sakhi-400" />
              </div>
              <div className="text-left bg-sakhi-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
                {BREATHING_STEPS.map(s => (
                  <div key={s.phase} className="flex items-center gap-3 text-sm">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-200">{s.phase} ({s.duration}s):</span>
                    <span className="text-gray-500 dark:text-gray-400">{s.instruction}</span>
                  </div>
                ))}
              </div>
              <button onClick={startBreathing} className="btn-primary w-full">
                🌬️ Start Breathing Exercise
              </button>
            </div>
          )}
        </div>
      )}

      {/* Journal Tab */}
      {tab === 'journal' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <BookOpen size={18} className="text-sakhi-500" /> Journaling
            </h3>
            <button onClick={randomPrompt} className="btn-secondary text-xs py-1.5 px-3">
              New Prompt
            </button>
          </div>

          <div className="bg-sakhi-50 dark:bg-sakhi-900/20 rounded-xl p-4 border border-sakhi-200 dark:border-sakhi-800">
            <p className="text-xs text-sakhi-500 font-medium mb-1">Today's Prompt:</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">"{journalPrompt}"</p>
          </div>

          <textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            placeholder="Write your thoughts here... This is your safe space 💙"
            className="input-field resize-none"
            rows={6}
            maxLength={1000}
          />

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{journalText.length}/1000</span>
            <button
              onClick={saveJournal}
              disabled={!journalText.trim()}
              className="btn-primary text-sm"
            >
              💾 Save Entry
            </button>
          </div>

          <p className="text-xs text-gray-400 italic text-center">
            Your journal entries are saved locally on your device only.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionalSupport;
