const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const checklistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    items: [checklistItemSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique checklist per user and scheme
checklistSchema.index({ userId: 1, schemeId: 1 }, { unique: true });

module.exports = mongoose.model('Checklist', checklistSchema);
