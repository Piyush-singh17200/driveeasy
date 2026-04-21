const { prisma } = require('../config/postgres');
const logger = require('../utils/logger');

const createAuditLog = async ({ userId, action, resource, resourceId, ipAddress, userAgent, metadata }) => {
  try {
    await prisma.auditLog.create({
      data: { userId, action, resource, resourceId, ipAddress, userAgent, metadata },
    });
  } catch (error) {
    logger.error('Audit log error:', error.message);
  }
};

module.exports = { createAuditLog };
