const mongoose = require('mongoose');

const eligibilityRulesSchema = new mongoose.Schema(
  {
    minLandSizeAcres: { type: Number, default: 0 },
    maxLandSizeAcres: { type: Number, default: null },
    allowedCategories: [{ type: String, enum: ['General', 'SC', 'ST', 'OBC'] }],
    allowedFarmerTypes: [{ type: String, enum: ['marginal', 'smallholder', 'medium', 'large'] }],
    maxIncomeLimit: { type: Number, default: null },
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: null },
    genderPreference: { type: String, enum: ['All', 'Male', 'Female'], default: 'All' },
    cropTypes: [{ type: String }],
    additionalCriteria: [{ type: String }],
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    eligibilityRules: {
      type: eligibilityRulesSchema,
      required: true,
      default: {},
    },
    requiredDocuments: [
      {
        type: String,
        trim: true,
      },
    ],
    deadline: {
      type: Date,
      default: null,
    },
    applicationUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    supportedStates: [
      {
        type: String,
        trim: true,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scheme', schemeSchema);
