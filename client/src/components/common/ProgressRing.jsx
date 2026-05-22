/**
 * ProgressRing — thin SVG ring for small metric displays
 */
import React from 'react';

const ProgressRing = ({ value = 0, max = 100, size = 56, strokeWidth = 5, color = '#ff5b95', label, sublabel }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
            strokeWidth={strokeWidth} className="text-gray-100 dark:text-gray-700" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
        </svg>
        {label && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-none">{label}</span>
            {sublabel && <span className="text-[9px] text-gray-400">{sublabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
