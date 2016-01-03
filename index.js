var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var request = require('request');

app.use(express.static('web'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


////////////////////////////////////////////////////////////////
// Config
////////////////////////////////////////////////////////////////
var dlHeaders = {
	'Authtoken': 'e8a801785c419ef3c6588ff7659689cb0165d457afdb2bdb4084610b1f1d84accd669c59a414c0dee7cdaeb2de91330c0f3077877e49d30061f9bcc3f87fd3c3940e891da074b36bf91594ea47bdc95af75292c386f3f718e087129c389ebca6158f49cb1a813f7abd7b2955',
	'Appkey': 'JE_69AE31D2465E39EF_1',
	'Requesttoken': 'e5ebd2633d726882a41816ad2f3e753f'
};

var dlConfig = {
	applicationId: 'JE_69AE31D2465E39EF_1',
	igloo: 'igloo14',
	username: '553474453',
	password: 'NO-PASSWD',
	gateway: 'ECCA001228754F079ADCB3FE25E65154'
};

var scConfig = {
	parkingSensor: {
		deviceId: '50e76f69e40eae98b4a755052b187e1f' // FF-5
		// deviceId: '5593cdd51170dc63e00ae575' // Stage Left (FastPrk)
		// deviceId: '561387c711705b068730f4b1' // Stage Right (FastPrk)
	},
	garbageCan: {
		deviceId: 'e3304702d4bb9e1a41acf73425d63fd0'
	}
};

var m2xHeaders = {
	'Content-Type': 'application/json',
	'X-M2X-KEY': '346e3f0b4ced985f81b4ab17afa37b0b'
};

var dlDevices = {
	'light': {
		guid: 'DE00000005',
		evnt: 'switch' // on, off
	},
	'plug': {
		guid: 'PE00000002',
		evnt: 'switch' // on, off
	},
	'lock': {
		guid: 'DL00000007',
		evnt: 'lock' // lock, unlock
	}
};

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
		points += 100;
	}
	// if(deviceStatus.garbage) {
	// points += 100;
	// }
	if(deviceStatus.parking) { // faked garbage
		points += 50;
	}
	if(deviceStatus.dishes) {
		points += 50;
	}
	if(deviceStatus.homework) {
		points += 300;
	}
	scoreboard.points = points;
	scoreboard.status = deviceStatus;

	if(points >= 500) {
		dlLock('unlock');
		dlPlug('on');
		dlLight('on');
	}

	// push point data to M2X
	postPoints(points);
	
	res.json(scoreboard);
});

app.post('/api/homework', function (req, res) {
	if(req.body.complete) {
		deviceStatus.homework = true;
	} else {
		deviceStatus.homework = false;
	}
    //scoreboard.points = req.body.points;
    res.status(201).send();
});

app.get('/api/reset', function (req, res) {
	deviceStatus.homework = false;
	dlLock('lock');
	dlPlug('off');
	dlLight('off');
	console.log('reset');
    res.status(201).send();
});

app.get('/api/open', function (req, res) {
	console.log('complete!');
	dlLock('unlock');
	dlPlug('on');
	dlLight('on');
    res.status(201).send();
});


////////////////////////////////////////////////////////////////
// Integrations
////////////////////////////////////////////////////////////////

// SmartCities / M2X

var intGarbageCan = function() {
	var options = {
		host: 'api-m2x.att.com',
		path: '/v2/devices/' + scConfig.garbageCan.deviceId + '/streams/level'
	};

	callback = function(response) {
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
		});
		response.on('end', function () {
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
	var request = http.request(options, callback);
	request.on('error', function(err) {});
	request.end();
};

var intParkingSpot = function() {
	var options = {
		host: 'api-m2x.att.com',
		path: '/v2/devices/' + scConfig.parkingSensor.deviceId + '/streams/parking-spot'
	};
	// fpmfll5

	callback = function(response) {
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
		});
		response.on('end', function () {
			var occupied = JSON.parse(JSON.parse(str).value).occupied;
			console.log('occupied');
			console.log(occupied);
			console.log(str);
			if(occupied == 'true' || occupied == true) {
				console.log('parking full');
				deviceStatus.parking = false;
			} else {
				console.log('parking empty');
				deviceStatus.parking = true;
			}
		});
	};
	var request = http.request(options, callback);
	request.on('error', function(err) {});
	request.end();
};

var postPoints = function(points) {

	var options = {
		hostname: 'api-m2x.att.com',
		port: 80,
		path: '/v2/devices/547c4f27c34eed5aefc64e9153e73af8/streams/point-score/values',
		method: 'POST',
		headers: m2xHeaders
	};
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (body) {
			// console.log('Body: ' + body);
		});
	});
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	var d = new Date();
	var hours = ("0" + d.getHours()).substr(-2);
	var minutes = ("0" + d.getMinutes()).substr(-2);
	var seconds = ("0" + d.getSeconds()).substr(-2);

	req.write('{ "values": [{ "timestamp": "2016-01-03T'+hours+':'+minutes+':'+seconds+'.000Z", "value": '+points+' }] }');
	req.end();
};

// Digital Life

var dlLock = function(status) {
	request({
		method: 'POST',
		url: 'https://systest.digitallife.att.com:443/penguin/api/'+dlConfig.gateway+'/devices/'+dlDevices.lock.guid+'/lock/' + status,
		headers: dlHeaders
	}, function (err, res) {
		if(err) {
			return console.error(err.message);
		}
	});
};

var dlPlug = function(status) {
	request({
		method: 'POST',
		url: 'https://systest.digitallife.att.com:443/penguin/api/'+dlConfig.gateway+'/devices/'+dlDevices.plug.guid+'/switch/' + status,
		headers: dlHeaders
	}, function (err, res) {
		if(err) {
			return console.error(err.message);
		}
	});
};

var dlLight = function(status) {
	request({
		method: 'POST',
		url: 'https://systest.digitallife.att.com:443/penguin/api/'+dlConfig.gateway+'/devices/'+dlDevices.light.guid+'/switch/' + status,
		headers: dlHeaders
	}, function (err, res) {
		if(err) {
			return console.error(err.message);
		}
	});
};

////////////////////////////////////////////////////////////////
// Setup The Server
////////////////////////////////////////////////////////////////



var interval = function() {
	intGarbageCan();
	intParkingSpot();
};

interval();
setInterval(interval, 5000);

app.listen(3000, function () {
    console.log('Level Up is now listening on port 3000');
});














