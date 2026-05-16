const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

connection.on('connect', () => {
  console.log('BullMQ Redis Connected');
});

connection.on('error', (err) => {
  console.log('BullMQ Redis Error:', err);
});

const analyticsQueue = new Queue('analytics-queue', {
  connection,
});

const maintenanceQueue = new Queue('maintenance-queue',{connection})

const startCronJobs = async () => {
    await maintenanceQueue.add(
        'cleanExpiredUrls', 
        {}, 
        {
            repeat: {
                pattern: '0 0 * * *'
            }
        }
    );
    console.log("Scheduled Cron Jobs initialized!");
};

startCronJobs().catch(err => console.error("Cron setup failed", err));

module.exports = { analyticsQueue, connection };