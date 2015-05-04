'use strict';

angular.module('core').factory('Imp', [ '$http',
	function($http) {
		// Imp service logic
		// ...

		// Public API
		return {
			getReading: function(impId, callback) {

		      var req = {
		        method: 'GET',
		        url: 'https://agent.electricimp.com/' + impId + '/read',
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    }
		};
	}
]);