/**
 * checklistRoutes.js
 * Express router for Document Checklist backend APIs.
 */

const express = require('express');
const { getChecklistHandler, updateChecklistHandler } = require('../controllers/checklistController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Authenticate JWT for checklist routes
router.use(authenticateJWT);

// GET /api/checklists/:schemeId
router.get('/:schemeId', getChecklistHandler);

// PUT /api/checklists/:schemeId
router.put('/:schemeId', updateChecklistHandler);

module.exports = router;
