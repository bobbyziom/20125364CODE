'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    _ = require('lodash'),
    Location = mongoose.model('Location');

/**
 * Create a Location
 */
exports.create = function(req, res) {
	var loc = new Location(req.body);
	loc.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(loc);
		}
	});
};

/**
 * Show the current Location
 */
exports.read = function(req, res) {
	Location.findById(req.params.id, function(err, docs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(docs);
		}
	});
};

/**
 * Update a Location
 */
exports.update = function(req, res) {
	Location.update({ _id: req.params.id }, req.body, function(err, doc) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(doc);
		}
	});
};

/**
 * Delete an Location
 */
exports.delete = function(req, res, id) {
	Location.findByIdAndRemove(req.params.id, function(err, docs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(docs);
		}
	});
};

/**
 * List of Locations
 */
exports.list = function(req, res) {
	Location.find(function(err, docs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(docs);
		}
	});
};