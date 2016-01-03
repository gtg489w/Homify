'use strict';
angular.module('homifyApp').controller('MainCtrl', function ($scope, $http, ApiService) {

	////////////////////////////////////////////////////////////////
	// Config
	////////////////////////////////////////////////////////////////

	var phone = ATT.rtc.Phone.getPhone();
	var myDHS = null;
	var accessToken = null;
	var myDHSURL = '@attwebrtc.com';



	////////////////////////////////////////////////////////////////
	// Caller WebRTC
	////////////////////////////////////////////////////////////////

	var getAccessToken = function () {
		$http.post('https://www.attwebrtc.com/hackathon/demo/dhs/token.php', JSON.stringify({ app_scope: "ACCOUNT_ID" })).then(function (result) {
			accessToken = result.data;
			phone.associateAccessToken({
				userId: 'levelupCaller',
				token: accessToken.access_token,
				success: function () {
					phone.login({ token: accessToken.access_token });

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

	$http.get('https://www.attwebrtc.com/hackathon/demo/dhs/config.php').then(function (result) {
		myDHS = result.data;
		getAccessToken();

	});













	$scope.getPoints = function() {
		ApiService.score.get();
		myCircle.update(50);
	};

	$scope.setHomework = function() {
		ApiService.homework.set(true);
	};



var myCircle = Circles.create({
  id:                  'circles-1',
  radius:              60,
  value:               43,
  maxValue:            100,
  width:               10,
  text:                function(value){return value + '%';},
  colors:              ['#D3B6C6', '#4B253A'],
  duration:            400,
  wrpClass:            'circles-wrp',
  textClass:           'circles-text',
  valueStrokeClass:    'circles-valueStroke',
  maxValueStrokeClass: 'circles-maxValueStroke',
  styleWrapper:        true,
  styleText:           true
});






});
