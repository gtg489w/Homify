var express = require('express');
var app = express();

app.use(express.static('web'));




var pipe = {
	leaky: false
};




app.get('/api', function (req, res) {
    res.send(pipe);
});

app.post('/api', function (req, res) {
    console.log(req);
});

app.listen(3000, function () {
    console.log('Homify is now listening on port 3000');
});
