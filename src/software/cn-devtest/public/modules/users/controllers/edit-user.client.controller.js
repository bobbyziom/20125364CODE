'use strict';

angular.module('users').controller('EditUserController', ['$scope', '$modalInstance', 'Userdb', 'userId',
	function($scope, $modalInstance, Userdb, userId) {
		
		$scope.roles = [ 'guest', 'user', 'admin', 'super' ];
		$scope.role = $scope.roles[0];

		$scope.findOne = function() {
			Userdb.find(userId, function(data) {
				$scope.user = data;
				$scope.role = $scope.user.roles[$scope.user.roles.indexOf($scope.user.roles[0])];
			});
		};

		$scope.save = function() {
			$scope.user.roles[0] = $scope.role;
			Userdb.update(userId, $scope.user, function(data) {
				console.log(data);
				$modalInstance.close();
			});
			
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

	}
]);