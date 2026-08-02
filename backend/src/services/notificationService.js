/**
 * notificationService.js
 * Producer service and FCM Push / Deadline Reminder scheduler for KrishiSahayak.
 */

const { Notification, User, Scheme, FarmerProfile } = require('../models');

/**
 * Dispatches Push Notification via FCM or logs to console if FCM credentials are not configured.
 * @param {string} fcmToken 
 * @param {string} title 
 * @param {string} message 
 */
async function sendFcmPushNotification(fcmToken, title, message) {
  if (!fcmToken) return;

  // Firebase Admin SDK integration check
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      // Lazy load firebase-admin if installed
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          }),
        });
      }
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body: message },
      });
      console.log(`[notificationService] FCM Push sent to token ${fcmToken.slice(0, 10)}...`);
    } catch (err) {
      console.warn(`[notificationService] FCM Push delivery failed:`, err.message);
    }
  } else {
    console.log(`[notificationService: Dev/Fallback] Simulated Push to ${fcmToken.slice(0, 10)}... -> Title: "${title}", Message: "${message}"`);
  }
}

/**
 * Creates a notification record for a specific user and dispatches push alert.
 * @param {string} userId 
 * @param {object} payload - { title, message, type }
 */
async function createNotificationForUser(userId, { title, message, type = 'general' }) {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
    });

    const user = await User.findById(userId).select('fcmToken').lean();
    if (user && user.fcmToken) {
      await sendFcmPushNotification(user.fcmToken, title, message);
    }

    return notification;
  } catch (err) {
    console.error('[notificationService] Failed to create notification:', err.message);
  }
}

/**
 * Producer for Application Deadline Reminders:
 * Checks schemes with deadlines approaching within 7 days and notifies all farmers.
 */
async function checkDeadlineReminders() {
  try {
    const schemes = await Scheme.find().lean();
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const users = await User.find({ role: 'farmer' }).select('_id').lean();
    if (users.length === 0) return;

    for (const scheme of schemes) {
      let deadlineDate = null;
      if (scheme.applicationDeadline) {
        deadlineDate = new Date(scheme.applicationDeadline);
      }

      // If deadline is valid date and within next 7 days
      if (deadlineDate && !isNaN(deadlineDate.getTime()) && deadlineDate > now && deadlineDate <= sevenDaysLater) {
        const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        const title = `Deadline Alert: ${scheme.name}`;
        const message = `Application deadline for ${scheme.name} is in ${daysLeft} days (${deadlineDate.toLocaleDateString()}). Apply now!`;

        for (const u of users) {
          // Check if notification already sent today to prevent duplicate spam
          const existing = await Notification.findOne({
            userId: u._id,
            title,
            createdAt: { $gte: new Date(now.setHours(0,0,0,0)) },
          });

          if (!existing) {
            await createNotificationForUser(u._id, {
              title,
              message,
              type: 'reminder',
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[notificationService] Error checking deadline reminders:', err.message);
  }
}

/**
 * Producer for New Scheme Notifications:
 * Triggers when a new scheme is created/seeded to notify registered farmers.
 * @param {object} scheme 
 */
async function notifyNewScheme(scheme) {
  try {
    if (!scheme || !scheme.name) return;

    const users = await User.find({ role: 'farmer' }).select('_id').lean();
    const title = `New Scheme Alert: ${scheme.name}`;
    const message = `A new agricultural scheme "${scheme.name}" (${scheme.category || 'General'}) is now available. Check eligibility!`;

    for (const u of users) {
      await createNotificationForUser(u._id, {
        title,
        message,
        type: 'scheme_update',
      });
    }
  } catch (err) {
    console.error('[notificationService] Error notifying new scheme:', err.message);
  }
}

/**
 * Starts the periodic background scheduler for deadline checking.
 */
function startNotificationScheduler() {
  console.log('[notificationService] Notification & Deadline reminder scheduler initialized.');
  // Initial check on startup
  setTimeout(() => {
    checkDeadlineReminders().catch(console.error);
  }, 10000);

  // Repeat every 12 hours
  setInterval(() => {
    checkDeadlineReminders().catch(console.error);
  }, 12 * 60 * 60 * 1000);
}

module.exports = {
  createNotificationForUser,
  checkDeadlineReminders,
  notifyNewScheme,
  startNotificationScheduler,
};
