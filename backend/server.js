/**
 * server.js
 * Core Express server initialization for KrishiSahayak Backend.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./src/config/db');

// Import Middleware
const { errorHandler } = require('./src/middleware/errorMiddleware');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const schemeRoutes = require('./src/routes/schemeRoutes');
const eligibilityRoutes = require('./src/routes/eligibilityRoutes');
const bookmarkRoutes = require('./src/routes/bookmarkRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const checklistRoutes = require('./src/routes/checklistRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// Enable CORS securely
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173', 'capacitor://localhost', 'http://localhost'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

app.use('/api/', apiLimiter);

// Root GET / health status route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    service: 'KrishiSahayak REST API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Connect API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/checklists', checklistRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Middleware
app.use(errorHandler);

// Start server if script is run directly
if (require.main === module) {
  connectDB().then(() => {
    const { startNotificationScheduler } = require('./src/services/notificationService');
    startNotificationScheduler();

    app.listen(PORT, () => {
      console.log(`[KrishiSahayak] REST API Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
