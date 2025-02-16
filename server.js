const express = require('express');
const ytSearch = require('yt-search');
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
