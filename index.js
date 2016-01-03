var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');

app.use(express.static('web'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


////////////////////////////////////////////////////////////////
// Config
////////////////////////////////////////////////////////////////
var dlHeaders = [{
	name: 'Authtoken',
	value: 'e8a801785c419ef3c6588ff7659689cb0165d457afdb2bdb4084610b1f1d84accd669c59a414c0dee7cdaeb2de91330c0f3077877e49d30061f9bcc3f87fd3c3940e891da074b36bf91594ea47bdc95af75292c386f3f718e087129c389ebca6158f49cb1a813f7abd7b2955'
},{
	name: 'Appkey',
	value: 'JE_69AE31D2465E39EF_1'
},{
	name: 'Requesttoken',
	value: 'e5ebd2633d726882a41816ad2f3e753f'
}];

dlConfig = {
	applicationId: 'JE_69AE31D2465E39EF_1',
	igloo: 'igloo14',
	username: '553474453',
	password: 'NO-PASSWD',
	gateway: 'ECCA001228754F079ADCB3FE25E65154'
};

var dlDevices = [{
	name: 'light',
	guid: 'DE00000005',
	evnt: 'switch' // on, off
},{
	name: 'plug',
	guid: 'PE00000002',
	evnt: 'switch' // on, off
},{
	name: 'lock',
	guid: 'DL00000007',
	evnt: 'lock' // lock, unlock
}];

////////////////////////////////////////////////////////////////
// Data Store
////////////////////////////////////////////////////////////////

var scoreboard = {
	points: 300
};

var deviceStatus = {
	exercise: true,
	garbage: false,
	parking: false,
	dishes: true,
	homework: false
};

////////////////////////////////////////////////////////////////
// API
////////////////////////////////////////////////////////////////

app.get('/api/points', function (req, res) {
	var points = 0;
	if(deviceStatus.exercise) {
		points += 150;
	}
	// if(deviceStatus.garbage) {
	// points += 100;
	// }
	if(deviceStatus.parking) { // faked garbage
		console.log(deviceStatus.parking);
		points += 100;
	}
	if(deviceStatus.dishes) {
		points += 150;
	}
	if(deviceStatus.homework) {
		points += 200;
	}
	scoreboard.points = points;
	scoreboard.status = deviceStatus;

	// push point data to M2X

    res.json(scoreboard);
});

// app.post('/api/points', function (req, res) {
// console.log('points!');
//     scoreboard.points = req.body.points;
//     res.status(201).send();
// });

app.post('/api/homework', function (req, res) {
	if(req.body.complete) {
		deviceStatus.homework = true;
	} else {
		deviceStatus.homework = false;
	}
    //scoreboard.points = req.body.points;
    res.status(201).send();
});


////////////////////////////////////////////////////////////////
// Integrations
////////////////////////////////////////////////////////////////

var intGarbageCan = function() {
	var options = {
		host: 'api-m2x.att.com',
		path: '/v2/devices/e3304702d4bb9e1a41acf73425d63fd0/streams/level'
	};

	callback = function(response) {
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
		});
		response.on('end', function () {
			//console.log(str);
			console.log(
				'Current Garbage Can Level: ' + JSON.parse(str).value
			);
			if(JSON.parse(JSON.parse(str).value) > 48) {
				deviceStatus.garbage = false;
			} else {
				deviceStatus.garbage = true;
			}
		});
	};
	http.request(options, callback).end();
};

var intParkingSpot = function() {
	var options = {
		host: 'api-m2x.att.com',
		path: '/v2/devices/50e76f69e40eae98b4a755052b187e1f/streams/parking-spot'
	};
	// fpmfll5

	callback = function(response) {
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
		});
		response.on('end', function () {
			if(JSON.parse(JSON.parse(JSON.parse(str).value).occupied)) {
				console.log('garbage (parking) full');
				deviceStatus.parking = false;
			} else {
				console.log('garbage (parking) empty');
				deviceStatus.parking = true;
			}
		});
	};
	http.request(options, callback).end();
};

var interval = function() {
	intGarbageCan();
	intParkingSpot();
};

interval();
setInterval(interval, 5000);

app.listen(3000, function () {
    console.log('Homify is now listening on port 3000');
});














