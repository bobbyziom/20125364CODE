'use strict';

angular.module('admin').factory('Device', [ '$http',
	function($http) {
		// Device service logic
		// ...

		// Public API
		return {
			
			list: function(callback) {
				$http.get('/devices').success(callback);
			},
			
			create: function(device, callback) {
				$http.post('/devices', device).success(callback);
			},

			delete: function(id, callback) {
				$http.delete('/devices/' + id).success(callback);
			},

			get: function(id, callback) {
				$http.get('/devices/' + id).success(callback);
			},

			edit: function(id, device, callback) {
				$http.put('/devices/' + id, device).success(callback);
			}

		};
	}
]);