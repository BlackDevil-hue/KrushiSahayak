/**
 * profileController.js
 * Operations for viewing and updating farmer profile details.
 */

const { FarmerProfile, User } = require('../models');

/**
 * GET /api/profile
 * Retrieves logged-in farmer's profile and user account details.
 */
const getProfileHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const profile = await FarmerProfile.findOne({ userId });
    const user = await User.findById(userId).select('-__v');

    return res.status(200).json({
      success: true,
      profile: profile || null,
      user: user || req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile
 * Creates or updates the logged-in farmer's profile.
 */
const updateProfileHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const {
      name,
      phone,
      state,
      district,
      cropTypes,
      landSizeAcres,
      incomeBracket,
      category,
      gender,
      age,
      farmerType,
      language,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (state !== undefined) updateData.state = state;
    if (district !== undefined) updateData.district = district;
    if (cropTypes !== undefined) updateData.cropTypes = cropTypes;
    if (landSizeAcres !== undefined) updateData.landSizeAcres = Number(landSizeAcres);
    if (incomeBracket !== undefined) updateData.incomeBracket = incomeBracket;
    if (category !== undefined) updateData.category = category;
    if (gender !== undefined) updateData.gender = gender;
    if (age !== undefined) updateData.age = Number(age);
    if (farmerType !== undefined) updateData.farmerType = farmerType;
    if (language !== undefined) updateData.language = language;

    const profile = await FarmerProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileHandler,
  updateProfileHandler,
};
