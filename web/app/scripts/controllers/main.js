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
		restarting: false
	};

	$scope.data = {
		points: null,
		homework: false
	};

	////////////////////////////////////////////////////////////////
	// Caller WebRTC
	////////////////////////////////////////////////////////////////

	phone.on('error', function () {
		$scope.webrtc.error = true;
	});

	$scope.callDispatcher = function () {
		dailThePhone();
	};

	$scope.hangup = function () {
		phone.hangup();
		$scope.hide.video = true;
	};

	var getAccessToken = function () {
		$http.post('https://www.attwebrtc.com/hackathon/demo/dhs/token.php', JSON.stringify({ app_scope: "ACCOUNT_ID" })).then(function (result) {
			accessToken = result.data;
			phone.associateAccessToken({
				userId: 'levelupCaller',
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
			destination: phone.cleanPhoneNumber("levelupCallee" + myDHSURL),
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
			$scope.data.points = points;
			myCircle.update(points);
		});
	};

	$scope.setHomework = function() {
		$scope.data.homework = true;
		ApiService.homework.set(true).then(function() {
			$scope.getPoints();
		});
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
