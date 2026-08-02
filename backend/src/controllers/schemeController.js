/**
 * schemeController.js
 * Schemes browser operations: search, filter, sort, paginate, and view scheme details.
 */

const { Scheme } = require('../models');

/**
 * GET /api/schemes
 * Search & filter government schemes.
 * Query params: search, category, state, deadlineStatus, sortBy, page, limit
 */
const getSchemesHandler = async (req, res, next) => {
  try {
    const {
      search,
      category,
      state,
      deadlineStatus = 'all',
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Text search matching name, description, category, or supportedStates
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { supportedStates: searchRegex },
      ];
    }

    // Category filter
    if (category && category.trim() !== '' && category !== 'All') {
      query.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // State filter
    if (state && state.trim() !== '' && state !== 'All') {
      const stateRegex = new RegExp(state.trim(), 'i');
      query.$or = query.$or || [];
      query.supportedStates = { $in: [stateRegex, /^All$/i, /^Pan-India$/i] };
    }

    // Deadline status filter
    const now = new Date();
    if (deadlineStatus === 'active') {
      query.$or = query.$or || [];
      query.deadline = { $gte: now, $ne: null };
    } else if (deadlineStatus === 'expired') {
      query.deadline = { $lt: now };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'deadline') {
      sortOptions = { deadline: 1 };
    } else if (sortBy === 'relevance' || sortBy === 'updated') {
      sortOptions = { lastUpdated: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [schemes, total] = await Promise.all([
      Scheme.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Scheme.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: schemes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/schemes/:id
 * Fetch scheme details by scheme ID.
 */
const getSchemeByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scheme = await Scheme.findById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      scheme,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemesHandler,
  getSchemeByIdHandler,
};
