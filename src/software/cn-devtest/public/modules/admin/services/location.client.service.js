'use strict';

angular.module('admin').factory('Location', [ '$http',
	function($http) {
		// Location service logic
		// ...

		// Public API
		return {
			create: function(location, callback) {
				$http.post('/location', location).success(callback);
			},

			read: function(id, callback) {
				$http.get('/location/' + id).success(callback);
			},

			update: function(id, location, callback) {
				$http.put('/location/' + id, location).success(callback);
			},

			delete: function(id, callback) {
				$http.delete('/location/' + id).success(callback);
			},

			list: function(callback) {
				$http.get('/locations').success(callback);
			}



		};
	}
]);