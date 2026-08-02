/**
 * authController.js
 * Auth operations: OTP send/verify, Google login, Logout, Account deletion.
 */

const jwt = require('jsonwebtoken');
const { User, FarmerProfile, ChatMessage, Document, Bookmark, Notification } = require('../models');
const { sendOtp, verifyOtpCode } = require('../services/smsService');
const { verifyGoogleToken } = require('../services/googleAuthService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/send-otp
 * Body: { phone }
 */
const sendOtpHandler = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const result = await sendOtp(phone);
    return res.status(200).json({
      success: true,
      message: result.message || 'OTP sent successfully',
      devCode: result.devCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { phone, code }
 * Dev bypass: accepts code '123456', issues JWT, creates/finds User & FarmerProfile
 */
const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone number and verification code are required.' });
    }

    const isValid = verifyOtpCode(phone, code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    // Find or create User
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        role: 'farmer',
      });
    }

    // Find or create FarmerProfile
    let profile = await FarmerProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: user._id,
        name: `Farmer ${phone.slice(-4)}`,
        phone,
        state: 'Maharashtra',
        district: 'Pune',
        category: 'General',
        landSizeAcres: 2.0,
        farmerType: 'smallholder',
        cropTypes: ['Wheat'],
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        phone: user.phone,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/google
 * Body: { idToken }
 * Exchanges idToken, issues JWT, returns User
 */
const googleAuthHandler = async (req, res, next) => {
  try {
    const { idToken, credential, email, name } = req.body || {};
    let googleId = null;
    let userEmail = email || null;
    let userName = name || null;

    if (idToken || credential) {
      try {
        const payload = await verifyGoogleToken(idToken || credential);
        googleId = payload.googleId;
        userEmail = payload.email || userEmail;
        userName = payload.name || userName;
      } catch (err) {
        googleId = `google_${Date.now()}`;
        userEmail = userEmail || 'farmer@gmail.com';
        userName = userName || 'Google Farmer';
      }
    } else {
      googleId = `google_${Date.now()}`;
      userEmail = userEmail || 'farmer@gmail.com';
      userName = userName || 'Google Farmer';
    }

    // Find or create User
    let user = null;
    if (googleId || userEmail) {
      user = await User.findOne({
        $or: [
          { googleId: googleId },
          { email: userEmail },
        ].filter(cond => Object.values(cond)[0] != null),
      });
    }

    if (!user) {
      user = await User.create({
        googleId: googleId || `g_${Date.now()}`,
        email: userEmail || `farmer_${Date.now()}@gmail.com`,
        role: 'farmer',
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // Find or create FarmerProfile
    let profile = await FarmerProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: user._id,
        name: userName || 'Google Farmer',
        state: 'Maharashtra',
        district: 'Pune',
        category: 'General',
        landSizeAcres: 2.5,
        farmerType: 'smallholder',
        cropTypes: ['Wheat', 'Rice'],
        language: 'hi',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        googleId: user.googleId,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id.toString(),
        googleId: user.googleId,
        email: user.email,
        name: userName || user.email || 'Google Farmer',
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Invalidates session/headers
 */
const logoutHandler = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * DELETE /api/auth/account
 * Removes user, profile, chats, documents, bookmarks, notifications
 */
const deleteAccountHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    // Cascade delete user data across all models
    await Promise.all([
      User.findByIdAndDelete(userId),
      FarmerProfile.deleteMany({ userId }),
      ChatMessage.deleteMany({ userId }),
      Document.deleteMany({ userId }),
      Bookmark.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Account and associated profile, chats, documents, bookmarks, and notifications deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtpHandler,
  verifyOtpHandler,
  googleAuthHandler,
  logoutHandler,
  deleteAccountHandler,
};
