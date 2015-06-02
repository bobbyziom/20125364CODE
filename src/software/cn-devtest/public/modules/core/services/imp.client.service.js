'use strict';

angular.module('core').factory('Imp', [ '$http',
	function($http) {
		// Imp service logic
		// ...

		var agentUrl = 'https://agent.electricimp.com/';

		// Public API
		return {
			setup: function(impId, callback) {

				var req = {
					method: 'POST',
					url: agentUrl + impId + '/setup',
					headers: {'Content-Type': 'application/json'},
				};

				$http(req).success(callback);

			},

			getReading: function(impId, callback) {

		      var req = {
		        method: 'GET',
		        url: agentUrl + impId + '/read',
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setKeen: function(impId, keenCollection, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/collection/' + keenCollection,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setDeviceName: function(impId, deviceName, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/name/' + deviceName,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    addEmail: function(impId, email, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/email/add/' + email,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    removeEmail: function(impId, email, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/email/remove/' + email,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setBatteryTrigger: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/battery/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setMoistureTrigger: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/moisture/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setWakingInterval: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/config/interval/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setCollectAmount: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/config/collect/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    }


		};
	}
]);