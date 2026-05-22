/**
 * Chat Controller - Handles AI chatbot interactions
 */

const { v4: uuidv4 } = require('uuid');
const { sendChatMessage } = require('../services/groqService');
const { appendCSV, findCSV } = require('../utils/csvHelper');
const { checkEmergency, checkSevereSymptoms, checkPromptInjection } = require('../middleware/sanitize');

// Emergency response message
const EMERGENCY_RESPONSE = `⚠️ **Important: Please seek help immediately.**

If you are experiencing a medical emergency, call **108** (Ambulance) right away.

For emotional support:
- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345 (24/7 helpline)
- **NIMHANS**: 080-46110007

Please talk to a trusted adult, parent, teacher, or healthcare provider. You are not alone. 💙

*This platform provides educational support only and is not a substitute for professional medical advice.*`;

const SEVERE_SYMPTOM_RESPONSE = `⚠️ **Please consult a doctor soon.**

The symptoms you've described may need medical attention. Please:
1. Talk to a parent or trusted adult
2. Visit a doctor or healthcare provider
3. Call a health helpline if needed

**National Health Helpline**: 1800-180-1104 (Free, 24/7)

*This platform provides educational support only and is not a substitute for professional medical advice.*`;

/**
 * POST /api/chat
 * Main chat endpoint
 */
const chat = async (req, res) => {
  try {
    const { message, history = [], userId, language = 'en', mode = 'chat' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Check for prompt injection
    if (checkPromptInjection(message)) {
      return res.json({
        success: true,
        response: "I'm here to help with menstrual health education. Please ask me about periods, hygiene, nutrition, or emotional wellbeing! 😊",
        isEmergency: false
      });
    }

    // Check for emergency/self-harm keywords
    if (checkEmergency(message)) {
      // Still log the chat
      const chatId = uuidv4();
      if (userId) {
        appendCSV('chat_history.csv', {
          id: chatId,
          userId,
          role: 'user',
          message: message.substring(0, 500),
          language,
          timestamp: new Date().toISOString()
        });
        appendCSV('chat_history.csv', {
          id: uuidv4(),
          userId,
          role: 'assistant',
          message: 'Emergency response provided',
          language,
          timestamp: new Date().toISOString()
        });
      }
      return res.json({
        success: true,
        response: EMERGENCY_RESPONSE,
        isEmergency: true,
        emergencyType: 'self-harm'
      });
    }

    // Check for severe symptoms
    if (checkSevereSymptoms(message)) {
      return res.json({
        success: true,
        response: SEVERE_SYMPTOM_RESPONSE,
        isEmergency: true,
        emergencyType: 'severe-symptoms'
      });
    }

    // Build conversation history for Groq
    const conversationHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    conversationHistory.push({ role: 'user', content: message });

    // Get AI response
    const aiResponse = await sendChatMessage(conversationHistory, mode);

    // Save to CSV
    if (userId) {
      appendCSV('chat_history.csv', {
        id: uuidv4(),
        userId,
        role: 'user',
        message: message.substring(0, 500),
        language,
        timestamp: new Date().toISOString()
      });
      appendCSV('chat_history.csv', {
        id: uuidv4(),
        userId,
        role: 'assistant',
        message: aiResponse.substring(0, 1000),
        language,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      response: aiResponse,
      isEmergency: false
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to process your message. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/chat/history/:userId
 * Get chat history for a user
 */
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = findCSV('chat_history.csv', row => row.userId === userId);
    res.json({ success: true, history: history.slice(-50) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chat history.' });
  }
};

module.exports = { chat, getChatHistory };
