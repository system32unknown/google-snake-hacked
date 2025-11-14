const express = require('express')
const path = require('path')
const app = express()

const PORT = process.env.PORT || 3500;

app.use('/path', express.static(__dirname + '/path'))

app.use('/', express.static(path.join(__dirname, '/public')));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));