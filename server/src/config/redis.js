const redis = require("redis");

const client = new redis.createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

(async ()=>{
    await client.connect();
    console.log("Connected to Redis via Docker!");
})();

module.exports = client;