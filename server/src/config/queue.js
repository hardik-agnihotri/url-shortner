const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// BullMQ prefers the 'ioredis' client for its internal operations
const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,   
});

const analyticsQueue = new Queue('analytics-queue', { connection });

module.exports = { analyticsQueue, connection };