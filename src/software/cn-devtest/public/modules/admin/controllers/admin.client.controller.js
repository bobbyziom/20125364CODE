'use strict';

angular.module('admin').controller('AdminController', ['$scope', '$modal', 'Device', 'Keen', 'Imp', 'Authentication',
	function($scope, $modal, Device, Keen, Imp, Authentication) {

		$scope.authentication = Authentication;

		$scope.isAboveAdmin = function() {
			if($scope.authentication.user.roles[0] === 'super' || $scope.authentication.user.roles[0] === 'admin') {
				return true;
			} else {
				return false;
			}
		};

		$scope.refresh = function() {
			$scope.name = '';
			$scope.id = '';
			Device.list(function(data) {
				$scope.devices = data;
			});
			Keen.find(function(data) {
				$scope.keen = data;
			});
		};

		/* $scope methods */

		$scope.addDevice = function() {

			// send config to device and get back device setup
			// then store in database
			Imp.setup($scope.id, function(setup) {
				setup.id = $scope.id;
				setup.name = $scope.name;
				Device.create(setup, function(data) {
					$scope.refresh();
				});
			});

		};	

		$scope.updateDevice = function(id, index) {
			Device.edit(id, $scope.devices[index], function(data) {
				// maybe a toast here to give user feedback
			});
		};

		$scope.open = function (id) {

		    var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/admin/views/edit-device.client.view.html',
		      controller: 'EditDeviceController',
		      size: 'lg',
		      resolve: {
		        deviceId: function () {
		          return id;
		        }
		      }
		    });

		    modalInstance.result.then(function () {
		      $scope.refresh();
		    }, function () {
		      $scope.refresh();
		    });

		};

	}
]);