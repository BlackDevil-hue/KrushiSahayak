/**
 * errorMiddleware.js
 * Centralized error handling middleware for express app.
 */

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ErrorHandler] ${req.method} ${req.originalUrl} - Status ${statusCode} - ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};

module.exports = {
  errorHandler,
};
