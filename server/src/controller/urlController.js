const pool = require('../config/db');

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

module.exports = { urlShortner, getRedirect };