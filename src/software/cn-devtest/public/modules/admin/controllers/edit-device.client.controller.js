'use strict';

angular.module('admin').controller('EditDeviceController', ['$scope', '$stateParams', '$location', '$modalInstance', 'Device', 'Keen', 'Imp', 'deviceId', 'Authentication',
	function($scope, $stateParams, $location, $modalInstance, Device, Keen, Imp, deviceId, Authentication) {

		$scope.authentication = Authentication;

		/* Controller methods */

		var updateDevice = function() {
			Imp.setDeviceName($scope.device.id, $scope.device.name, function() {});
			Imp.setBatteryTrigger($scope.device.id, $scope.device.notification.entity.battery.value, function(data) {});
			Imp.setMoistureTrigger($scope.device.id, $scope.device.notification.entity.moisture.value, function(data) {});
		};

		/* $scope methods */

		$scope.addEmail = function() {
			$scope.device.notification.contacts.push($scope.email);
			Imp.addEmail($scope.device.id, $scope.email, function(data) {
				Device.edit($scope.device._id, $scope.device, function() {
					$scope.email = '';
				});
			});
		};

		$scope.removeEmail = function(index) {
			var email = $scope.device.notification.contacts[index];
			Imp.removeEmail($scope.device.id, email, function(data) {
				$scope.device.notification.contacts.splice(index, 1);
				Device.edit($scope.device._id, $scope.device, function() {});
			});
		};

		$scope.remove = function() {
			Device.delete($scope.device._id, function(data) {
				$modalInstance.dismiss();
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
				$modalInstance.close();
			});
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

		$scope.findOne = function() {
			Device.get(deviceId, function(data) {
				$scope.device = data;
			});
		};

	}
]);