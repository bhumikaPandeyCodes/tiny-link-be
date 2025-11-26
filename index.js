const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');
const { redirectToOriginal } = require('./src/controllers/linkController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check (Requirement 1)
app.get('/healthz', (req, res) => {
    res.status(200).json({ ok: true, version: "1.0" });
});

// Redirect Route (Requirement: /:code)
// Note: This must be before global error handlers but after API routes if possible, 
// or ensure API routes don't conflict. 
// Since API is at /api/..., /:code won't conflict.
app.get('/:code', redirectToOriginal);

// API Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});