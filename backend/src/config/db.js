const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using Mongoose with graceful error handling
 * and environment variable fallback.
 * 
 * @returns {Promise<typeof mongoose | null>} Connected Mongoose instance or null if connection failed
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishisahayak';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`[Database] Mongoose runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Mongoose connection lost / disconnected');
    });

    return conn;
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB at ${mongoUri}: ${error.message}`);
    // Graceful error handling - do not crash unless strictly desired
    return null;
  }
};

/**
 * Gracefully closes the database connection.
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database] Error closing MongoDB connection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
