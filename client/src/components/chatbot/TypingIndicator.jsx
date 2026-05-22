import React from 'react';

const TypingIndicator = () => (
  <div className="flex justify-start mb-3 animate-fade-in">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sakhi-400 to-lavender-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-sm">
      <span className="text-sm">🌸</span>
    </div>
    <div className="chat-bubble-ai flex items-center gap-1.5 px-4 py-3">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  </div>
);

export default TypingIndicator;
