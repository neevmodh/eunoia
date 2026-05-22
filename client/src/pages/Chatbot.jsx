import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, RefreshCw, Trash2, Download } from 'lucide-react';
import ChatMessage from '../components/chatbot/ChatMessage';
import TypingIndicator from '../components/chatbot/TypingIndicator';
import QuickQuestions from '../components/chatbot/QuickQuestions';
import { useApp } from '../context/AppContext';

const MODES = [
  { id: 'chat', label: '💬 General', desc: 'Menstrual health Q&A' },
  { id: 'emotional', label: '💙 Emotional', desc: 'Emotional support' },
];

const Chatbot = () => {
  const { user, language } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: language === 'hi'
        ? 'नमस्ते! मैं SakhiCare हूँ। मैं आपकी मासिक धर्म स्वास्थ्य, स्वच्छता और भावनात्मक कल्याण के बारे में शैक्षिक जानकारी देने के लिए यहाँ हूँ। आप मुझसे कुछ भी पूछ सकती हैं! 🌸'
        : language === 'hinglish'
        ? 'Namaste! Main SakhiCare hoon. Main aapko menstrual health, hygiene aur emotional wellbeing ke baare mein educational information dene ke liye yahan hoon. Kuch bhi poochh sakte ho! 🌸'
        : 'Hello! I\'m SakhiCare, your safe and supportive menstrual health companion. I\'m here to provide educational information about periods, hygiene, nutrition, and emotional wellbeing. Feel free to ask me anything! 🌸\n\n⚠️ Remember: I provide educational support only, not medical advice.',
      timestamp: new Date().toISOString(),
      isEmergency: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await axios.post('/api/chat', {
        message: text.trim(),
        history,
        userId: user?.userId,
        language,
        mode
      });

      const aiMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date().toISOString(),
        isEmergency: res.data.isEmergency || false
      };

      setMessages(prev => [...prev, aiMessage]);

      if (res.data.isEmergency) {
        toast.error('⚠️ Please seek immediate help if needed.', { duration: 6000 });
      }
    } catch (err) {
      toast.error('Could not get a response. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again in a moment. 💙',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. How can I help you today? 🌸',
      timestamp: new Date().toISOString()
    }]);
  };

  const exportChat = () => {
    const text = messages.map(m =>
      `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}: ${m.content}`
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakhicare-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-h-[700px]">
      {/* Mode selector */}
      <div className="flex gap-2 mb-3">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
              mode === m.id
                ? 'bg-sakhi-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600 hover:bg-sakhi-50'
            }`}
          >
            <div>{m.label}</div>
            <div className="text-xs opacity-70">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-sakhi-100 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sakhi-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">SakhiCare AI</span>
            <span className="text-xs text-gray-400">• Educational only</span>
          </div>
          <div className="flex gap-1">
            <button onClick={exportChat} className="p-1.5 rounded-lg hover:bg-sakhi-50 dark:hover:bg-gray-700 text-gray-400 hover:text-sakhi-500 transition-colors" title="Export chat">
              <Download size={15} />
            </button>
            <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-sakhi-50 dark:hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors" title="Clear chat">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        <QuickQuestions onSelect={sendMessage} language={language} />

        {/* Input */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                language === 'hi' ? 'अपना सवाल यहाँ लिखें...' :
                language === 'hinglish' ? 'Apna sawaal yahan likhein...' :
                'Ask me anything about menstrual health...'
              }
              className="flex-1 input-field resize-none text-sm min-h-[44px] max-h-[120px]"
              rows={1}
              maxLength={1000}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 bg-sakhi-500 hover:bg-sakhi-600 disabled:bg-sakhi-200 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            Educational support only • Not medical advice • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
