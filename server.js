const express = require('express');
const ytSearch = require('yt-search');
const axios = require('axios'); // For API requests
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
    res.render('index', { results: null });
});

// Search route
app.post('/search', async (req, res) => {
    const query = req.body.query;

    // Search YouTube videos
    const { videos } = await ytSearch(query);

    // Render the results
    res.render('index', { results: videos });
});

// Download Video route
app.get('/download/video', async (req, res) => {
    const videoUrl = req.query.url; // Get the YouTube video URL from the query

    try {
        // Call the video download API
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
        const response = await axios.get(apiUrl);

        if (response.data.success) {
            const downloadUrl = response.data.result.download_url;
            // Redirect to the download URL
            res.redirect(downloadUrl);
        } else {
            res.status(500).send('Failed to fetch video download link.');
        }
    } catch (error) {
        res.status(500).send('Error downloading the video.');
    }
});

// Download Audio route
app.get('/download/audio', async (req, res) => {
    const videoUrl = req.query.url; // Get the YouTube video URL from the query

    try {
        // Call the audio download API
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
        const response = await axios.get(apiUrl);

        if (response.data.success) {
            const downloadUrl = response.data.result.download_url;
            // Redirect to the download URL
            res.redirect(downloadUrl);
        } else {
            res.status(500).send('Failed to fetch audio download link.');
        }
    } catch (error) {
        res.status(500).send('Error downloading the audio.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
