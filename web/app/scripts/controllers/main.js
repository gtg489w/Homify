'use strict';
angular.module('homifyApp').controller('MainCtrl', function ($scope, $http, ApiService) {

	$scope.getPoints = function() {
		ApiService.score.get();
	};

	$scope.setPoints = function() {
		ApiService.score.set(100);
	};

});
