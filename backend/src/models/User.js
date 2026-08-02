const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true },
    },
    googleId: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: { unique: true, sparse: true },
    },
    role: {
      type: String,
      enum: ['farmer', 'admin', 'officer'],
      default: 'farmer',
      required: true,
    },
    fcmToken: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
