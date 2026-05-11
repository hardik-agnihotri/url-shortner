const pool = require('../config/db') ;

const urlShortner = async (req, res) => {
    try {
        const { original_url } = req.body;
        if (!original_url) return res.status(400).json({ error: "URL is required" });

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

module.exports = {urlShortner}