'use strict';

angular.module('admin').controller('AdminController', ['$scope', '$modal', 'Device', 'Keen', 'Imp',
	function($scope, $modal, Device, Keen, Imp) {

		/* Controller methods */

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

		$scope.addContact = function() {

			// send config to device and get back device setup
			// then store in database
			Imp.setup($scope.id, $scope.name, function(setup) {
				setup.id = $scope.id;
				Device.create(setup, function(data) {
					$scope.refresh();
				});
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