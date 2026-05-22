/**
 * TabBar — reusable pill-style tab bar
 */
import React from 'react';

const TabBar = ({ tabs, active, onChange, fullWidth = true }) => (
  <div className={`flex gap-2 ${fullWidth ? '' : 'overflow-x-auto scrollbar-hide pb-0.5'}`}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`${fullWidth ? 'flex-1' : 'flex-shrink-0'} py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
          active === tab.id
            ? 'bg-sakhi-500 text-white shadow-sm'
            : 'bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600 hover:bg-sakhi-50 dark:hover:bg-gray-600'
        }`}
      >
        {tab.icon && <span>{tab.icon}</span>}
        <span>{tab.label}</span>
        {tab.badge && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            active === tab.id ? 'bg-white/20 text-white' : 'bg-sakhi-100 text-sakhi-600 dark:bg-sakhi-900/30 dark:text-sakhi-300'
          }`}>
            {tab.badge}
          </span>
        )}
      </button>
    ))}
  </div>
);

export default TabBar;
