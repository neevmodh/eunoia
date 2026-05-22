/**
 * EmptyState — consistent empty/zero-data placeholder
 */
import React from 'react';

const EmptyState = ({ icon, title, description, action, actionLabel }) => (
  <div className="empty-state">
    <div className="text-5xl animate-float">{icon || '🌸'}</div>
    <div>
      <p className="font-display font-semibold text-gray-700 dark:text-gray-200 text-base">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto text-center">{description}</p>}
    </div>
    {action && (
      <button onClick={action} className="btn-primary text-sm mt-1">
        {actionLabel || 'Get Started'}
      </button>
    )}
  </div>
);

export default EmptyState;
