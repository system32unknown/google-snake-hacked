const express = require('express')
const app = express()

const PORT = process.env.PORT || 3500;

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files from a directory
app.use('/path', express.static(__dirname + '/path'))
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});
app.get('/boo', (req, res) => {
    res.sendFile(__dirname + "/views/boo.html");
});
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));