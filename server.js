const express = require('express');
const path = require('path');
const UAParser = require('ua-parser-js');

const app = express();
const PORT = process.env.PORT || 8080;

// API base URL from environment or default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://click2pic-be-env.eba-m28pri3n.us-east-1.elasticbeanstalk.com/api/v1';

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint for AWS Elastic Beanstalk
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Helper function to detect if request is from a social media crawler
function isCrawler(userAgent) {
    const crawlerPatterns = [
        'whatsapp', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
        'slackbot', 'telegrambot', 'discordbot', 'pinterest', 'skype',
        'facebot', 'ia_archiver'
    ];
    const ua = userAgent.toLowerCase();
    return crawlerPatterns.some(pattern => ua.includes(pattern));
}

// Photo share route with Open Graph meta tags
app.get('/share/photo/:photoId', async (req, res) => {
    const { photoId } = req.params;
    const userAgent = req.headers['user-agent'] || '';

    // If it's a crawler, serve HTML with Open Graph tags
    if (isCrawler(userAgent)) {
        try {
            // Fetch photo metadata from backend
            // Note: We'll need to get event info and photo info
            // For now, we'll use a simple approach - extract from query params if available
            const photoUrl = req.query.url || '';
            const eventName = req.query.event || 'אירוע';
            const photoTitle = req.query.title || 'תמונה מהאירוע';

            // Generate HTML with Open Graph tags
            const html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
    <!-- Primary Meta Tags -->
    <title>${photoTitle} - ${eventName}</title>
    <meta name="title" content="${photoTitle} - ${eventName}" />
    <meta name="description" content="צפה בתמונה מ${eventName} | Click2Pic" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${req.protocol}://${req.get('host')}${req.originalUrl}" />
    <meta property="og:title" content="${photoTitle} - ${eventName}" />
    <meta property="og:description" content="צפה בתמונה מ${eventName} | Click2Pic" />
    <meta property="og:image" content="${photoUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${req.protocol}://${req.get('host')}${req.originalUrl}" />
    <meta property="twitter:title" content="${photoTitle} - ${eventName}" />
    <meta property="twitter:description" content="צפה בתמונה מ${eventName} | Click2Pic" />
    <meta property="twitter:image" content="${photoUrl}" />
    
    <!-- WhatsApp specific -->
    <meta property="og:site_name" content="Click2Pic" />
    
    <!-- Redirect after 1 second for crawlers that execute JS -->
    <meta http-equiv="refresh" content="1;url=${photoUrl}" />
</head>
<body>
    <h1>${photoTitle}</h1>
    <p>מפנה לתמונה...</p>
    <script>
        // Immediate redirect for browsers
        window.location.href = '${photoUrl}';
    </script>
</body>
</html>`;

            res.send(html);
        } catch (error) {
            console.error('Error generating share page:', error);
            res.status(500).send('Error loading photo');
        }
    } else {
        // For regular users, redirect directly to the photo URL
        const photoUrl = req.query.url;
        if (photoUrl) {
            res.redirect(photoUrl);
        } else {
            res.status(400).send('Photo URL not provided');
        }
    }
});

// Gallery route with dynamic OG tags for crawlers
app.get('/gallery/:id', async (req, res) => {
    const { id } = req.params;
    const userAgent = req.headers['user-agent'] || '';

    if (isCrawler(userAgent)) {
        try {
            // Fetch event data from backend to get photographer logo and event title
            const response = await fetch(`${API_BASE_URL}/public/events/${id}`);
            const data = await response.json();

            if (data && data.event) {
                const event = data.event;
                const photographer = data.photographer || {};

                // Priority: Photographer logo -> Event cover image -> Default site logo
                const ogImage = photographer.logo_url || event.cover_image_url || `${req.protocol}://${req.get('host')}/logo512.png`;
                const ogTitle = `${event.title} | ${photographer.name || 'Click2Pic'}`;
                const ogDesc = `לחצו לצפייה בגלריה המלאה של ${event.title}`;

                const html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="utf-8" />
    <title>${ogTitle}</title>
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${req.protocol}://${req.get('host')}${req.originalUrl}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta http-equiv="refresh" content="0;url=/gallery/${id}" />
</head>
<body>
    <script>window.location.href = '/gallery/${id}';</script>
</body>
</html>`;
                return res.send(html);
            }
        } catch (error) {
            console.error('Error serving dynamic gallery meta tags:', error);
        }
    }

    // Default: serve the regular React app
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Handle React routing - return index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
