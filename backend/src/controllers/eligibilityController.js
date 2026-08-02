/**
 * eligibilityController.js
 * Operations for checking scheme eligibility and retrieving personalized scheme recommendations.
 */

const { Scheme, FarmerProfile } = require('../models');
const { evaluateEligibility } = require('../services/eligibilityEngine');

/**
 * POST /api/eligibility/check
 * Evaluates eligibility for a specific scheme against a provided profile or authenticated user profile.
 * Body: { schemeId, profile?: Object }
 */
const checkEligibilityHandler = async (req, res, next) => {
  try {
    const { schemeId, profile: bodyProfile } = req.body;

    if (!schemeId) {
      return res.status(400).json({
        success: false,
        message: 'schemeId parameter is required in request body.',
      });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme with ID '${schemeId}' not found.`,
      });
    }

    let farmerProfile = bodyProfile;

    // Fallback to authenticated user's profile if not provided in body
    if (!farmerProfile && req.user) {
      const userId = req.user.id || req.user._id;
      farmerProfile = await FarmerProfile.findOne({ userId });
    }

    if (!farmerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile must be provided in request body or associated with authenticated user account.',
      });
    }

    const evaluation = evaluateEligibility(farmerProfile, scheme);

    return res.status(200).json({
      success: true,
      schemeId: scheme._id.toString(),
      schemeName: scheme.name,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/eligibility/recommendations
 * Evaluates all available schemes against the logged-in farmer profile and returns recommendations sorted by match score.
 */
const getRecommendationsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const farmerProfile = await FarmerProfile.findOne({ userId });

    if (!farmerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile is required to calculate scheme recommendations. Please complete your profile first.',
      });
    }

    const schemes = await Scheme.find({});
    if (!schemes || schemes.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        recommendations: [],
      });
    }

    const recommendations = schemes
      .map((scheme) => {
        const evaluation = evaluateEligibility(farmerProfile, scheme);
        return {
          scheme: {
            _id: scheme._id,
            name: scheme.name,
            description: scheme.description,
            category: scheme.category,
            benefits: scheme.benefits,
            deadline: scheme.deadline,
            applicationUrl: scheme.applicationUrl,
            supportedStates: scheme.supportedStates,
          },
          evaluation,
        };
      })
      .sort((a, b) => b.evaluation.score - a.evaluation.score);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkEligibilityHandler,
  getRecommendationsHandler,
};
