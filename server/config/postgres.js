const prisma = {
  payment: {
    create: async () => ({}),
    update: async () => ({}),
    upsert: async () => ({}),
    findMany: async () => ([]),
    aggregate: async () => ({ _sum: { amount: 0 } }),
  },
  transaction: { create: async () => ({}) },
  auditLog: { create: async () => ({}) },
  $connect: async () => {},
  $disconnect: async () => {},
};

const connectPostgres = async () => {
  console.log('PostgreSQL skipped');
};

module.exports = { prisma, connectPostgres };
