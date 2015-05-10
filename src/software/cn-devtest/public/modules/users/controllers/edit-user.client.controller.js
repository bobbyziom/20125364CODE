'use strict';

angular.module('users').controller('EditUserController', ['$scope', '$modalInstance', 'Userdb', 'userId',
	function($scope, $modalInstance, Userdb, userId) {
		
		$scope.roles = [ 'user', 'admin', 'super' ];
		$scope.role = $scope.roles[0];

		$scope.findOne = function() {
			Userdb.find(userId, function(data) {
				$scope.user = data;
				$scope.role = $scope.user.roles[$scope.user.roles.indexOf($scope.user.roles[0])];
			});
		};

		$scope.save = function() {
			$modalInstance.close();
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

	}
]);