/**
 * StatCard — animated stat display with icon, value, label, and optional trend
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ icon, value, label, color = 'sakhi', trend, trendLabel, onClick }) => {
  const colors = {
    sakhi:  { bg: 'bg-sakhi-50 dark:bg-sakhi-900/20',   text: 'text-sakhi-600 dark:text-sakhi-300',   border: 'border-sakhi-200 dark:border-sakhi-800' },
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600 dark:text-blue-300',     border: 'border-blue-200 dark:border-blue-800' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-600 dark:text-green-300',   border: 'border-green-200 dark:border-green-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-600 dark:text-red-300',       border: 'border-red-200 dark:border-red-800' },
  };
  const c = colors[color] || colors.sakhi;

  return (
    <div
      className={`card border ${c.border} ${c.bg} text-center flex flex-col items-center gap-1 py-4 ${onClick ? 'cursor-pointer hover:-translate-y-1 transition-transform duration-200' : ''}`}
      onClick={onClick}
    >
      <div className={`text-2xl mb-0.5`}>{icon}</div>
      <p className={`text-2xl font-display font-bold ${c.text}`}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${
          trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'
        }`}>
          {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
          {trendLabel || `${Math.abs(trend)}%`}
        </div>
      )}
    </div>
  );
};

export default StatCard;
