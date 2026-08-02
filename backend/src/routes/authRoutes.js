/**
 * authRoutes.js
 * Express router for authentication endpoints.
 */

const express = require('express');
const { body } = require('express-validator');
const {
  sendOtpHandler,
  verifyOtpHandler,
  googleAuthHandler,
  logoutHandler,
  deleteAccountHandler,
} = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// POST /api/auth/send-otp
router.post(
  '/send-otp',
  [body('phone').notEmpty().withMessage('Phone number is required.')],
  validate,
  sendOtpHandler
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('phone').notEmpty().withMessage('Phone number is required.'),
    body('code').notEmpty().withMessage('Verification code is required.'),
  ],
  validate,
  verifyOtpHandler
);

// POST /api/auth/google
router.post(
  '/google',
  googleAuthHandler
);

// POST /api/auth/logout
router.post('/logout', authenticateJWT, logoutHandler);

// DELETE /api/auth/account
router.delete('/account', authenticateJWT, deleteAccountHandler);

module.exports = router;
