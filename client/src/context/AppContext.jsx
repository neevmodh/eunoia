/**
 * AppContext — Eunoia Platform
 * Global state: user session, dark mode, language, wellness tip, streak
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

const API_BASE = '/api';

// Attach JWT to all requests if available
const setAxiosAuth = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(null);
  const [darkMode, setDarkMode]       = useState(false);
  const [language, setLanguage]       = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wellnessTip, setWellnessTip] = useState('');

  // ── Restore session from localStorage ──────────────────────────────────────
  useEffect(() => {
    const savedUser  = localStorage.getItem('eunoia_user');
    const savedToken = localStorage.getItem('eunoia_token');
    const savedDark  = localStorage.getItem('eunoia_dark');
    const savedLang  = localStorage.getItem('eunoia_lang');

    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
    if (savedToken) {
      setToken(savedToken);
      setAxiosAuth(savedToken);
    }
    if (savedDark === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    if (savedLang) setLanguage(savedLang);
  }, []);

  // ── Dark mode effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('eunoia_dark', darkMode);
  }, [darkMode]);

  // ── Register / restore anonymous user ──────────────────────────────────────
  const loginUser = useCallback(async (username) => {
    try {
      const res = await axios.post(`${API_BASE}/users/register`, { username, language });
      const { user: newUser, token: newToken } = res.data;

      setUser(newUser);
      setToken(newToken);
      setAxiosAuth(newToken);

      localStorage.setItem('eunoia_user', JSON.stringify(newUser));
      localStorage.setItem('eunoia_token', newToken);

      toast.success(`Welcome, ${newUser.username}! 🌸`);
      return newUser;
    } catch {
      toast.error('Could not create profile. Please try again.');
      return null;
    }
  }, [language]);

  const logoutUser = useCallback(() => {
    setUser(null);
    setToken(null);
    setAxiosAuth(null);
    localStorage.removeItem('eunoia_user');
    localStorage.removeItem('eunoia_token');
    toast.success('Logged out successfully.');
  }, []);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('eunoia_lang', lang);
    if (user) {
      axios.put(`${API_BASE}/users/${user.userId}`, { language: lang }).catch(() => {});
    }
  }, [user]);

  const fetchWellnessTip = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/insights/tip`);
      setWellnessTip(res.data.tip);
    } catch {}
  }, []);

  // Update streak after logging cycle/symptoms
  const incrementStreak = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.post(`${API_BASE}/users/${user.userId}/streak`);
      const updated = { ...user, wellnessStreak: res.data.streak, totalPoints: res.data.totalPoints };
      setUser(updated);
      localStorage.setItem('eunoia_user', JSON.stringify(updated));
      if (res.data.milestone) {
        toast.success(res.data.milestone, { duration: 4000 });
      }
    } catch {}
  }, [user]);

  return (
    <AppContext.Provider value={{
      user, setUser, loginUser, logoutUser,
      token,
      darkMode, toggleDarkMode,
      language, changeLanguage,
      sidebarOpen, setSidebarOpen,
      wellnessTip, fetchWellnessTip,
      incrementStreak,
      API_BASE,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
