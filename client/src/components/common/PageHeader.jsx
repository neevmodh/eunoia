/**
 * PageHeader — reusable gradient page header with icon, title, subtitle, and optional action
 */
import React from 'react';

const gradients = {
  pink:   'from-sakhi-400 via-sakhi-500 to-lavender-500',
  purple: 'from-violet-400 via-purple-500 to-sakhi-500',
  blue:   'from-blue-400 via-cyan-500 to-teal-400',
  green:  'from-green-400 via-emerald-500 to-teal-400',
  orange: 'from-orange-400 via-amber-500 to-yellow-400',
  red:    'from-red-400 via-pink-500 to-sakhi-400',
};

const PageHeader = ({ icon, title, subtitle, gradient = 'pink', action, badge }) => {
  const grad = gradients[gradient] || gradients.pink;
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${grad} p-5 text-white shadow-sakhi mb-5`}>
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10 blur-lg pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold leading-tight">{title}</h1>
              {badge && (
                <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full font-medium">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-white/75 text-xs mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
