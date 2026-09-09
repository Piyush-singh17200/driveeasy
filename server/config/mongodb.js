const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carrental';

  if (!process.env.MONGODB_URI) {
    logger.warn(`MongoDB connection falling back to local database: ${mongoUri}`);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
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
