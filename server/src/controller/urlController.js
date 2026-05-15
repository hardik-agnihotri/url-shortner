const pool = require('../config/db');
const redisClient = require('../config/redis');
const { encode } = require('../utils/base62');

const urlShortner = async (req, res) => {
    try {
        let { original_url } = req.body; 
        if (!original_url) return res.status(400).json({ error: "URL is required" });

        if (!original_url.startsWith('http://') && !original_url.startsWith('https://')) {
            original_url = `https://${original_url}`;
        }

        const result = await pool.query(
            'INSERT INTO urls (original_url) VALUES ($1) RETURNING id',
            [original_url]
        );

        const id = result.rows[0].id;
        
        const shortCode = encode(id); 

        const finalResult = await pool.query(
            "UPDATE urls SET short_code = $1 WHERE id = $2 RETURNING *",
            [shortCode, id]
        );

        return res.status(201).json({
            message: "Shortcode has been created",
            data: finalResult.rows[0] 
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