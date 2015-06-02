'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('demo', {
			url: '/demo',
			templateUrl: 'modules/core/views/dash.client.view.html'
		}).
		state('dash', {
			url: '/dash',
			templateUrl: 'modules/core/views/dash.client.view.html'
		}).
		state('showDash', {
			url: '/dash/:deviceId',
			templateUrl: 'modules/core/views/dash.client.view.html'
		}).
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);