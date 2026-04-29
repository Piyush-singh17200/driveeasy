const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma;

if (process.env.DATABASE_URL) {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
} else {
  prisma = {
    payment: { 
      aggregate: async () => ({ _sum: { amount: 0 } }), 
      findMany: async () => [], 
      create: async (data) => data,
      upsert: async ({ create }) => create,
      update: async ({ data }) => data,
    },
    transaction: {
      create: async (data) => data,
    },
    auditLog: { 
      create: async (data) => data, 
      findMany: async () => [] 
    },
    $connect: async () => {},
    $disconnect: async () => {},
    $transaction: async (fn) => {
      if (typeof fn === 'function') return fn(prisma);
      return fn;
    },
  };
}

const connectPostgres = async () => {
  if (!process.env.DATABASE_URL) {
    logger.warn('PostgreSQL connection skipped - DATABASE_URL not set');
    return;
  }
  
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
  } catch (error) {
    logger.error('PostgreSQL connection failed: ' + error.message);
  }
};

process.on('beforeExit', async () => {
  if (process.env.DATABASE_URL) await prisma.$disconnect();
});

module.exports = { prisma, connectPostgres };
