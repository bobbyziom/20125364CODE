'use strict';

angular.module('users').controller('ManageController', ['$scope', '$modal', 'Authentication', 'Userdb', 
	function($scope, $modal, Authentication, Userdb) {

		$scope.authentication = Authentication;

		var find = function() {
			Userdb.list(function(data) {
				$scope.users = data;
			});
		};

		find();

		$scope.open = function (id) {

		    var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/users/views/edit-user.client.view.html',
		      controller: 'EditUserController',
		      size: 'lg',
		      resolve: {
		        userId: function () {
		          return id;
		        }
		      }
		    });

		    modalInstance.result.then(function () {
		      find();
		    }, function () {
		      find();
		    });

		};
		
	}
]);