const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');
const { redirectToOriginal } = require('./src/controllers/linkController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
    res.status(200).json({ ok: true, version: "1.0" });
});

app.get('/:code', redirectToOriginal);

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});