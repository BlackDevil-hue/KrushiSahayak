/**
 * profileRoutes.js
 * Express router for farmer profile management.
 */

const express = require('express');
const { getProfileHandler, updateProfileHandler } = require('../controllers/profileController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/profile
router.get('/', authenticateJWT, getProfileHandler);

// PUT /api/profile
router.put('/', authenticateJWT, updateProfileHandler);

module.exports = router;
