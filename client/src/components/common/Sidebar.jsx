/**
 * Sidebar — Eunoia Platform
 * Glassmorphism sidebar with garden mini-widget, navigation, streak, dark mode
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useGarden } from '../../context/GardenContext';
import {
  Home, MessageCircle, Calendar, BarChart2, BookOpen,
  HelpCircle, Heart, Info, Shield, X, Moon, Sun, Globe,
  Brain, Flame, Star, Flower2,
} from 'lucide-react';

const navItems = [
  { path: '/',          label: 'Home',              icon: Home,          color: 'text-sakhi-500',  highlight: false },
  { path: '/garden',    label: 'Wellness Garden',   icon: Flower2,       color: 'text-green-500',  highlight: true  },
  { path: '/chat',      label: 'AI Chatbot',         icon: MessageCircle, color: 'text-purple-500', highlight: false },
  { path: '/tracker',   label: 'Cycle Tracker',      icon: Calendar,      color: 'text-blue-500',   highlight: false },
  { path: '/insights',  label: 'Health Insights',    icon: BarChart2,     color: 'text-green-500',  highlight: false },
  { path: '/predict',   label: 'AI Predictions',     icon: Brain,         color: 'text-violet-500', highlight: false },
  { path: '/learn',     label: 'Learning Hub',       icon: BookOpen,      color: 'text-orange-500', highlight: false },
  { path: '/myths',     label: 'Myth vs Fact',       icon: HelpCircle,    color: 'text-yellow-500', highlight: false },
  { path: '/emotional', label: 'Emotional Support',  icon: Heart,         color: 'text-red-400',    highlight: false },
  { path: '/about',     label: 'About',              icon: Info,          color: 'text-gray-400',   highlight: false },
  { path: '/admin',     label: 'Admin',              icon: Shield,        color: 'text-gray-400',   highlight: false },
];

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, language, changeLanguage, user } = useApp();
  const { gardenData } = useGarden();
  const navigate = useNavigate();

  const { score, level, weather, companion } = gardenData;

  return (
    <aside className={`
      fixed top-0 left-0 h-full w-64 z-30
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}>
      <div className="h-full flex flex-col glass-panel overflow-hidden">

        {/* ── Logo ── */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sakhi animate-glow bg-white/30">
              <img src="/assets/image.png" alt="EUNOIA" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'}} />
            </div>
            <div>
              <h1 className="font-display font-bold text-sakhi-600 dark:text-sakhi-300 text-base leading-tight">EUNOIA</h1>
              <p className="text-[10px] text-gray-400">AI Wellness Companion</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-sakhi-50 dark:hover:bg-gray-700 transition-colors" aria-label="Close menu">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* ── Garden mini-widget ── */}
        {user && (
          <button
            onClick={() => { navigate('/garden'); setSidebarOpen(false); }}
            className="mx-3 mt-3 p-3 rounded-2xl border border-white/30 dark:border-gray-700/40 text-left transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${weather?.bg?.includes('from-') ? 'rgba(253,242,248,0.8)' : 'rgba(253,242,248,0.8)'}, rgba(237,233,254,0.7))`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Tiny particle hint */}
            <div className="absolute top-1 right-2 text-lg opacity-40 animate-float" style={{ animationDuration: '3s' }}>
              {weather?.emoji || '🌸'}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{companion?.emoji || '🦋'}</span>
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight">My Garden</p>
                <p className="text-[10px] text-gray-400">{level?.emoji} {level?.name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-display font-bold text-sakhi-600 dark:text-sakhi-300 leading-none">{score}</p>
                <p className="text-[9px] text-gray-400">score</p>
              </div>
            </div>
            {/* Mini health bar */}
                <div className="w-full bg-white/40 dark:bg-gray-700/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${score}%`,
                  background: 'linear-gradient(90deg, #ff5b95, #8b5cf6)',
                }}
              />
            </div>
          </button>
        )}

        {/* ── User card ── */}
        {user && (
          <div className="mx-3 mt-2 p-3 rounded-xl bg-gradient-to-r from-sakhi-50/80 to-lavender-50/80 dark:from-gray-700/60 dark:to-gray-700/40 border border-sakhi-100 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sakhi-300 to-lavender-400 flex items-center justify-center text-sm shadow-sm">
                  👤
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[80px]">{user.username}</p>
                  <p className="text-[10px] text-gray-400">Anonymous</p>
                </div>
              </div>
              {parseInt(user.wellnessStreak) > 0 && (
                <div className="streak-badge text-[10px]">
                  <Flame size={9} /> {user.wellnessStreak}d
                </div>
              )}
            </div>
            {parseInt(user.totalPoints) > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <Star size={10} className="text-yellow-400" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{user.totalPoints} wellness pts</span>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide mt-1">
          <ul className="space-y-0.5">
            {navItems.map(({ path, label, icon: Icon, color, highlight }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => [
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    highlight ? 'border border-green-200/60 dark:border-green-800/40 bg-green-50/40 dark:bg-green-900/10' : '',
                    isActive
                      ? 'bg-sakhi-100 dark:bg-sakhi-900/30 text-sakhi-700 dark:text-sakhi-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60',
                  ].join(' ')}
                >
                  <Icon size={17} className={color} />
                  <span className="truncate">{label}</span>
                  {highlight && (
                    <span className="ml-auto text-[9px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Bottom controls ── */}
        <div className="p-3 border-t border-white/20 dark:border-gray-700/40 space-y-2">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-gray-400 flex-shrink-0" />
            <select
              value={language}
              onChange={e => changeLanguage(e.target.value)}
              className="flex-1 text-xs bg-white/60 dark:bg-gray-700/60 border border-sakhi-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sakhi-400"
            >
              <option value="en">🇬🇧 English</option>
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="hinglish">🌐 Hinglish</option>
            </select>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors"
          >
            {darkMode ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-gray-400" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
