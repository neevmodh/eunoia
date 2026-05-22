/**
 * App — Eunoia Platform
 * Root component with lazy-loaded routes, global providers, and Garden context
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { GardenProvider } from './context/GardenContext';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-load all pages
const Home             = lazy(() => import('./pages/Home'));
const Chatbot          = lazy(() => import('./pages/Chatbot'));
const CycleTracker     = lazy(() => import('./pages/CycleTracker'));
const Insights         = lazy(() => import('./pages/Insights'));
const Predictions      = lazy(() => import('./pages/Predictions'));
const LearningHub      = lazy(() => import('./pages/LearningHub'));
const MythVsFact       = lazy(() => import('./pages/MythVsFact'));
const EmotionalSupport = lazy(() => import('./pages/EmotionalSupport'));
const Garden           = lazy(() => import('./pages/Garden'));
const About            = lazy(() => import('./pages/About'));
const Admin            = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <AppProvider>
      <GardenProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#374151',
              borderRadius: '14px',
              border: '1px solid #ffd8ea',
              fontSize: '13px',
              boxShadow: '0 4px 24px rgba(255,91,149,0.15)',
              padding: '10px 14px',
            },
            success: { iconTheme: { primary: '#ff5b95', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Suspense fallback={<LoadingSpinner fullScreen text="Loading Eunoia..." />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index              element={<Home />} />
              <Route path="chat"        element={<Chatbot />} />
              <Route path="tracker"     element={<CycleTracker />} />
              <Route path="insights"    element={<Insights />} />
              <Route path="predict"     element={<Predictions />} />
              <Route path="garden"      element={<Garden />} />
              <Route path="learn"       element={<LearningHub />} />
              <Route path="myths"       element={<MythVsFact />} />
              <Route path="emotional"   element={<EmotionalSupport />} />
              <Route path="about"       element={<About />} />
              <Route path="admin"       element={<Admin />} />
            </Route>
          </Routes>
        </Suspense>
      </GardenProvider>
    </AppProvider>
  );
}

export default App;
