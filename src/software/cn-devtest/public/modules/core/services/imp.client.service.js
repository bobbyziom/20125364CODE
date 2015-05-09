'use strict';

angular.module('core').factory('Imp', [ '$http',
	function($http) {
		// Imp service logic
		// ...

		var agentUrl = 'https://agent.electricimp.com/';

		// Public API
		return {
			getReading: function(impId, callback) {

		      var req = {
		        method: 'GET',
		        url: agentUrl + impId + '/read',
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    }
		};
	}
]);