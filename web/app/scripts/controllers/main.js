'use strict';
angular.module('homifyApp').controller('MainCtrl', function ($scope, $http, ApiService) {

	$scope.setPoints = function() {
		ApiService.score.get();
	};

});
