/**
 * Eunoia Server — Main Entry Point
 * AI-Powered Adolescent Menstrual & Wellness Support Platform
 * 
 * Routes:
 *  /api/chat        — AI chatbot (Groq)
 *  /api/cycle       — Cycle tracker
 *  /api/education   — Learning hub + myth analyzer
 *  /api/users       — Anonymous user management
 *  /api/insights    — AI health insights
 *  /api/ml          — ML prediction engine (PCOS, cycle analysis, wellness)
 *  /api/admin       — Admin dashboard
 *  /api/health      — Health check
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { initAllCSVs } = require('./utils/csvHelper');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const chatRoutes = require('./routes/chatRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const educationRoutes = require('./routes/educationRoutes');
const userRoutes = require('./routes/userRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mlRoutes = require('./routes/mlRoutes');
const gardenRoutes = require('./routes/gardenRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Initialize CSV storage ───────────────────────────────────────────────────
initAllCSVs();

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Eunoia',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      ai: !!process.env.GROQ_API_KEY,
      storage: 'csv',
    },
    disclaimer: 'Educational support only. Not a substitute for professional medical advice.',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/garden', gardenRoutes);

// ─── Serve React frontend in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error. Please try again.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🌸  Eunoia Platform v2.0  🌸           ║
  ║   Port: ${PORT}  |  ${process.env.NODE_ENV || 'development'}              ║
  ║   AI: Groq ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}  ║
  ╚══════════════════════════════════════════╝
  
  ⚠️  Educational support only.
      Not a substitute for medical advice.
  `);
});

module.exports = app;
