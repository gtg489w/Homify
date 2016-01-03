'use strict';

angular.module('canaryApp').controller('MainCtrl', function ($scope, $http, $timeout, $interval, ApiService) {

	var phone = ATT.rtc.Phone.getPhone();
	var myDHS = null;
	var accessToken = null;
	var myDHSURL = '@attwebrtc.com';


	$scope.hangup = function () {
		phone.hangup();
	};


	var getAccessToken = function () {
		$http.post('https://www.attwebrtc.com/hackathon/demo/dhs/token.php', JSON.stringify({ app_scope: "ACCOUNT_ID" })).then(function (result) {
			accessToken = result.data;
			phone.associateAccessToken({
				userId: 'levelupCallee',
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

	$http.get('https://www.attwebrtc.com/hackathon/demo/dhs/config.php').then(function (result) {
		myDHS = result.data;
		getAccessToken();

	});

	phone.on('call:incoming', function () {
		phone.answer({
			mediaType: 'video',
			localMedia: $('#local')[0],
			remoteMedia: $('#remote')[0]
		});
	});

});
