'use strict';

angular.module('admin').controller('LocationController', ['$scope', '$modal', 'Authentication', 'Location',
	function($scope, $modal, Authentication, Location) {

		$scope.authentication = Authentication;

		var refresh = function() {
			Location.list(function(data) {
				$scope.locations = data;
			});
		};

		refresh();
		
		$scope.checkUser = function() {
			if($scope.authentication.user.roles[0] !== 'guest') {
				return true;
			} else {
				return false;
			}
		};

		$scope.open = function (id) {

		    var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/admin/views/add-location.client.view.html',
		      controller: 'AddLocationController',
		      size: 'lg',
		      resolve: {
		        deviceId: function () {
		          return id;
		        }
		      }
		    });

		    modalInstance.result.then(function () {
		      refresh();
		    }, function () {
		      refresh();
		    });

		};

	}
]);