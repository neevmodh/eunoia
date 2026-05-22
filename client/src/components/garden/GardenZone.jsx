/**
 * GardenZone — Individual zone card with animated plant health,
 * unlock states, zone-specific visuals, and interactive detail panel
 */

import React, { useState } from 'react';
import { Lock, Info } from 'lucide-react';

const HEALTH_STATES = [
  { min: 80, emoji: '🌺', label: 'Thriving',  color: '#22c55e', glow: 'rgba(34,197,94,0.45)',  bg: 'rgba(34,197,94,0.08)' },
  { min: 60, emoji: '🌸', label: 'Blooming',  color: '#ff5b95', glow: 'rgba(255,91,149,0.35)', bg: 'rgba(255,91,149,0.06)' },
  { min: 40, emoji: '🌿', label: 'Growing',   color: '#86efac', glow: 'rgba(134,239,172,0.35)',bg: 'rgba(134,239,172,0.06)' },
  { min: 20, emoji: '🌱', label: 'Sprouting', color: '#fbbf24', glow: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.06)' },
  { min: 0,  emoji: '🥀', label: 'Resting',   color: '#94a3b8', glow: 'rgba(148,163,184,0.2)', bg: 'rgba(148,163,184,0.04)' },
];

const getHealthState = (health) =>
  HEALTH_STATES.find(s => health >= s.min) || HEALTH_STATES[HEALTH_STATES.length - 1];

const GardenZone = ({ zone, health = 0, unlocked = true, onClick, selected = false }) => {
  const state = getHealthState(health);
  const [hovered, setHovered] = useState(false);

  if (!unlocked) {
    return (
      <div className="relative rounded-2xl p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-800/40 flex flex-col items-center gap-2 text-center">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Lock size={16} className="text-gray-400" />
        </div>
        <span className="text-2xl grayscale opacity-50">{zone.emoji}</span>
        <div>
          <p className="text-xs font-semibold text-gray-400">{zone.name}</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">Level {zone.unlockLevel} to unlock</p>
        </div>
        {/* Lock shimmer */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl p-4 border transition-all duration-300 cursor-pointer overflow-hidden ${
        selected
          ? 'border-sakhi-400 dark:border-sakhi-600 scale-[1.02]'
          : 'border-white/30 dark:border-gray-700/40 hover:-translate-y-1'
      }`}
      style={{
        background: `linear-gradient(135deg, ${state.bg}, rgba(255,255,255,0.55))`,
        backdropFilter: 'blur(10px)',
        boxShadow: hovered || selected
          ? `0 8px 28px ${state.glow}, 0 2px 8px rgba(0,0,0,0.08)`
          : `0 2px 12px rgba(0,0,0,0.06)`,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shimmer on high health */}
      {health >= 75 && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 2.5s infinite',
            }} />
        </div>
      )}

      <div className="flex flex-col items-center gap-2 relative z-10">
        {/* Animated plant */}
        <div className="relative">
          <div
            className="text-3xl select-none animate-plant-sway"
            style={{
              filter: `drop-shadow(0 0 10px ${state.glow})`,
              animationDuration: `${2.5 + Math.random() * 2}s`,
            }}
          >
            {state.emoji}
          </div>
          {/* Zone emoji badge */}
          <div className="absolute -bottom-1 -right-1 text-sm select-none">{zone.emoji}</div>
        </div>

        {/* Health bar */}
        <div className="w-full bg-white/30 dark:bg-gray-700/40 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${health}%`,
              background: `linear-gradient(90deg, ${state.color}cc, ${state.color})`,
            }}
          />
        </div>

        {/* Labels */}
        <div className="text-center w-full">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight">{zone.name}</p>
          <p className="text-xs font-medium" style={{ color: state.color }}>{state.label}</p>
        </div>

        {/* Health percentage */}
        <div
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${state.color}22`, color: state.color }}
        >
          {Math.round(health)}%
        </div>
      </div>
    </div>
  );
};

export default GardenZone;
