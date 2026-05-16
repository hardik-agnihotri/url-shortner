const { Worker } = require('bullmq');
const pool = require('../config/db');
const { connection } = require('../config/queue');

const cleanupWorker = new Worker('maintenance-queue', async (job) => {
    if (job.name === 'cleanExpiredUrls') {
        console.log("Worker: Starting daily database cleanup for expired URLs...");

        try {
            const result = await pool.query(
                "DELETE FROM urls WHERE expires_at < NOW() RETURNING id, short_code"
            );

            console.log(`Worker: Cleanup complete! Removed ${result.rowCount} expired URLs.`);
            
            if (result.rowCount > 0) {
                console.log("Deleted Codes:", result.rows.map(row => row.short_code));
            }
        } catch (err) {
            console.error("Cleanup Worker Error:", err);
            throw err;
        }
    }
}, { connection });

module.exports = cleanupWorker;