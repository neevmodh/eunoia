/**
 * MoodPicker — reusable emoji mood selector with animated selection
 */
import React from 'react';

const MOODS = [
  { emoji: '😊', label: 'Happy',    color: 'text-yellow-500' },
  { emoji: '😐', label: 'Neutral',  color: 'text-gray-500' },
  { emoji: '😔', label: 'Sad',      color: 'text-blue-500' },
  { emoji: '😤', label: 'Irritable',color: 'text-red-500' },
  { emoji: '😰', label: 'Anxious',  color: 'text-purple-500' },
  { emoji: '😴', label: 'Tired',    color: 'text-indigo-400' },
  { emoji: '🤗', label: 'Grateful', color: 'text-green-500' },
  { emoji: '🤩', label: 'Energetic',color: 'text-orange-500' },
];

const MoodPicker = ({ value, onChange, size = 'md' }) => {
  const isLg = size === 'lg';
  return (
    <div className={`flex flex-wrap gap-2 ${isLg ? '' : ''}`}>
      {MOODS.map(m => (
        <button
          key={m.label}
          type="button"
          onClick={() => onChange(m.label === value ? '' : m.label)}
          className={`mood-btn ${value === m.label ? 'mood-btn-active' : 'mood-btn-inactive'} ${isLg ? 'min-w-[64px]' : 'min-w-[52px]'}`}
          title={m.label}
        >
          <span className={isLg ? 'text-2xl' : 'text-xl'}>{m.emoji}</span>
          <span className={`${isLg ? 'text-xs' : 'text-[10px]'} font-medium ${value === m.label ? 'text-sakhi-600 dark:text-sakhi-300' : 'text-gray-500 dark:text-gray-400'}`}>
            {m.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export { MOODS };
export default MoodPicker;
