const express = require('express');
const cors = require('cors');
const app = express();
const corsOptions = require('./config/corsOptions');

const PORT = process.env.PORT || 3500;

app.use(cors(corsOptions)); // Cross Origin Resource Sharing
app.use(express.urlencoded({extended: true})); // parse URL-encoded request bodies
app.use(express.json()); // parse JSON request bodies
app.use(express.static(__dirname + '/public')); // serve static files from a directory

app.get('/', (_, res) => res.sendFile(__dirname + '/views/index.html'));
app.get('/boo', (_, res) => res.sendFile(__dirname + "/views/boo.html"));
app.get('/favicon.ico', (_, res) => res.status(204).end());

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));