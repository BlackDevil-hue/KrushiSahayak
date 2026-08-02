/**
 * eligibilityRoutes.js
 * Express router for scheme eligibility checks and recommendations.
 */

const express = require('express');
const { checkEligibilityHandler, getRecommendationsHandler } = require('../controllers/eligibilityController');
const { authenticateJWT, optionalJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/eligibility/check (supports optional JWT if profile not explicitly sent in body)
router.post('/check', optionalJWT, checkEligibilityHandler);

// GET /api/eligibility/recommendations (requires authentication)
router.get('/recommendations', authenticateJWT, getRecommendationsHandler);

module.exports = router;
