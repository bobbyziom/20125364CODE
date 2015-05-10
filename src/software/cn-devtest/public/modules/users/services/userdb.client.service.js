'use strict';

angular.module('users').factory('Userdb', [ '$http',
	function($http) {
		// Userdb service logic
		// ...

		// Public API
		return {
			list: function(callback) {
				$http.get('/users').success(callback);
			},

			find: function(id, callback) {
				$http.get('/users/' + id).success(callback);
			},

			update: function(id, user, callback) {
				$http.put('/users/' + id, user).success(callback);
			},

			delete: function(id, callback) {
				$http.delete('/users/' + id).success(callback);
			}
		};
	}
]);