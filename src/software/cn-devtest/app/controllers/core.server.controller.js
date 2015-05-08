'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    _ = require('lodash'),
    Keen = mongoose.model('Keen');

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});
};

/**
 * Get keen credentials
 */
exports.create = function(req, res) {
	var keen = new Keen(req.body);

	keen.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(keen);
		}
	});
};


/**
 * Show the current Device
 */
exports.read = function(req, res) {
	Keen.find(function(err, docs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(docs[0]);
		}
	});
};

/**
 * Update keen credentials
 */
exports.update = function(req, res) {

	Keen.findOneAndUpdate(req.params.projectId, req.body, function(err, docs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(docs);
		}
	});

};