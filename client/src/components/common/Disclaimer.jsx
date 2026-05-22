import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const Disclaimer = () => {
  const [visible, setVisible] = useState(() => {
    return !localStorage.getItem('sakhicare_disclaimer_dismissed');
  });

  if (!visible) return null;

  return (
    <div className="mb-4 bg-sakhi-50 dark:bg-sakhi-900/20 border border-sakhi-200 dark:border-sakhi-800 rounded-xl p-3 flex items-start gap-3 animate-fade-in">
      <AlertCircle size={16} className="text-sakhi-500 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-sakhi-700 dark:text-sakhi-300 flex-1">
        <strong>Disclaimer:</strong> This platform provides educational support only and is not a substitute for professional medical advice. 
        For medical concerns, please consult a healthcare provider.
      </p>
      <button
        onClick={() => {
          setVisible(false);
          localStorage.setItem('sakhicare_disclaimer_dismissed', 'true');
        }}
        className="text-sakhi-400 hover:text-sakhi-600 flex-shrink-0"
        aria-label="Dismiss disclaimer"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Disclaimer;
