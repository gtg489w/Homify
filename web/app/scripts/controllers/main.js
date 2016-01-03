'use strict';
angular.module('homifyApp').controller('MainCtrl', function ($scope, $http, ApiService) {

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
