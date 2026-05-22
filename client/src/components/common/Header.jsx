/**
 * Header — Eunoia Platform
 * Sticky glassmorphism header with page title, user info, and quick actions
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const pageMeta = {
  '/':          { title: 'Home',             emoji: '🏠' },
  '/chat':      { title: 'AI Chatbot',        emoji: '💬' },
  '/tracker':   { title: 'Cycle Tracker',     emoji: '📅' },
  '/insights':  { title: 'Health Insights',   emoji: '📊' },
  '/predict':   { title: 'AI Predictions',    emoji: '🧠' },
  '/learn':     { title: 'Learning Hub',      emoji: '📚' },
  '/myths':     { title: 'Myth vs Fact',      emoji: '🔍' },
  '/emotional': { title: 'Emotional Support', emoji: '💙' },
  '/about':     { title: 'About EUNOIA',      emoji: 'ℹ️' },
  '/admin':     { title: 'Admin Panel',       emoji: '🛡️' },
};

const Header = () => {
  const { setSidebarOpen, user, loginUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const meta = pageMeta[location.pathname] || { title: 'EUNOIA', emoji: '🌸' };
  const brandTitle = 'EUNOIA';

  return (
    <header
      className="sticky top-0 z-10 glass-panel border-b border-white/20 dark:border-gray-700/40 px-4 py-3 flex items-center justify-between"
      style={{ background: 'linear-gradient(90deg, rgba(255,91,149,0.03), rgba(255,255,255,0.5))' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl hover:bg-sakhi-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* Page title / brand */}
          <div className="flex items-center gap-3">
          <img src="/assets/image.png" alt="EUNOIA" onError={(e)=>{e.target.style.display='none'}} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-sakhi-600 dark:text-white text-lg">{brandTitle}</h2>
              <span className="text-sm text-gray-500 hidden sm:inline">{meta.emoji}</span>
            </div>
            <p className="text-sm text-ui-muted hidden sm:block" style={{ color: 'var(--ui-muted)' }}>Educational support only • Not medical advice</p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {!user ? (
          <button
            onClick={() => loginUser('')}
            className="btn-primary text-sm py-1.5 px-4 flex items-center gap-2"
            aria-label="Get started with EUNOIA"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Get started</span>
            <span className="sm:hidden">Start</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              👤 {user.username}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
