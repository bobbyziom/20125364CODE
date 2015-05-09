'use strict';

angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Device', 'Keen', 'Imp',
	function($scope, $stateParams, $location, Device, Keen, Imp) {

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

			// send config to device and get back device setup
			// then store in database
			Imp.setup($scope.id, {
				name: $scope.name,
				col: $scope.col
			}, function(setup) {
				setup.id = $scope.id;
				Device.create(setup, function(data) {
					console.log('data: ' + data);
					refresh();
				});
			});

		};	

		$scope.findOne = function() {
			refresh();
		};

	}
]);