const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', version: '3.0.0' });
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Trust Wallet Lite running on port ${PORT}`);
});
