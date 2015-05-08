'use strict';

//Setting up route
angular.module('admin').config(['$stateProvider', 
	function($stateProvider) {
		// Admin state routing
		$stateProvider.
		state('keen', {
			url: '/keen',
			templateUrl: 'modules/admin/views/keen.client.view.html'
		}).
		state('editDevice', {
			url: '/admin/:deviceId/edit',
			templateUrl: 'modules/admin/views/edit-device.client.view.html'
		}).
		state('admin', {
			url: '/admin',
			templateUrl: 'modules/admin/views/admin.client.view.html'
		});
	}
]);