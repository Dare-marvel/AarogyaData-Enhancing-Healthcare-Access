// controllers/chatController.js
const axios = require('axios');

const model = require('../config/geminiConfig');

// Context for medical chat
const MEDICAL_CONTEXT = `
You are a helpful medical assistant chatbot. Your role is to:
- Provide general health information and guidance
- Answer common medical questions
- Explain medical terms in simple language
- Suggest when to seek professional medical help
- Always include a disclaimer about consulting healthcare professionals
- Never provide specific medical diagnosis or treatment recommendations
Format your responses using proper markdown:
- Use headings (##) for main points
- Use lists (* or 1.) for steps or multiple points
- Use **bold** for emphasis
- Use \`code\` for medical terms that need highlighting
- Use > for important notes or warnings
- Keep responses well-structured and easy to read
`;

// Chat history storage (in-memory for demo, use a database in production)
const chatHistory = new Map();

// Helper function to generate response
async function generateMedicalResponse(prompt, sessionId) {
  try {
    // Get existing chat history or create new
    let history = chatHistory.get(sessionId) || [];
    
    // Combine context, history, and new prompt
    const fullPrompt = `${MEDICAL_CONTEXT}\n\nChat History:\n${
      history.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    }\n\nUser: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    // Update chat history
    history = [
      ...history,
      { role: 'user', content: prompt },
      { role: 'assistant', content: response }
    ].slice(-10); // Keep last 10 messages
    chatHistory.set(sessionId, history);

    return {
      success: true,
      message: response,
      history: history
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      success: false,
      error: 'Failed to generate response'
    };
  }
}

// Controller for chat message processing
exports.chat = async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const response = await generateMedicalResponse(message, sessionId || 'default');
  res.json(response);
};

// Controller for fetching chat history
exports.getChatHistory = (req, res) => {
  const { sessionId } = req.params;
  const history = chatHistory.get(sessionId) || [];
  res.json({ history });
};
