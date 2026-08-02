/**
 * chatController.js
 * Controller for Gemini AI RAG Chat system.
 */

const ragService = require('../services/ragService');
const { ChatMessage } = require('../models');

/**
 * POST /api/chat
 * Accepts { message, conversationId }, runs RAG chat service, saves chat history, and returns response.
 */
const postChatHandler = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'message field is required in request body.',
      });
    }

    const result = await ragService.processChatQuery({
      userId,
      message: message.trim(),
      conversationId,
    });

    return res.status(200).json({
      success: true,
      reply: result.reply,
      conversationId: result.conversationId,
      suggestedPrompts: result.suggestedPrompts,
      relevantSchemes: result.relevantSchemes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/history
 * Returns user's chat conversation history.
 */
const getChatHistoryHandler = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const { conversationId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view chat history.',
      });
    }

    const filter = { userId };
    if (conversationId) {
      filter.conversationId = conversationId;
    }

    const history = await ChatMessage.find(filter)
      .populate('relevantSchemes', 'name category')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
      messages: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postChatHandler,
  getChatHistoryHandler,
};
