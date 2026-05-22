/**
 * Layout — Eunoia Platform
 * Main app shell with sidebar, header, content area, and footer
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingChatButton from './FloatingChatButton';
import Disclaimer from './Disclaimer';
import { useApp } from '../../context/AppContext';

const Layout = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header />

        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          <Disclaimer />
          <div className="page-transition">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 px-4 text-xs text-gray-400 dark:text-gray-500 border-t border-white/20 dark:border-gray-700/40 glass-panel">
          <p className="font-medium">🌸 EUNOIA — Educational support only. Not a substitute for medical advice.</p>
          <p className="mt-1">
            Emergency: <strong className="text-red-500">108</strong> &nbsp;|&nbsp; Support: <strong className="text-blue-500">9152987821</strong>
          </p>
        </footer>
      </div>

      {/* Floating chat button */}
      <FloatingChatButton />
    </div>
  );
};

export default Layout;
