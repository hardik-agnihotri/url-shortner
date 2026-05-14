const redisClient = require('../config/redis');

const rateLimiter = async (req, res, next) => {

    const ip = req.ip; 
    const key = `rate_limit:${ip}`;
    
    const LIMIT = 5;
    const WINDOW = 60;    

    try {

        const currentUsage = await redisClient.get(key);

        if (currentUsage && parseInt(currentUsage) >= LIMIT) {
            return res.status(429).json({
                error: "Too many requests",
                message: `Slow down! You can only create ${LIMIT} URLs per minute.`
            });
        }
        const count = await redisClient.incr(key);

        if (count === 1) {
            await redisClient.expire(key, WINDOW);
        }
        res.set('X-RateLimit-Limit', LIMIT);
        res.set('X-RateLimit-Remaining', Math.max(0, LIMIT - count));

        next();
    } catch (error) {
        console.error("Rate Limiter Error:", error);
        next(); 
    }
};

module.exports = rateLimiter;