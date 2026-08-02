/**
 * bookmarkController.js
 * Operations for user bookmarks: list, create, delete.
 */

const { Bookmark, Scheme } = require('../models');

/**
 * GET /api/bookmarks
 * Returns all saved/bookmarked schemes for the logged-in user.
 */
const getBookmarksHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const bookmarks = await Bookmark.find({ userId })
      .populate('schemeId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookmarks
 * Saves a scheme to user's bookmarks.
 * Body: { schemeId }
 */
const addBookmarkHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { schemeId } = req.body;

    if (!schemeId) {
      return res.status(400).json({
        success: false,
        message: 'schemeId is required in request body.',
      });
    }

    // Verify scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme with ID '${schemeId}' not found.`,
      });
    }

    // Upsert bookmark to prevent duplicate error
    const bookmark = await Bookmark.findOneAndUpdate(
      { userId, schemeId },
      { userId, schemeId },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Scheme bookmarked successfully.',
      bookmark,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/bookmarks/:schemeId
 * Removes a scheme from user's bookmarks.
 */
const removeBookmarkHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { schemeId } = req.params;

    const result = await Bookmark.findOneAndDelete({ userId, schemeId });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarksHandler,
  addBookmarkHandler,
  removeBookmarkHandler,
};
