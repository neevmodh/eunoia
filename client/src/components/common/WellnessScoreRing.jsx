/**
 * WellnessScoreRing — Eunoia Platform
 * Animated circular progress ring showing wellness score
 */

import React from 'react';

const gradeColors = {
  Excellent: { stroke: '#22c55e', text: 'score-excellent', bg: 'bg-green-50 dark:bg-green-900/20' },
  Good:      { stroke: '#3b82f6', text: 'score-good',      bg: 'bg-blue-50 dark:bg-blue-900/20' },
  Fair:      { stroke: '#eab308', text: 'score-fair',      bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  'Needs Attention': { stroke: '#ef4444', text: 'score-poor', bg: 'bg-red-50 dark:bg-red-900/20' },
};

const WellnessScoreRing = ({ score = 0, grade = 'Fair', size = 120, showLabel = true }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = gradeColors[grade] || gradeColors['Fair'];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-100 dark:text-gray-700"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      {showLabel && (
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {grade}
        </span>
      )}
    </div>
  );
};

export default WellnessScoreRing;
