/**
 * authMiddleware.js
 * Verifies JWT token from Authorization header or cookie and attaches user payload to req.user.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'krishisahayak-secret-key-2026')) {
  throw new Error('FATAL: JWT_SECRET environment variable must be explicitly defined in production!');
}

const JWT_SECRET = process.env.JWT_SECRET || 'krishisahayak-secret-key-2026';

/**
 * Express middleware to authenticate JWT token.
 */
const authenticateJWT = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      const cookieMatch = req.headers.cookie.match(/token=([^;]+)/);
      if (cookieMatch) {
        token = cookieMatch[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Token missing from request.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Normalize user ID to both id and _id
    const userId = decoded.id || decoded._id || decoded.userId;

    // Retrieve user from DB if available, otherwise build payload
    let user = null;
    if (userId) {
      try {
        user = await User.findById(userId).lean();
      } catch (dbErr) {
        // Fallback to decoded payload if DB look-up fails in offline/mock context
      }
    }

    req.user = user
      ? { ...user, id: user._id.toString(), _id: user._id.toString() }
      : {
          id: userId || 'mock-user-id',
          _id: userId || 'mock-user-id',
          role: decoded.role || 'farmer',
          phone: decoded.phone,
          email: decoded.email,
        };

    next();
  } catch (error) {
    console.error('[authMiddleware] Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      error: error.message,
    });
  }
};

/**
 * Optional authentication middleware: attaches req.user if token is valid, but does not block request if missing.
 */
const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id || decoded._id || decoded.userId;
      if (userId) {
        try {
          const user = await User.findById(userId).lean();
          req.user = user
            ? { ...user, id: user._id.toString(), _id: user._id.toString() }
            : { id: userId, _id: userId, role: decoded.role || 'farmer' };
        } catch (e) {
          req.user = { id: userId, _id: userId, role: decoded.role || 'farmer' };
        }
      }
    }
  } catch (e) {
    // Ignore invalid tokens in optional auth
  }
  next();
};

module.exports = {
  authenticateJWT,
  optionalJWT,
  JWT_SECRET,
};
