'use strict';

angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Device', 'Keen', 
	function($scope, $stateParams, $location, Device, Keen) {

		/* Controller methods */

		var refresh = function() {
			$scope.name = '';
			$scope.col = '';
			$scope.id = '';
			Device.list(function(data) {
				$scope.devices = data;
			});
			Keen.find(function(data) {
				$scope.keen = data;
			});
		};

		/* $scope methods */

		$scope.addContact = function() {
			Device.create({
				name: $scope.name,
				col: $scope.col,
				id: $scope.id
			}, function(data) {
				refresh();
			});
		};	

		$scope.remove = function() {
			Device.delete($scope.device._id, function(data) {
				$location.path('admin');
				refresh();
			});
		};

		$scope.findOne = function() {
			Device.get($stateParams.deviceId, function(data) {
				$scope.device = data;
			});
		};

		$scope.save = function() {
			Device.edit($scope.device._id, {
				name: $scope.device.name,
				col: $scope.device.col,
				id: $scope.device.id
			}, function(data) {
				console.log(data);
				$location.path('admin');
			});
		};

		$scope.cancel = function() {
			$location.path('admin');
		};

		$scope.editKeen = function() {
			Keen.edit({ 
				projectId: $scope.keen.projectId, 
				readKey: $scope.keen.readKey 
			}, function() {
				$location.path('admin');
			});
		};

		/* program */

		refresh();

	}
]);