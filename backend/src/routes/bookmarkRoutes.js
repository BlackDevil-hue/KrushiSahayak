/**
 * bookmarkRoutes.js
 * Express router for user bookmarks management.
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getBookmarksHandler,
  addBookmarkHandler,
  removeBookmarkHandler,
} = require('../controllers/bookmarkController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply auth middleware to all bookmark routes
router.use(authenticateJWT);

// GET /api/bookmarks
router.get('/', getBookmarksHandler);

// POST /api/bookmarks
router.post(
  '/',
  [body('schemeId').notEmpty().withMessage('schemeId is required.')],
  validate,
  addBookmarkHandler
);

// DELETE /api/bookmarks/:schemeId
router.delete('/:schemeId', removeBookmarkHandler);

module.exports = router;
