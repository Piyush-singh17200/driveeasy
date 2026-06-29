const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectMongoDB = async () => {
  if (!process.env.MONGODB_URI) {
    logger.warn('MongoDB connection skipped - MONGODB_URI not set');
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

module.exports = connectMongoDB;
