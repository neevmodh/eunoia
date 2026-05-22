# 🌸 Eunoia v2.0 — AI-Powered Adolescent Wellness Platform

> ⚠️ **Disclaimer:** This platform provides educational support only and is not a substitute for professional medical advice.

**Eunoia** is a production-grade, AI-powered full-stack web application for Indian adolescents — providing stigma-free menstrual health education, emotional support, cycle tracking, and ML-powered health predictions in a beautiful, accessible interface.

---

## 🚀 What's New in v2.0

| Feature | Status |
|---|---|
| ML Prediction Engine (PCOS Risk, Cycle Analysis, Wellness Score) | ✅ New |
| AI Predictions Page with feature importance charts | ✅ New |
| Recharts replacing Chart.js (BarChart, AreaChart, PieChart, RadarChart) | ✅ New |
| Glassmorphism UI with gradient cards and animations | ✅ New |
| JWT-based anonymous authentication | ✅ New |
| Wellness streak & gamification points | ✅ New |
| WellnessScoreRing component | ✅ New |
| Skeleton loading states | ✅ New |
| Personalized AI wellness plan generation | ✅ New |
| Emotional distress scoring engine | ✅ New |
| AI Wellness Garden intelligence layer | ✅ New |
| Upgraded Groq service with 5 specialized system prompts | ✅ Upgraded |
| Upgraded Tailwind config with glassmorphism, animations, gradients | ✅ Upgraded |
| All existing features preserved and working | ✅ Preserved |

---

## 🏗️ Architecture

```
eunoia/
├── client/                          # React 18 + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   │   ├── Layout.jsx           # App shell (glassmorphism)
│       │   │   ├── Sidebar.jsx          # Nav with streak/points display
│       │   │   ├── Header.jsx           # Sticky glass header
│       │   │   ├── Disclaimer.jsx       # Dismissible medical disclaimer
│       │   │   ├── FloatingChatButton.jsx
│       │   │   ├── LoadingSpinner.jsx   # Spinner + Skeleton components
│       │   │   └── WellnessScoreRing.jsx # SVG circular progress ring
│       │   └── chatbot/
│       │       ├── ChatMessage.jsx      # Markdown-aware message renderer
│       │       ├── TypingIndicator.jsx
│       │       └── QuickQuestions.jsx
│       ├── pages/
│       │   ├── Home.jsx                 # Landing + wellness score + features
│       │   ├── Chatbot.jsx              # AI chat (general + emotional modes)
│       │   ├── CycleTracker.jsx         # Cycle logging + Recharts
│       │   ├── Insights.jsx             # AI insights + Recharts
│       │   ├── Predictions.jsx          # 🆕 PCOS risk + wellness analysis
│       │   ├── LearningHub.jsx          # Article library + bookmarks
│       │   ├── MythVsFact.jsx           # AI myth analyzer
│       │   ├── EmotionalSupport.jsx     # Support + breathing + journal
│       │   ├── About.jsx
│       │   └── Admin.jsx                # Admin dashboard
│       ├── context/
│       │   └── AppContext.jsx           # JWT auth + streak + language
│       ├── App.jsx                      # Routes (lazy-loaded)
│       └── index.css                    # Tailwind + glassmorphism styles
│
└── server/                          # Node.js + Express backend
    ├── controllers/
    │   ├── chatController.js            # AI chat + emergency detection
    │   ├── cycleController.js           # Cycle logging + prediction
    │   ├── educationController.js       # Articles + myth analyzer
    │   ├── insightsController.js        # AI insights generation
    │   ├── userController.js            # User + JWT + streak
    │   ├── adminController.js           # Admin stats + CSV management
    │   └── mlController.js             # 🆕 ML prediction endpoints
    ├── services/
    │   ├── groqService.js               # Groq AI (5 specialized prompts)
    │   └── mlService.js                # 🆕 ML engine (PCOS, cycle, wellness)
    ├── routes/
    │   ├── chatRoutes.js
    │   ├── cycleRoutes.js
    │   ├── educationRoutes.js
    │   ├── insightsRoutes.js
    │   ├── userRoutes.js
    │   ├── adminRoutes.js
    │   └── mlRoutes.js                 # 🆕 /api/ml/*
    │   └── gardenRoutes.js             # 🆕 /api/garden/:userId
    ├── middleware/
    │   ├── auth.js                      # JWT + admin password auth
    │   ├── rateLimiter.js               # Tiered rate limits
    │   └── sanitize.js                  # Input sanitization + injection detection
    ├── utils/
    │   └── csvHelper.js                 # CSV CRUD utilities
    ├── data/                            # Auto-created CSV files
    └── index.js                         # Server entry point
```

---

## 🧠 ML Prediction Engine

All ML models run in Node.js — no Python runtime required for deployment.

### PCOS Risk Prediction
- **Model type:** Weighted feature scoring (explainable AI)
- **Features:** 10 clinical indicators (cycle length, pain level, acne, excess hair growth, weight gain, fatigue, mood swings, sleep, water intake, irregular cycles)
- **Output:** Risk score (0–100), level (Low/Medium/High), feature importance chart, personalized recommendations
- **Endpoint:** `POST /api/ml/pcos-risk`

### Irregular Cycle Detection
- **Model type:** Statistical analysis (mean, standard deviation, outlier detection)
- **Input:** User's cycle history from CSV
- **Output:** Irregularity flag, confidence score, pattern descriptions, cycle stats
- **Endpoint:** `POST /api/ml/cycle-analysis`

### Emotional Distress Scoring
- **Model type:** Keyword-weighted NLP scoring
- **Features:** High/medium/low distress keywords, positive sentiment reduction
- **Output:** Distress level, score, detected signals, escalation flag
- **Endpoint:** `POST /api/ml/distress`

### Wellness Score
- **Model type:** Multi-factor weighted scoring
- **Factors:** Hydration (25%), Sleep (30%), Tracking consistency (25%), Pain management (20%)
- **Output:** Score (0–100), grade (Excellent/Good/Fair/Needs Attention), breakdown
- **Endpoint:** `GET /api/ml/score/:userId`

### Full Wellness Analysis
- Combines all ML models + AI-generated 3-day wellness plan
- **Endpoint:** `GET /api/ml/wellness/:userId`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 + custom glassmorphism |
| Routing | React Router v6 (lazy-loaded) |
| State | React Context API |
| Charts | **Recharts** (BarChart, AreaChart, PieChart, RadarChart) |
| Animations | Framer Motion + CSS keyframes |
| Icons | Lucide React |
| HTTP | Axios (with JWT interceptor) |
| Notifications | react-hot-toast |
| Backend | Node.js + Express |
| AI | Groq API (llama-3.3-70b-versatile) |
| ML | Pure JS weighted scoring models |
| Auth | JWT (jsonwebtoken) |
| Storage | CSV files (PapaParse) |
| Security | Helmet, express-rate-limit, input sanitization |

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
Edit `server/.env`:
```env
PORT=5001
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEMPERATURE=0.7
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### 3. Start backend
```bash
cd server && npm run dev
# → http://localhost:5001
```

### 4. Start frontend
```bash
cd client && npm run dev
# → http://localhost:3000
```

---

## 🔌 API Reference

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | AI chat (general/emotional mode) |
| GET | `/api/chat/history/:userId` | Chat history |

### Cycle
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cycle/log` | Log cycle entry |
| GET | `/api/cycle/:userId` | Get cycle data + prediction + phase |
| POST | `/api/cycle/symptom` | Log symptoms |
| GET | `/api/cycle/symptoms/:userId` | Get symptom logs |

### ML Predictions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ml/pcos-risk` | PCOS risk prediction |
| POST | `/api/ml/cycle-analysis` | Irregular cycle detection |
| POST | `/api/ml/distress` | Emotional distress scoring |
| GET | `/api/ml/wellness/:userId` | Full wellness analysis + AI plan |
| GET | `/api/ml/score/:userId` | Quick wellness score |

### Education
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/education` | Articles (filter/search) |
| GET | `/api/education/categories` | Article categories |
| GET | `/api/education/myths` | Myths/facts library |
| POST | `/api/education/myths/analyze` | AI myth analysis |

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register + get JWT |
| GET | `/api/users/:userId` | Get user |
| PUT | `/api/users/:userId` | Update user |
| POST | `/api/users/:userId/streak` | Increment streak |

### Insights
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/insights/:userId` | AI health insights |
| GET | `/api/insights/tip` | Daily wellness tip |

### AI Wellness Garden
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/garden/:userId` | Composite garden intelligence profile with zones, story beats, confidence, and recommendations |

### Admin (password protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform analytics |
| GET | `/api/admin/csv/:filename` | View CSV data |
| GET | `/api/admin/download/:filename` | Download CSV |
| POST | `/api/admin/content` | Add article |
| POST | `/api/admin/myth` | Add myth/fact |

---

## 🔒 Security

- **JWT authentication** — anonymous users get tokens on registration
- **Rate limiting** — 100/15min global, 20/min chat, 30/15min ML/admin
- **Helmet** — HTTP security headers
- **Input sanitization** — strips HTML/scripts, limits to 2000 chars
- **Prompt injection detection** — 11 blocked patterns
- **Emergency keyword detection** — self-harm + severe symptom triggers
- **Admin auth** — password-based header authentication
- **CORS** — restricted origins
- **Body size limit** — 10KB max

---

## 🎮 Gamification

- **Wellness Streak** — increments each time user logs cycle data
- **Points** — 10 pts per log, 50 pts bonus on 7-day streak milestones
- **Streak display** — shown in sidebar and home page hero
- **Wellness Score** — 0–100 score with grade (Excellent/Good/Fair/Needs Attention)

---

## 🆘 Emergency Helplines

| Service | Number |
|---|---|
| Medical Emergency | 108 |
| iCall (Mental Health) | 9152987821 |
| Vandrevala Foundation (24/7) | 1860-2662-345 |
| National Health Helpline | 1800-180-1104 |

---

## 🔮 Roadmap

- [ ] PostgreSQL + Prisma migration
- [ ] RAG pipeline with ChromaDB + LangChain
- [ ] Voice input/output
- [ ] Push notifications (period reminders)
- [ ] Doctor finder integration
- [ ] Tamil, Telugu, Bengali language support
- [ ] Docker + CI/CD pipeline
- [ ] Offline PWA support

---

*Built with 💙 for Indian adolescents — because every girl deserves safe, stigma-free health education.*
