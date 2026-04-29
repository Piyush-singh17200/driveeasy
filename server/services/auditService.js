const { prisma } = require('../config/postgres');
const logger = require('../utils/logger');

exports.createAuditLog = async (data) => {
  try {
    if (!process.env.DATABASE_URL) return;
    await prisma.auditLog.create({ data });
  } catch (error) {
    logger.warn('Audit log skipped:', error.message);
  }
};
