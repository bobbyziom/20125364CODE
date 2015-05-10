'use strict';

module.exports = function(app) {

	var locations = require('../../app/controllers/location.server.controller');

	app.route('/locations')
		.get(locations.list);

	app.route('/location')
		.post(locations.create);

	app.route('/location/:id')
		.get(locations.read)
		.put(locations.update)
		.delete(locations.delete);

};