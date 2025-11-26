const db = require('../config/db');
const { nanoid } = require('nanoid');

// Regex from PDF: [A-Za-z0-9]{6,8}
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

const createLink = async (req, res) => {
    const { url, shortCode } = req.body;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    let code = shortCode;

    // Validate custom code if provided
    if (code) {
        if (!CODE_REGEX.test(code)) {
            return res.status(400).json({ error: 'Short code must be 6-8 alphanumeric characters.' });
        }
    } else {
        // Generate unique code (6 chars)
        code = nanoid(6);
    }

    try {
        const result = await db.query(
            'INSERT INTO links (original_url, short_code) VALUES ($1, $2) RETURNING *',
            [url, code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Postgres unique violation code
            return res.status(409).json({ error: 'Short code already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getLinks = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM links ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getLinkStats = async (req, res) => {
    const { code } = req.params;
    try {
        const result = await db.query('SELECT * FROM links WHERE short_code = $1', [code]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteLink = async (req, res) => {
    const { code } = req.params;
    try {
        const result = await db.query('DELETE FROM links WHERE short_code = $1 RETURNING *', [code]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });
        res.status(204).send(); // No content
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const redirectToOriginal = async (req, res) => {
    const { code } = req.params;
    try {
        const result = await db.query(
            'UPDATE links SET click_count = click_count + 1, last_clicked_at = NOW() WHERE short_code = $1 RETURNING original_url',
            [code]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });

        // 302 Redirect as requested
        res.redirect(302, result.rows[0].original_url);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { createLink, getLinks, getLinkStats, deleteLink, redirectToOriginal };