/**
 * checklistController.js
 * Controller for Document Checklist management per user and scheme.
 */

const { Checklist, Scheme } = require('../models');

/**
 * Calculates completion percentage for a checklist.
 * @param {Array} items - List of checklist items.
 * @returns {number} Completion percentage (0 to 100).
 */
function calculateCompletionPercentage(items = []) {
  if (!items || items.length === 0) return 0;
  const completedCount = items.filter((item) => item.completed).length;
  return Math.round((completedCount / items.length) * 100);
}

/**
 * GET /api/checklists/:schemeId
 * Auto-generates checklist from scheme's requiredDocuments if not existing, returns items and completion percentage.
 */
const getChecklistHandler = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const { schemeId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access checklist.',
      });
    }

    let checklist = await Checklist.findOne({ userId, schemeId });

    if (!checklist) {
      // Find scheme to extract required documents
      const scheme = await Scheme.findById(schemeId);
      if (!scheme) {
        return res.status(404).json({
          success: false,
          message: `Scheme with ID '${schemeId}' not found.`,
        });
      }

      const requiredDocs = Array.isArray(scheme.requiredDocuments) && scheme.requiredDocuments.length > 0
        ? scheme.requiredDocuments
        : ['Aadhaar Card', 'Land Ownership Records', 'Bank Account Passbook'];

      const items = requiredDocs.map((docName) => ({
        documentName: docName,
        completed: false,
      }));

      checklist = await Checklist.create({
        userId,
        schemeId,
        items,
      });
    }

    const completionPercentage = calculateCompletionPercentage(checklist.items);

    return res.status(200).json({
      success: true,
      checklist,
      items: checklist.items,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/checklists/:schemeId
 * Updates item completed status ({ itemIndex, itemId, documentName, completed }), recalculates percentage, and returns updated checklist.
 */
const updateChecklistHandler = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const { schemeId } = req.params;
    const { itemIndex, itemId, documentName, completed } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to update checklist.',
      });
    }

    let checklist = await Checklist.findOne({ userId, schemeId });

    if (!checklist) {
      const scheme = await Scheme.findById(schemeId);
      if (!scheme) {
        return res.status(404).json({
          success: false,
          message: `Scheme with ID '${schemeId}' not found.`,
        });
      }

      const requiredDocs = Array.isArray(scheme.requiredDocuments) && scheme.requiredDocuments.length > 0
        ? scheme.requiredDocuments
        : ['Aadhaar Card', 'Land Ownership Records', 'Bank Account Passbook'];

      const items = requiredDocs.map((docName) => ({
        documentName: docName,
        completed: false,
      }));

      checklist = await Checklist.create({
        userId,
        schemeId,
        items,
      });
    }

    const isCompleted = Boolean(completed);

    // Identify target item by index, id, or name
    let itemFound = false;

    if (typeof itemIndex === 'number' && itemIndex >= 0 && itemIndex < checklist.items.length) {
      checklist.items[itemIndex].completed = isCompleted;
      itemFound = true;
    } else if (itemId) {
      const targetItem = checklist.items.id(itemId) || checklist.items.find((i) => String(i._id) === String(itemId));
      if (targetItem) {
        targetItem.completed = isCompleted;
        itemFound = true;
      }
    } else if (documentName) {
      const targetItem = checklist.items.find((i) => i.documentName.toLowerCase() === String(documentName).toLowerCase());
      if (targetItem) {
        targetItem.completed = isCompleted;
        itemFound = true;
      }
    }

    if (!itemFound && checklist.items.length > 0) {
      // Default to updating first item if no specific identifier matched but request body had completed flag
      checklist.items[0].completed = isCompleted;
    }

    await checklist.save();

    const completionPercentage = calculateCompletionPercentage(checklist.items);

    return res.status(200).json({
      success: true,
      message: 'Checklist item updated successfully.',
      checklist,
      items: checklist.items,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChecklistHandler,
  updateChecklistHandler,
  calculateCompletionPercentage,
};
