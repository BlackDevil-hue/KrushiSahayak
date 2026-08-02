/**
 * chatRoutes.js
 * Express router for Gemini AI RAG Chat system.
 */

const express = require('express');
const { body } = require('express-validator');
const { postChatHandler, getChatHistoryHandler } = require('../controllers/chatController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// Authenticate JWT for chat operations
router.use(authenticateJWT);

// POST /api/chat
router.post(
  '/',
  [body('message').notEmpty().withMessage('message is required.')],
  validate,
  postChatHandler
);

// GET /api/chat/history
router.get('/history', getChatHistoryHandler);

module.exports = router;
