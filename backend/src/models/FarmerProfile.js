const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    cropTypes: [
      {
        type: String,
        trim: true,
      },
    ],
    landSizeAcres: {
      type: Number,
      required: true,
      min: 0,
    },
    incomeBracket: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['General', 'SC', 'ST', 'OBC'],
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    age: {
      type: Number,
      min: 18,
      max: 120,
    },
    farmerType: {
      type: String,
      enum: ['marginal', 'smallholder', 'medium', 'large'],
      required: true,
    },
    language: {
      type: String,
      enum: ['mr', 'hi', 'en', 'gu', 'ta', 'te', 'kn'],
      default: 'hi',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
