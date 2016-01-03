var express = require('express');
var app = express();

app.use(express.static('web'));

app.get('/api', function (req, res) {
    res.send('Hello Homify API!');
});

app.listen(3000, function () {
    console.log('Homify is now listening on port 3000');
});
