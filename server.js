const express = require('express');
const ytSearch = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// File to store user data
const usersFilePath = path.join(__dirname, 'users.json');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Load users from users.json
let users = [];
if (fs.existsSync(usersFilePath)) {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
}

// Home route - Login or Signup
app.get('/', (req, res) => {
    res.render('name');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.redirect('/search');
    } else {
        res.send('Invalid username or password. Please sign up.');
    }
});

// Signup route
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const ipAddress = req.ip;

    // Check if user already exists
    const userExists = users.some(u => u.username === username);
    if (userExists) {
        res.send('Username already exists. Please log in.');
    } else {
        // Save new user
        users.push({ username, password, ipAddress });
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        res.redirect('/search');
    }
});

// Search route (rest of your existing code remains the same)
// ...

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
