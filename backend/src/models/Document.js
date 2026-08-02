const mongoose = require('mongoose');

const documentSummarySchema = new mongoose.Schema(
  {
    benefits: [{ type: String }],
    eligibility: [{ type: String }],
    requiredDocuments: [{ type: String }],
    deadlines: [{ type: String }],
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    summary: {
      type: documentSummarySchema,
      default: () => ({
        benefits: [],
        eligibility: [],
        requiredDocuments: [],
        deadlines: [],
      }),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
