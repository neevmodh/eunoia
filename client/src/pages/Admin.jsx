import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, Download, BarChart2, Users, MessageCircle, Plus, Eye } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CSV_FILES = ['users.csv', 'chat_history.csv', 'symptom_logs.csv', 'cycle_tracker.csv', 'educational_content.csv', 'myths_facts.csv'];

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('stats');
  const [csvData, setCsvData] = useState(null);
  const [csvFile, setCsvFile] = useState('');
  const [newContent, setNewContent] = useState({ title: '', category: '', summary: '', content: '', tags: '' });
  const [newMyth, setNewMyth] = useState({ statement: '', classification: 'MYTH', explanation: '', source: '' });

  const login = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/stats', { headers: { password } });
      setStats(res.data.stats);
      setAuthenticated(true);
      toast.success('Admin access granted.');
    } catch {
      toast.error('Invalid password.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats', { headers: { password } });
      setStats(res.data.stats);
    } catch {}
  };

  const viewCSV = async (filename) => {
    setCsvFile(filename);
    try {
      const res = await axios.get(`/api/admin/csv/${filename}`, { headers: { password } });
      setCsvData(res.data.data);
      setTab('csv');
    } catch {
      toast.error('Could not load CSV data.');
    }
  };

  const downloadCSV = (filename) => {
    const link = document.createElement('a');
    link.href = `/api/admin/download/${filename}`;
    link.setAttribute('download', filename);
    // Add password as query param for download
    link.href = `/api/admin/download/${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${filename}`);
  };

  const addContent = async () => {
    if (!newContent.title || !newContent.category || !newContent.summary) {
      toast.error('Title, category, and summary are required.');
      return;
    }
    try {
      await axios.post('/api/admin/content', newContent, { headers: { password } });
      toast.success('Content added!');
      setNewContent({ title: '', category: '', summary: '', content: '', tags: '' });
    } catch {
      toast.error('Could not add content.');
    }
  };

  const addMyth = async () => {
    if (!newMyth.statement || !newMyth.explanation) {
      toast.error('Statement and explanation are required.');
      return;
    }
    try {
      await axios.post('/api/admin/myth', newMyth, { headers: { password } });
      toast.success('Myth/Fact added!');
      setNewMyth({ statement: '', classification: 'MYTH', explanation: '', source: '' });
    } catch {
      toast.error('Could not add myth/fact.');
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto mt-10">
        <div className="card text-center">
          <Shield size={40} className="mx-auto text-sakhi-400 mb-4" />
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Admin Panel</h2>
          <p className="text-sm text-gray-500 mb-4">Enter admin password to continue</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Admin password"
            className="input-field mb-3"
          />
          <button onClick={login} disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Shield size={20} className="text-sakhi-500" /> Admin Dashboard
        </h2>
        <button onClick={fetchStats} className="btn-secondary text-sm">Refresh</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {['stats', 'csv', 'content', 'myths'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-sakhi-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600'
            }`}
          >
            {t === 'stats' ? '📊 Stats' : t === 'csv' ? '📁 CSV Data' : t === 'content' ? '📝 Add Content' : '🔍 Add Myth'}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
              { label: 'Total Chats', value: stats.totalChats, icon: MessageCircle, color: 'text-purple-500' },
              { label: 'Cycle Logs', value: stats.totalCycleLogs, icon: BarChart2, color: 'text-green-500' },
              { label: 'Symptom Logs', value: stats.totalSymptomLogs, icon: BarChart2, color: 'text-red-400' },
              { label: 'Articles', value: stats.totalContent, icon: BarChart2, color: 'text-orange-500' },
              { label: 'Myths/Facts', value: stats.totalMyths, icon: BarChart2, color: 'text-yellow-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card text-center">
                <Icon size={20} className={`mx-auto ${color} mb-1`} />
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {stats.chatByDay && (
            <div className="card">
              <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 text-sm">Chat Activity (Last 7 Days)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.chatByDay} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="count" name="Messages" fill="#ff5b95" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {stats.topSymptoms?.length > 0 && (
            <div className="card">
              <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 text-sm">Top Reported Symptoms</h4>
              <div className="space-y-2">
                {stats.topSymptoms.map(({ name, count }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300 w-32 truncate">{name}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-sakhi-400 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (count / stats.topSymptoms[0].count) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CSV Downloads */}
          <div className="card">
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 text-sm">📁 CSV Files</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CSV_FILES.map(f => (
                <div key={f} className="flex gap-1">
                  <button onClick={() => viewCSV(f)} className="flex-1 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-sakhi-50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Eye size={12} /> {f.replace('.csv', '')}
                  </button>
                  <button onClick={() => downloadCSV(f)} className="p-1.5 bg-sakhi-50 hover:bg-sakhi-100 text-sakhi-600 border border-sakhi-200 rounded-lg transition-colors" title="Download">
                    <Download size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV Viewer */}
      {tab === 'csv' && (
        <div className="card overflow-x-auto">
          <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 text-sm">📄 {csvFile}</h4>
          {csvData ? (
            csvData.length === 0 ? (
              <p className="text-gray-400 text-sm">No data in this file.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-sakhi-50 dark:bg-gray-700">
                    {Object.keys(csvData[0]).map(k => (
                      <th key={k} className="px-2 py-1.5 text-left text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-2 py-1.5 text-gray-600 dark:text-gray-300 max-w-[150px] truncate">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : <LoadingSpinner />}
        </div>
      )}

      {/* Add Content */}
      {tab === 'content' && (
        <div className="card space-y-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Plus size={16} className="text-sakhi-500" /> Add Educational Content
          </h4>
          <input value={newContent.title} onChange={e => setNewContent(p => ({ ...p, title: e.target.value }))} placeholder="Title *" className="input-field" />
          <select value={newContent.category} onChange={e => setNewContent(p => ({ ...p, category: e.target.value }))} className="input-field">
            <option value="">Select Category *</option>
            {['Menstrual Hygiene', 'Puberty Education', 'Nutrition', 'Exercise', 'Mental Wellness', 'Myths vs Facts', 'FAQs'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <textarea value={newContent.summary} onChange={e => setNewContent(p => ({ ...p, summary: e.target.value }))} placeholder="Summary *" className="input-field resize-none" rows={2} />
          <textarea value={newContent.content} onChange={e => setNewContent(p => ({ ...p, content: e.target.value }))} placeholder="Full content" className="input-field resize-none" rows={4} />
          <input value={newContent.tags} onChange={e => setNewContent(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (semicolon separated)" className="input-field" />
          <button onClick={addContent} className="btn-primary w-full">Add Content</button>
        </div>
      )}

      {/* Add Myth */}
      {tab === 'myths' && (
        <div className="card space-y-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Plus size={16} className="text-sakhi-500" /> Add Myth / Fact
          </h4>
          <input value={newMyth.statement} onChange={e => setNewMyth(p => ({ ...p, statement: e.target.value }))} placeholder="Statement *" className="input-field" />
          <select value={newMyth.classification} onChange={e => setNewMyth(p => ({ ...p, classification: e.target.value }))} className="input-field">
            <option value="MYTH">MYTH</option>
            <option value="FACT">FACT</option>
            <option value="PARTIALLY TRUE">PARTIALLY TRUE</option>
          </select>
          <textarea value={newMyth.explanation} onChange={e => setNewMyth(p => ({ ...p, explanation: e.target.value }))} placeholder="Explanation *" className="input-field resize-none" rows={3} />
          <input value={newMyth.source} onChange={e => setNewMyth(p => ({ ...p, source: e.target.value }))} placeholder="Source" className="input-field" />
          <button onClick={addMyth} className="btn-primary w-full">Add Myth/Fact</button>
        </div>
      )}
    </div>
  );
};

export default Admin;
