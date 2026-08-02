/**
 * notificationController.js
 * Operations for user notifications: listing and marking read.
 */

const { Notification } = require('../models');

/**
 * GET /api/notifications
 * Returns list of notifications for authenticated user sorted newest first.
 */
const getNotificationsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Marks a specific notification as read.
 */
const markNotificationReadHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: `Notification with ID '${id}' not found for user.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications/fcm-token
 * Registers or updates FCM Push token for the authenticated user.
 */
const registerFcmTokenHandler = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { fcmToken } = req.body;
    const { User } = require('../models');

    if (fcmToken) {
      await User.findByIdAndUpdate(userId, { fcmToken });
    }

    return res.status(200).json({
      success: true,
      message: 'FCM Token registered successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotificationsHandler,
  markNotificationReadHandler,
  registerFcmTokenHandler,
};
