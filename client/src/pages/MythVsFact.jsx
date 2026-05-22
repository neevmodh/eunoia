import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HelpCircle, Send, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const classificationConfig = {
  'MYTH': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800', badge: 'badge-myth', label: '❌ MYTH' },
  'FACT': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800', badge: 'badge-fact', label: '✅ FACT' },
  'PARTIALLY TRUE': { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800', badge: 'badge-partial', label: '⚠️ PARTIALLY TRUE' },
};

const exampleStatements = [
  'Girls should not exercise during periods',
  'Periods are impure or dirty',
  'You should not wash your hair during periods',
  'Eating sour foods causes more bleeding',
  'PMS is not real',
  'A normal cycle is exactly 28 days',
];

const MythVsFact = () => {
  const [statement, setStatement] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedMyths, setSavedMyths] = useState([]);
  const [loadingMyths, setLoadingMyths] = useState(true);

  useEffect(() => {
    fetchMyths();
  }, []);

  const fetchMyths = async () => {
    setLoadingMyths(true);
    try {
      const res = await axios.get('/api/education/myths');
      setSavedMyths(res.data.data || []);
    } catch {}
    finally { setLoadingMyths(false); }
  };

  const analyze = async (text = statement) => {
    if (!text.trim()) {
      toast.error('Please enter a statement to analyze.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/education/myths/analyze', { statement: text.trim() });
      setResult(res.data.result);
      fetchMyths();
    } catch {
      toast.error('Could not analyze statement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const config = result ? (classificationConfig[result.classification] || classificationConfig['PARTIALLY TRUE']) : null;

  return (
    <div className="space-y-5">
      {/* Analyzer */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={20} className="text-sakhi-500" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Myth vs Fact Analyzer</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter any statement about menstrual health and our AI will classify it as a Myth, Fact, or Partially True.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={statement}
            onChange={e => setStatement(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="e.g. Girls should not exercise during periods"
            className="input-field flex-1"
            maxLength={300}
          />
          <button
            onClick={() => analyze()}
            disabled={loading || !statement.trim()}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            Analyze
          </button>
        </div>

        {/* Example statements */}
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleStatements.map(s => (
              <button
                key={s}
                onClick={() => { setStatement(s); analyze(s); }}
                className="text-xs bg-sakhi-50 dark:bg-sakhi-900/20 hover:bg-sakhi-100 text-sakhi-600 dark:text-sakhi-300 border border-sakhi-200 dark:border-sakhi-800 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card text-center py-8">
          <LoadingSpinner text="Analyzing with AI..." />
        </div>
      )}

      {/* Result */}
      {result && config && (
        <div className={`card border ${config.bg} animate-slide-up`}>
          <div className="flex items-center gap-3 mb-3">
            <config.icon size={24} className={config.color} />
            <span className={`badge ${config.badge} text-sm px-3 py-1`}>{config.label}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-3">
            {result.explanation}
          </p>
          {result.tip && (
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 border border-sakhi-100 dark:border-gray-600">
              <p className="text-xs font-medium text-sakhi-600 dark:text-sakhi-300 mb-1">💡 Helpful Tip</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{result.tip}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3 italic">
            Educational information only. Not a substitute for professional medical advice.
          </p>
        </div>
      )}

      {/* Saved myths */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">📚 Common Myths & Facts</h3>
        {loadingMyths ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {savedMyths.slice(0, 10).map(item => {
              const cfg = classificationConfig[item.classification] || classificationConfig['PARTIALLY TRUE'];
              return (
                <div key={item.id} className={`card border ${cfg.bg}`}>
                  <div className="flex items-start gap-3">
                    <cfg.icon size={18} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm mb-1">
                        "{item.statement}"
                      </p>
                      <span className={`badge ${cfg.badge} text-xs mb-2 inline-block`}>{item.classification}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MythVsFact;
