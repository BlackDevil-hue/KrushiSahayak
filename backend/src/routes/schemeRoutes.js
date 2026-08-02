/**
 * schemeRoutes.js
 * Express router for scheme browsing and details.
 */

const express = require('express');
const { getSchemesHandler, getSchemeByIdHandler } = require('../controllers/schemeController');

const router = express.Router();

// GET /api/schemes
router.get('/', getSchemesHandler);

// GET /api/schemes/:id
router.get('/:id', getSchemeByIdHandler);

module.exports = router;
