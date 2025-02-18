const express = require('express');
const ytSearch = require('yt-search');
const axios = require('axios'); // For API requests
const app = express();
const port = process.env.PORT || 3000;

// Telegram bot details
const TELEGRAM_BOT_TOKEN = '7981577790:AAHhoGXjXGj2UCRKsSHWKXkAWH-HlKhiNk8'; // Replace with your bot token
const TELEGRAM_CHAT_ID = '5901409601'; // Replace with your chat ID

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Store user data temporarily (in a real app, use a database)
let userData = {};

// Home route - Ask for user's name
app.get('/', (req, res) => {
    res.render('name');
});

// Save user's name and redirect to search
app.post('/save-name', (req, res) => {
    const userName = req.body.userName;

    // Save the user's name
    userData.name = userName;

    // Send the name to Telegram bot
    sendToTelegram(`New user: ${userName}`);

    // Redirect to the search page
    res.redirect('/search');
});

// Search route
app.get('/search', (req, res) => {
    if (!userData.name) {
        return res.redirect('/'); // Redirect to name page if no name is set
    }
    res.render('index', { results: null });
});

// Handle search requests
app.post('/search', async (req, res) => {
    const query = req.body.query;

    // Save the search query and send to Telegram bot
    sendToTelegram(`${userData.name} searched for: ${query}`);

    // Search YouTube videos
    const { videos } = await ytSearch(query);

    // Render the results
    res.render('index', { results: videos });
});

// Download Video route
app.get('/download/video', async (req, res) => {
    const videoUrl = req.query.url;

    try {
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
        const response = await axios.get(apiUrl);

        if (response.data.success) {
            const downloadUrl = response.data.result.download_url;
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
    const videoUrl = req.query.url;

    try {
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
        const response = await axios.get(apiUrl);

        if (response.data.success) {
            const downloadUrl = response.data.result.download_url;
            res.redirect(downloadUrl);
        } else {
            res.status(500).send('Failed to fetch audio download link.');
        }
    } catch (error) {
        res.status(500).send('Error downloading the audio.');
    }
});

// Function to send messages to Telegram bot
function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
    })
    .then(response => {
        console.log('Message sent to Telegram:', response.data);
    })
    .catch(error => {
        console.error('Error sending message to Telegram:', error);
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 
