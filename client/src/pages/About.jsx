import React from 'react';
import { Heart, Shield, BookOpen, MessageCircle, AlertCircle } from 'lucide-react';

const About = () => (
  <div className="space-y-5 max-w-2xl">
    {/* Hero */}
    <div className="bg-gradient-to-br from-sakhi-400 to-purple-500 text-white rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">🌸</span>
        <div>
          <h1 className="text-2xl font-bold">SakhiCare</h1>
          <p className="text-sakhi-100 text-sm">Your Stigma-Free Wellness Companion</p>
        </div>
      </div>
      <p className="text-sakhi-100 text-sm leading-relaxed">
        SakhiCare is a safe, educational AI-powered platform designed for Indian adolescents to learn about 
        menstrual health, hygiene, emotional wellbeing, and self-care in a stigma-free, anonymous environment.
      </p>
    </div>

    {/* Mission */}
    <div className="card">
      <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Heart size={18} className="text-sakhi-500" /> Our Mission
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        We believe every adolescent deserves access to accurate, empathetic, and stigma-free information 
        about their bodies. SakhiCare bridges the gap between curiosity and knowledge, providing a safe 
        space to ask questions, track health, and learn — without judgment.
      </p>
    </div>

    {/* Features */}
    <div className="card">
      <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <BookOpen size={18} className="text-blue-500" /> What We Offer
      </h2>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {[
          '🤖 AI Chatbot for menstrual health Q&A (English, Hindi, Hinglish)',
          '📅 Cycle tracker with period prediction',
          '📊 AI-powered health insights from your data',
          '📚 Educational articles on hygiene, nutrition & wellness',
          '🔍 Myth vs Fact analyzer powered by AI',
          '💙 Emotional support with breathing exercises & journaling',
          '🔒 Completely anonymous — no personal data required',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5">{item.split(' ')[0]}</span>
            <span>{item.split(' ').slice(1).join(' ')}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Safety */}
    <div className="card border-sakhi-200 dark:border-sakhi-800 bg-sakhi-50 dark:bg-sakhi-900/10">
      <h2 className="font-semibold text-sakhi-700 dark:text-sakhi-300 mb-3 flex items-center gap-2">
        <Shield size={18} /> Safety & Privacy
      </h2>
      <ul className="space-y-1.5 text-sm text-sakhi-600 dark:text-sakhi-300">
        <li>✅ Completely anonymous — use any nickname</li>
        <li>✅ No personal data collection</li>
        <li>✅ AI responses are filtered for safety</li>
        <li>✅ Emergency resources shown for serious concerns</li>
        <li>✅ Educational only — never medical diagnosis</li>
      </ul>
    </div>

    {/* Disclaimer */}
    <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
      <h2 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
        <AlertCircle size={18} /> Important Disclaimer
      </h2>
      <p className="text-sm text-red-600 dark:text-red-300">
        <strong>This platform provides educational support only and is not a substitute for professional medical advice.</strong> 
        Always consult a qualified healthcare provider for medical concerns.
      </p>
    </div>

    {/* Emergency */}
    <div className="card border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
      <h2 className="font-semibold text-orange-700 dark:text-orange-400 mb-3">🆘 Emergency Helplines</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Medical Emergency (Ambulance)</span>
          <strong className="text-orange-700 dark:text-orange-400">108</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">iCall (Mental Health)</span>
          <strong className="text-orange-700 dark:text-orange-400">9152987821</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Vandrevala Foundation (24/7)</span>
          <strong className="text-orange-700 dark:text-orange-400">1860-2662-345</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">National Health Helpline</span>
          <strong className="text-orange-700 dark:text-orange-400">1800-180-1104</strong>
        </div>
      </div>
    </div>

    {/* Tech */}
    <div className="card">
      <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">⚙️ Technology</h2>
      <div className="flex flex-wrap gap-2">
        {['React', 'Tailwind CSS', 'Node.js', 'Express', 'Groq AI', 'Chart.js', 'CSV Storage'].map(tech => (
          <span key={tech} className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1">
            {tech}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default About;
