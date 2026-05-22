/**
 * LoadingSpinner — Eunoia Platform
 * Reusable loading states: spinner, skeleton cards, full-screen overlay
 */

import React from 'react';

/** Animated spinner */
const Spinner = ({ size = 'md', color = 'sakhi' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = {
    sakhi: 'border-sakhi-500',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full border-2 border-transparent ${colors[color]} border-t-current animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};

/** Skeleton card placeholder */
export const SkeletonCard = ({ lines = 3 }) => (
  <div className="card space-y-3 animate-pulse">
    <div className="skeleton h-4 w-3/4 rounded" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} className={`skeleton h-3 rounded ${i === lines - 2 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);

/** Skeleton grid */
export const SkeletonGrid = ({ count = 4, cols = 2 }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} lines={3} />
    ))}
  </div>
);

/** Full-screen loading overlay */
const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <span className="text-4xl animate-float">🌸</span>
          </div>
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <Spinner size="md" />
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
};

export { Spinner };
export default LoadingSpinner;
