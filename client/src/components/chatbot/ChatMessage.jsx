/**
 * ChatMessage — Eunoia Platform
 * Renders a single chat message with markdown-like formatting
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

/** Simple inline markdown renderer — bold, line breaks, bullet points */
const renderContent = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    return (
      <React.Fragment key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const ChatMessage = ({ message }) => {
  const isUser      = message.role === 'user';
  const isEmergency = message.isEmergency;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-slide-up`}>
      {/* AI avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sakhi-400 to-lavender-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-sm">
          <span className="text-sm">🌸</span>
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
        {isEmergency && (
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle size={13} className="text-red-500" />
            <span className="text-xs text-red-500 font-semibold">Emergency Alert</span>
          </div>
        )}

        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-gradient-to-br from-sakhi-500 to-sakhi-600 text-white rounded-br-sm shadow-sm'
            : isEmergency
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-bl-sm'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-card border border-sakhi-100/60 dark:border-gray-600 rounded-bl-sm'
          }
        `}>
          {renderContent(message.content)}
        </div>

        <p className="text-xs text-gray-400 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-sakhi-100 dark:bg-sakhi-900/40 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
