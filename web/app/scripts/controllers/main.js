'use strict';
angular.module('homifyApp').controller('MainCtrl', function ($scope, $http, $interval, ApiService) {

	////////////////////////////////////////////////////////////////
	// Config
	////////////////////////////////////////////////////////////////

	var phone = ATT.rtc.Phone.getPhone();
	var myDHS = null;
	var accessToken = null;
	var myDHSURL = '@attwebrtc.com';

	////////////////////////////////////////////////////////////////
	// State
	////////////////////////////////////////////////////////////////

	$scope.webrtc = {
		error: false,
		restarting: false,
		viewing: false
	};

	$scope.data = {
		points: null,
		homework: false,
		forcedTrash: false
	};

	////////////////////////////////////////////////////////////////
	// Caller WebRTC
	////////////////////////////////////////////////////////////////

	phone.on('error', function () {
		// $scope.webrtc.error = true;
	});

	$scope.callDispatcher = function () {
		$scope.webrtc.viewing = true;
		dailThePhone();
	};

	$scope.hangup = function () {
		phone.hangup();
		$scope.webrtc.viewing = false;
	};

	var getAccessToken = function () {
		$http.post('https://www.attwebrtc.com/hackathon/demo/dhs/token.php', JSON.stringify({ app_scope: "ACCOUNT_ID" })).then(function (result) {
			accessToken = result.data;
			phone.associateAccessToken({
				userId: 'levelupCaller2',
				token: accessToken.access_token,
				success: function () {
					phone.login({
						token: accessToken.access_token
					});
				},
				error: function () {
					phone.logout();
				}
			});
		});
	};

	var dailThePhone = function () {
		phone.dial({
			destination: phone.cleanPhoneNumber("levelupCallee2" + myDHSURL),
			mediaType: 'video',
			localMedia: $('#local')[0],
			remoteMedia: $('#remote')[0]
		});
	};

	var initWebRtc = function() {
		$http.get('https://www.attwebrtc.com/hackathon/demo/dhs/config.php').then(function (result) {
			myDHS = result.data;
			getAccessToken();
		});
	};
	initWebRtc();

	$scope.restartWebRTC = function() {
		$scope.webrtc.error = false;
		$scope.webrtc.restarting = true;
		initWebRtc();
	};

	////////////////////////////////////////////////////////////////
	// Wheel
	////////////////////////////////////////////////////////////////

	var myCircle = Circles.create({
		id:                  'circles-1',
		radius:              150,
		value:               0,
		maxValue:            500,
		width:               20,
		text:                function(value){return value + '<br /><span>points</span>';},
		colors:              ['#ddf9fc', '#2CCAD9'],
		duration:            400,
		wrpClass:            'circles-wrp',
		textClass:           'circles-text',
		valueStrokeClass:    'circles-valueStroke',
		maxValueStrokeClass: 'circles-maxValueStroke',
		styleWrapper:        true,
		styleText:           true
	});

	////////////////////////////////////////////////////////////////
	// API
	////////////////////////////////////////////////////////////////

	$scope.getPoints = function() {
		ApiService.score.get().then(function(response) {
			var points = response.data.points;
			$scope.data.garbage = response.data.status.garbage;
			$scope.data.parking = response.data.status.parking;
			$scope.data.homework = response.data.status.homework;
			if($scope.data.forcedTrash) {
				$scope.data.parking = true;
				if(points == 450) {
					points = 500;
				} else if(points == 150) {
					points = 200;
				}
			}
			$scope.data.points = points;
			if(points == 500) {
				$scope.forceComplete();
			}
			myCircle.update(points);
		});
	};

	$scope.setHomework = function() {
		$scope.data.homework = true;
		ApiService.homework.set(true).then(function() {
			$scope.getPoints();
		});
	};

	$scope.forceTrash = function() {
		$scope.data.forcedTrash = true;
		$scope.getPoints();
	};

	$scope.forceComplete = function() {
		ApiService.done();
	};

	$scope.reset = function() {
		$scope.data.forcedTrash = false;
		ApiService.reset();
	};

	////////////////////////////////////////////////////////////////
	// Setup
	////////////////////////////////////////////////////////////////

	$scope.poll = function() {
		$scope.getPoints();
	};

	$interval($scope.poll, 5000);
	$scope.poll();



});
