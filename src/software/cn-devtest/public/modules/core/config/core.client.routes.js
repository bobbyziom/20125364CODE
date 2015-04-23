'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider', 'tbkKeenConfigProvider',
	function($stateProvider, $urlRouterProvider, tbkKeenConfigProvider) {

		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('dash', {
			url: '/dash',
			templateUrl: 'modules/core/views/dash.client.view.html'
		}).
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);