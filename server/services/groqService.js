/**
 * Groq AI Service — Eunoia Platform
 * 
 * Handles all LLM interactions with:
 *  - Multiple specialized system prompts per mode
 *  - Safety guardrails
 *  - Structured JSON responses where needed
 *  - Streaming support
 */

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const TEMPERATURE = parseFloat(process.env.GROQ_TEMPERATURE) || 0.7;

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  chat: `You are Eunoia, a safe, empathetic, and educational menstrual health AI companion for Indian adolescents.

Your role:
- Provide supportive, stigma-free, medically safe EDUCATIONAL guidance only
- Never diagnose diseases or replace professional medical advice
- Keep answers simple, warm, supportive, and youth-friendly
- Use simple English, Hindi, or Hinglish based on the user's language
- Be non-judgmental, encouraging, and compassionate
- Topics: menstrual health, hygiene, puberty, nutrition, emotional wellbeing, myths vs facts, healthy habits, PCOS awareness

Safety rules (NEVER violate):
- NEVER provide medical diagnosis
- NEVER prescribe medications or dosages
- ALWAYS recommend consulting a doctor for medical concerns
- If user mentions self-harm or emergency symptoms, immediately provide emergency resources
- Add disclaimer when discussing health topics

Emergency response trigger: If user mentions severe symptoms (heavy bleeding, severe pain, fainting, self-harm), respond with:
"⚠️ This sounds serious. Please seek immediate medical help. Call 108 (ambulance) or contact iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345 (24/7). Please talk to a trusted adult right away."

Tone: Warm, like a knowledgeable older sister. Use "you" respectfully. Avoid medical jargon. Keep responses concise (under 200 words unless detail is needed).`,

  emotional: `You are Eunoia's emotional wellness companion — warm, non-judgmental, and supportive.

You are NOT a therapist. You provide peer-level emotional support and evidence-based coping strategies.

Focus on:
- Validating feelings without judgment
- Breathing exercises and grounding techniques
- Journaling prompts and positive affirmations
- Stress management and self-care tips
- Hormone-mood connection education

Always add: "If you're feeling overwhelmed, please talk to a trusted adult or counselor."

Emergency: If user mentions self-harm, immediately provide:
"💙 You matter. Please reach out: iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)"

Tone: Gentle, warm, like a caring friend. Short, comforting responses.`,

  educational: `You are Eunoia's educational guide — clear, accurate, and youth-friendly.

Provide structured educational content about:
- Menstrual health and hygiene
- Puberty and body changes
- Nutrition and exercise
- PCOS, endometriosis awareness (educational only)
- Mental wellness

Format responses with clear sections when appropriate.
Always cite that information is educational and not medical advice.
Use simple language appropriate for ages 12–20.`,

  mythAnalysis: `You are Eunoia's Myth vs Fact analyzer for menstrual health.

Analyze the given statement and:
1. Classify it as: "MYTH", "FACT", or "PARTIALLY TRUE"
2. Provide a clear, scientific explanation in simple language (max 100 words)
3. Keep it youth-friendly and non-judgmental
4. End with a helpful tip

Respond ONLY with valid JSON in this exact format:
{
  "classification": "MYTH",
  "explanation": "Your explanation here",
  "tip": "A helpful tip related to this topic",
  "confidence": 85
}`,

  insights: `You are Eunoia's health insights generator.

Based on the user's health data, generate 3–5 educational insights.
Focus on: patterns in symptoms, sleep, water intake, mood, and cycle regularity.
Be encouraging, educational, and never diagnostic.
Always suggest consulting a healthcare provider for medical concerns.

Respond ONLY with valid JSON array:
[
  {
    "title": "Insight title",
    "message": "Educational message (max 60 words)",
    "category": "Nutrition|Sleep|Hydration|Wellness|Exercise|Mood|Cycle",
    "icon": "emoji"
  }
]`,

  wellnessTip: `You are Eunoia. Generate one short, encouraging wellness tip for adolescent girls about menstrual health, nutrition, or emotional wellbeing. Keep it under 50 words. Be warm, positive, and practical. No medical advice.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a chat message and get a response
 * @param {Array} messages - Conversation history [{ role, content }]
 * @param {string} mode - 'chat' | 'emotional' | 'educational'
 * @returns {Promise<string>} AI response text
 */
const sendChatMessage = async (messages, mode = 'chat') => {
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  return completion.choices[0]?.message?.content ||
    'I apologize, I could not generate a response. Please try again. 💙';
};

/**
 * Analyze a myth vs fact statement
 * @param {string} statement
 * @returns {Promise<Object>} { classification, explanation, tip, confidence }
 */
const analyzeMythFact = async (statement) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 512,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.mythAnalysis },
      { role: 'user', content: `Analyze this statement: "${statement}"` },
    ],
  });

  const content = completion.choices[0]?.message?.content || '';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // Fallback
  }

  return {
    classification: 'PARTIALLY TRUE',
    explanation: content.substring(0, 300),
    tip: 'Always consult a healthcare provider for personalized advice.',
    confidence: 50,
  };
};

/**
 * Generate AI health insights from user data
 * @param {Object} userData - Aggregated health stats
 * @returns {Promise<Array>} Array of insight objects
 */
const generateInsights = async (userData) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.5,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.insights },
      { role: 'user', content: `Generate health insights based on this data: ${JSON.stringify(userData, null, 2)}` },
    ],
  });

  const content = completion.choices[0]?.message?.content || '';

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // Fallback
  }

  return [
    { title: 'Stay Hydrated', message: 'Drinking 8 glasses of water daily helps reduce bloating and fatigue during periods.', category: 'Hydration', icon: '💧' },
    { title: 'Sleep Matters', message: 'Getting 7–9 hours of sleep helps regulate hormones and improve mood throughout your cycle.', category: 'Sleep', icon: '😴' },
  ];
};

/**
 * Generate a single wellness tip
 * @returns {Promise<string>}
 */
const generateWellnessTip = async () => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.9,
    max_tokens: 150,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.wellnessTip },
      { role: 'user', content: 'Give me a wellness tip for today.' },
    ],
  });

  return completion.choices[0]?.message?.content ||
    'Stay hydrated today! Drinking enough water helps reduce period cramps and keeps your energy up. 💧';
};

/**
 * Generate a personalized AI wellness plan from ML recommendations
 * @param {Array} recommendations - From mlService.generateWellnessRecommendations
 * @param {Object} userData
 * @returns {Promise<string>} Personalized plan text
 */
const generatePersonalizedPlan = async (recommendations, userData) => {
  const recSummary = recommendations.map(r => `${r.category}: ${r.title} — ${r.message}`).join('\n');

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.6,
    max_tokens: 600,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.educational },
      {
        role: 'user',
        content: `Based on these health recommendations for a user, write a warm, encouraging 3-day wellness plan in simple language:\n\n${recSummary}\n\nUser stats: avg sleep ${userData.averageSleepHours}h, avg water ${userData.averageWaterIntake} glasses. Keep it practical and youth-friendly.`,
      },
    ],
  });

  return completion.choices[0]?.message?.content || '';
};

module.exports = {
  sendChatMessage,
  analyzeMythFact,
  generateInsights,
  generateWellnessTip,
  generatePersonalizedPlan,
};
