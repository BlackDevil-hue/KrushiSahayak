/**
 * src/index.js
 * Primary Server Entry point for Render / Production
 */

require('dotenv').config();
const app = require('../server');
const { connectDB } = require('./config/db');
const { startNotificationScheduler } = require('./services/notificationService');

const PORT = process.env.PORT || 5000;

// Connect Database & Start HTTP Server Listener
connectDB().then(() => {
  try {
    startNotificationScheduler();
  } catch (err) {
    console.warn('[NotificationScheduler] Warning:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KrishiSahayak] REST API Engine listening on 0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error('[Database] Connection failed on startup:', err.message);
  // Still start Express server so health check route works
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KrishiSahayak] REST API Engine running in degraded state on port ${PORT}`);
  });
});

module.exports = app;
