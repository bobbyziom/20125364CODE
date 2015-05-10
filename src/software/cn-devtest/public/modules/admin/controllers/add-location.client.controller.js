'use strict';

angular.module('admin').controller('AddLocationController', ['$scope', '$modalInstance', 'Location',
	function($scope, $modalInstance, Location) {

		$scope.save = function() {
			
			Location.create($scope.location, function(data) {
				$modalInstance.close();
			});
				
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

	}
]);