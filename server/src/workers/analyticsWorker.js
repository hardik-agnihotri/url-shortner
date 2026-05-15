const { Worker } = require('bullmq');
const pool = require('../config/db');
const { connection } = require('../config/queue');

// src/workers/analyticsWorker.js
const worker = new Worker('analytics-queue', async (job) => {
    if (job.name === 'trackClick') {
        const { urlId, ip, userAgent, referrer } = job.data;

        await pool.query("UPDATE urls SET clicks = clicks + 1 WHERE id = $1", [urlId]);

        await pool.query(
            "INSERT INTO analytics (url_id, ip_address, user_agent, referrer) VALUES ($1, $2, $3, $4)",
            [urlId, ip, userAgent, referrer]
        );
    }
}, { connection });

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed! Click tracked.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});