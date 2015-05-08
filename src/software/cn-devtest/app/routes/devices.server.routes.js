'use strict';

module.exports = function(app) {
	// Routing logic   
	// ...

	var devices = require('../../app/controllers/devices.server.controller');

	app.route('/devices')
		.get(devices.list)
		.post(devices.create);

	app.route('/devices/:id')
		.get(devices.read)
		.put(devices.update)
		.delete(devices.delete);

};