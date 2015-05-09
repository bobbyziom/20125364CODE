'use strict';

angular.module('admin').controller('EditDeviceController', ['$scope', '$stateParams', '$location', 'Device', 'Keen', 'Imp',
	function($scope, $stateParams, $location, Device, Keen, Imp) {
		
		/* Controller methods */

		var updateDevice = function() {
			Imp.setKeen($scope.device.id, $scope.device.device.col, function() {});
			Imp.setDeviceName($scope.device.id, $scope.device.device.name, function() {});
			Imp.setBatteryTrigger($scope.device.id, $scope.device.notification.entity.battery.value, function() {});
			Imp.setMoistureTrigger($scope.device.id, $scope.device.notification.entity.battery.value, function() {});
		};

		/* $scope methods */

		$scope.addEmail = function() {
			$scope.device.notification.contacts.push($scope.email);
			Imp.addEmail($scope.device.id, $scope.email, function(data) {
				console.log(data);
				Device.edit($scope.device._id, $scope.device, function() {
					$scope.email = '';
				});
			});
		};

		$scope.remove = function() {
			Device.delete($scope.device._id, function(data) {
				$location.path('admin');
			});
		};

		$scope.editKeen = function() {
			Keen.edit({ 
				projectId: $scope.keen.projectId, 
				readKey: $scope.keen.readKey 
			}, function() {
				$location.path('admin');
			});
		};

		$scope.save = function() {
			Device.edit($scope.device._id, $scope.device, function(data) {
				updateDevice();
				$location.path('admin');
			});
		};

		$scope.cancel = function() {
			$location.path('admin');
		};

		$scope.findOne = function() {
			Device.get($stateParams.deviceId, function(data) {
				$scope.device = data;
			});
		};

	}
]);