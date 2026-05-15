const { Worker } = require('bullmq');
const pool = require('../config/db');
const { connection } = require('../config/queue');

const worker = new Worker('analytics-queue', async (job) => {
    console.log(job.id)
    console.log(job.data)
    if (job.name === 'trackClick') {
        const { shortCode } = job.data;
        
        console.log(`Processing analytics for: ${shortCode}`);

        await pool.query(
            "UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1",
            [shortCode]
        );
    }
}, { connection });

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed! Click tracked.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});