/**
 * ragService.js
 * Retrieval-Augmented Generation (RAG) Service for KrishiSahayak.
 * Queries matching schemes from MongoDB, constructs history & context, compiles RAG prompt, calls Gemini API, and persists ChatMessage records.
 */

const mongoose = require('mongoose');
const { Scheme, ChatMessage } = require('../models');
const geminiService = require('./geminiService');

/**
 * Checks if MongoDB connection is active.
 * @returns {boolean} True if connected.
 */
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Searches MongoDB for schemes relevant to the user query.
 * @param {string} userMessage - User's chat message.
 * @returns {Promise<Array>} Array of matching Scheme documents.
 */
async function queryMatchingSchemes(userMessage) {
  try {
    if (!isDbConnected()) {
      return [];
    }

    if (!userMessage || typeof userMessage !== 'string') {
      return await Scheme.find().limit(3).lean();
    }

    const stopWords = new Set(['what', 'is', 'the', 'for', 'how', 'to', 'can', 'i', 'get', 'apply', 'my', 'in', 'and', 'or', 'a', 'an', 'are', 'about', 'scheme', 'schemes']);
    const keywords = userMessage
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    let matchingSchemes = [];

    if (keywords.length > 0) {
      const regexPattern = keywords.map((k) => `(${k})`).join('|');
      matchingSchemes = await Scheme.find({
        $or: [
          { name: { $regex: regexPattern, $options: 'i' } },
          { description: { $regex: regexPattern, $options: 'i' } },
          { category: { $regex: regexPattern, $options: 'i' } },
          { cropTypes: { $regex: regexPattern, $options: 'i' } },
        ],
      })
        .limit(4)
        .lean();
    }

    if (matchingSchemes.length === 0) {
      matchingSchemes = await Scheme.find().limit(3).lean();
    }

    return matchingSchemes;
  } catch (error) {
    console.error('[ragService] Error querying schemes:', error.message);
    return [];
  }
}

/**
 * Formats matching schemes into a structured context block for the LLM prompt.
 * @param {Array} schemes - List of scheme objects.
 * @returns {string} Formatted context block string.
 */
function buildSchemeContext(schemes = []) {
  if (!schemes || schemes.length === 0) {
    return 'No specific government schemes matched directly in the database.';
  }

  return schemes
    .map((s, index) => {
      const benefitsStr = Array.isArray(s.benefits) ? s.benefits.join('; ') : 'N/A';
      const docsStr = Array.isArray(s.requiredDocuments) ? s.requiredDocuments.join(', ') : 'N/A';
      const rules = s.eligibilityRules || {};
      const landRange = `${rules.minLandSizeAcres || 0} to ${rules.maxLandSizeAcres !== null && rules.maxLandSizeAcres !== undefined ? rules.maxLandSizeAcres : 'unlimited'} acres`;

      return `Scheme #${index + 1}: ${s.name}
Category: ${s.category || 'General'}
Description: ${s.description || ''}
Key Benefits: ${benefitsStr}
Required Documents: ${docsStr}
Land Eligibility: ${landRange}
Supported States: ${Array.isArray(s.supportedStates) ? s.supportedStates.join(', ') : 'All India'}`;
    })
    .join('\n\n');
}

/**
 * Retrieves recent conversation history for a given conversation ID and user.
 * @param {string} userId - ID of user.
 * @param {string} conversationId - Conversation identifier string.
 * @param {number} limit - Number of recent messages to retrieve.
 * @returns {Promise<Array>} List of recent ChatMessage documents.
 */
async function getConversationHistory(userId, conversationId, limit = 6) {
  try {
    if (!isDbConnected() || !userId || !conversationId) return [];

    const messages = await ChatMessage.find({ userId, conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse();
  } catch (error) {
    console.error('[ragService] Error fetching chat history:', error.message);
    return [];
  }
}

/**
 * Compiles final prompt containing context block, conversation history, and user message.
 * @param {string} userMessage - Current user query.
 * @param {string} schemeContext - Formatted context block of relevant schemes.
 * @param {Array} history - Array of recent chat history messages.
 * @returns {string} Compiled prompt string.
 */
function compileRagPrompt(userMessage, schemeContext, history = []) {
  let historyStr = 'None';
  if (history && history.length > 0) {
    historyStr = history
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  return `--- RELEVANT GOVERNMENT SCHEMES CONTEXT ---
${schemeContext}

--- RECENT CONVERSATION HISTORY ---
${historyStr}

--- CURRENT USER QUERY ---
User: ${userMessage}

Please answer the user's query clearly, politely, and accurately based on the scheme context above.`;
}

/**
 * Generates dynamic suggested prompts based on user message and context.
 * @param {string} userMessage - User message.
 * @param {Array} schemes - Relevant schemes found.
 * @returns {Array<string>} List of suggested follow-up prompt strings.
 */
function generateSuggestedPrompts(userMessage, schemes = []) {
  if (schemes.length > 0) {
    const firstSchemeName = schemes[0].name;
    return [
      `What documents do I need for ${firstSchemeName}?`,
      `Am I eligible for ${firstSchemeName}?`,
      `How do I apply for ${firstSchemeName}?`,
    ];
  }

  return [
    'What schemes are available for small farmers?',
    'What documents are needed for PM-Kisan?',
    'How do I apply for a Kisan Credit Card?',
  ];
}

/**
 * Main function: Executes complete RAG workflow for a user chat query.
 * @param {object} params - { userId, message, conversationId }
 * @returns {Promise<object>} { reply, conversationId, suggestedPrompts, relevantSchemes }
 */
async function processChatQuery({ userId, message, conversationId }) {
  if (!message || !message.trim()) {
    throw new Error('Message content is required.');
  }

  const activeConvId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Query relevant schemes from DB
  const relevantSchemes = await queryMatchingSchemes(message);

  // 2. Format scheme context block
  const schemeContext = buildSchemeContext(relevantSchemes);

  // 3. Save user message to database if connected
  if (userId && isDbConnected()) {
    try {
      await ChatMessage.create({
        userId,
        conversationId: activeConvId,
        role: 'user',
        content: message.trim(),
      });
    } catch (e) {
      console.warn('[ragService] Could not save user message to DB:', e.message);
    }
  }

  // 4. Retrieve recent conversation history & farmer profile language
  const history = await getConversationHistory(userId, activeConvId, 6);
  
  let language = 'hi';
  if (userId && isDbConnected()) {
    try {
      const { FarmerProfile } = require('../models');
      const profile = await FarmerProfile.findOne({ userId }).select('language').lean();
      if (profile && profile.language) {
        language = profile.language;
      }
    } catch (err) {
      // fallback default language
    }
  }

  // 5. Compile prompt for Gemini API
  const prompt = compileRagPrompt(message, schemeContext, history);

  // 6. Generate response from Gemini API (or dev fallback) with farmer's language
  const reply = await geminiService.generateContent(prompt, { language });

  // 7. Save assistant reply to database if connected
  const schemeIds = relevantSchemes.map((s) => s._id).filter(Boolean);
  if (userId && isDbConnected()) {
    try {
      await ChatMessage.create({
        userId,
        conversationId: activeConvId,
        role: 'assistant',
        content: reply,
        relevantSchemes: schemeIds,
      });
    } catch (e) {
      console.warn('[ragService] Could not save assistant message to DB:', e.message);
    }
  }

  // 8. Generate follow-up suggestions
  const suggestedPrompts = generateSuggestedPrompts(message, relevantSchemes);

  return {
    reply,
    conversationId: activeConvId,
    suggestedPrompts,
    relevantSchemes,
  };
}

module.exports = {
  queryMatchingSchemes,
  buildSchemeContext,
  getConversationHistory,
  compileRagPrompt,
  generateSuggestedPrompts,
  processChatQuery,
};
