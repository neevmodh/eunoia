/**
 * GardenCompanion — Emotionally intelligent AI companion spirit
 * Adapts its appearance, glow, and message to the user's wellness state.
 * Three companion spirits: Luna (butterfly), Sage (forest), Aurora (moon fairy)
 */

import React, { useState, useEffect } from 'react';
import { useGarden, COMPANIONS } from '../../context/GardenContext';
import { MessageCircle, X, ChevronRight } from 'lucide-react';

// Companion selector modal
const CompanionSelector = ({ onClose }) => {
  const { selectedCompanion, changeCompanion } = useGarden();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-5 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-bold text-gray-800 dark:text-gray-100">Choose Your Companion</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-3">
          {Object.values(COMPANIONS).map(c => (
            <button
              key={c.id}
              onClick={() => { changeCompanion(c.id); onClose(); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                selectedCompanion === c.id
                  ? 'border-sakhi-400 bg-sakhi-50 dark:bg-sakhi-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-sakhi-300'
              }`}
            >
              <span className="text-4xl">{c.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-gray-800 dark:text-gray-100">{c.name}</p>
                <p className="text-xs text-gray-400">{c.type}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                  "{c.messages.calm}"
                </p>
              </div>
              {selectedCompanion === c.id && (
                <span className="ml-auto text-sakhi-500 font-bold text-sm">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Companion ───────────────────────────────────────────────────────────
const GardenCompanion = ({ compact = false, showSelector = false }) => {
  const { gardenData, companionMessage, selectedCompanion } = useGarden();
  const { companion, score } = gardenData;
  const [bounce, setBounce] = useState(false);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [msgVisible, setMsgVisible] = useState(false);

  // Get the active companion data
  const activeCompanion = COMPANIONS[selectedCompanion?.toUpperCase()] || companion;

  useEffect(() => {
    if (companionMessage) {
      setBounce(true);
      setMsgVisible(true);
      const t1 = setTimeout(() => setBounce(false), 700);
      const t2 = setTimeout(() => setMsgVisible(false), 5500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [companionMessage]);

  // Glow intensity based on score
  const glowIntensity = score >= 70 ? '0 0 24px 8px' : score >= 45 ? '0 0 16px 4px' : '0 0 8px 2px';
  const glowColor = activeCompanion.color || companion.color || '#ff5b95';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`text-2xl select-none transition-all duration-300 ${bounce ? 'scale-125 rotate-12' : 'scale-100'} animate-float`}
          style={{ filter: `drop-shadow(${glowIntensity} ${glowColor}66)`, animationDuration: '3s' }}
        >
          {activeCompanion.emoji}
        </div>
        {msgVisible && companionMessage && (
          <div className="text-xs text-gray-600 dark:text-gray-300 italic max-w-[150px] leading-tight animate-fade-in bg-white/80 dark:bg-gray-700/80 px-2 py-1 rounded-xl backdrop-blur-sm">
            "{companionMessage}"
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 relative">
        {/* Speech bubble */}
        {msgVisible && companionMessage && (
          <div className="relative animate-scale-in max-w-[200px]">
            <div
              className="px-3 py-2 rounded-2xl rounded-bl-sm text-xs text-gray-700 dark:text-gray-200 text-center leading-snug shadow-lg border border-white/40 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.88)' }}
            >
              {companionMessage}
            </div>
            {/* Bubble tail */}
            <div className="absolute -bottom-1.5 left-5 w-3 h-3 rotate-45 border-r border-b border-white/40"
              style={{ background: 'rgba(255,255,255,0.88)' }} />
          </div>
        )}

        {/* Companion avatar */}
        <div className="relative cursor-pointer group" onClick={() => setShowSelectorModal(true)}>
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-soft pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
              transform: 'scale(2.2)',
            }}
          />

          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${glowColor}20 0%, transparent 60%)`,
              transform: 'scale(1.6)',
            }}
          />

          {/* Emoji */}
          <div
            className={`text-5xl select-none transition-all duration-500 relative z-10 ${bounce ? 'animate-wiggle' : 'animate-float'}`}
            style={{
              filter: `drop-shadow(${glowIntensity} ${glowColor}88)`,
              animationDuration: bounce ? '0.5s' : '3.5s',
            }}
          >
            {activeCompanion.emoji}
          </div>

          {/* Change hint */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={10} className="text-sakhi-500" />
          </div>
        </div>

        {/* Name + level badge */}
        <div
          className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${glowColor}, ${glowColor}bb)` }}
        >
          {activeCompanion.name} · {gardenData.level.emoji} {gardenData.level.name}
        </div>
      </div>

      {/* Companion selector modal */}
      {showSelectorModal && <CompanionSelector onClose={() => setShowSelectorModal(false)} />}
    </>
  );
};

export default GardenCompanion;
