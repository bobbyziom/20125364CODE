'use strict';

angular.module('admin').factory('Keen', [ '$http',
	function($http) {
		// Keen service logic
		// ...

		// Public API
		return {
			create: function(keen, callback) {
				$http.post('/keen', keen).success(callback);
			},

			edit: function(keen, callback) {
				$http.put('/keen', keen).success(callback);
			},

			find: function(callback) {
				$http.get('/keen').success(callback);
			}
		};
	}
	
]);