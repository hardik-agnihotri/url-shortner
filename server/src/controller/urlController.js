const pool = require('../config/db');
const redisClient = require('../config/redis');

const urlShortner = async (req, res) => {
    try {
        let { original_url } = req.body; // Use 'let' so we can modify it
        if (!original_url) return res.status(400).json({ error: "URL is required" });

        // FIX: Ensure the URL is absolute so res.redirect works correctly later
        if (!original_url.startsWith('http://') && !original_url.startsWith('https://')) {
            original_url = `https://${original_url}`;
        }

        const shortCode = Math.random().toString(36).substring(2, 8);

        const result = await pool.query(
            'INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING *',
            [original_url, shortCode]
        );

        return res.status(201).json({
            message: "Shortcode has been created",
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json("Server Error");
    }
};

const getRedirect = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const cachedUrl = await redisClient.get(shortCode);
        if (cachedUrl) {
            console.log("CACHE HIT: Redirecting from Redis");
            // Still update analytics in the background (Async)
            pool.query("UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1", [shortCode]);
            return res.status(302).redirect(cachedUrl);
        }
        console.log("CACHE MISS: Fetching from PostgreSQL");
        const result = await pool.query(
            'SELECT * FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (result.rows.length > 0) {

            await pool.query(
                "UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1",
                [shortCode]
            );
            
            const updated = await pool.query(
                "SELECT clicks FROM urls WHERE short_code = $1",
                [shortCode]
            );


            let targetUrl = result.rows[0].original_url;

            if (!targetUrl.startsWith("http")) {
                targetUrl = `https://${targetUrl}`;
            }
            await redisClient.set(shortCode, targetUrl,{
                EX: 43200 
            });
            return res.redirect(targetUrl);
        }

        return res.status(404).json({
            message: "No URL found"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Server Error"
        });
    }
};

const getAnalytics = async (req, res) => {
    const {shortCode} = req.params;
    
    try {
        const result = await pool.query(
            "SELECT original_url, clicks, created_at FROM urls WHERE short_code = $1",
            [shortCode]
        )
        if(result.rows.length > 0){
            return res.status(200).json({Data:result.rows[0] ,message:"Analytics for requested shorcode"})
        }
        return res.status(404).json({message:"No analytics found"})
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};


const deleteUrl = async (req, res) => {
    const { shortCode } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM urls WHERE short_code = $1 RETURNING *", 
            [shortCode]
        );

        if (result.rows.length > 0) {
            return res.status(200).json({ 
                message: "URL deleted successfully",
                deletedData: result.rows[0] 
            });
        }
        
        return res.status(404).json({ message: "No URL found with that code" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { urlShortner, getRedirect,getAnalytics,deleteUrl };