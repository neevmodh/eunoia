import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on chat page
  if (location.pathname === '/chat') return null;

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-sakhi-500 to-sakhi-600 text-white rounded-full shadow-sakhi-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Open EUNOIA chat"
      title="Chat with EUNOIA"
    >
      <MessageCircle size={24} />
      <span className="absolute right-16 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with EUNOIA
      </span>
    </button>
  );
};

export default FloatingChatButton;
