var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('web'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var scoreboard = {
	points: 300
};

app.get('/api/points', function (req, res) {
	console.log('GET');
    res.json(scoreboard);
});

app.post('/api/points', function (req, res) {
	console.log('points!');
    scoreboard.points = req.body.points;
    res.status(201).send();
});

app.listen(3000, function () {
    console.log('Homify is now listening on port 3000');
});
