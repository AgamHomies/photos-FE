const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint for AWS Elastic Beanstalk
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Handle React routing - return index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
