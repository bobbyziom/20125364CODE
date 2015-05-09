'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    _ = require('lodash'),
    Device = mongoose.model('Device');

/**
 * Create a Device
 */
exports.create = function(req, res) {
	console.log(req.body);
	var device = new Device(req.body);
	device.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(device);
		}
	});
};

/**
 * Show the current Device
 */
exports.read = function(req, res) {
	Device.findById(req.params.id, function(err, docs) {
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
 * Update a Device
 */
exports.update = function(req, res) {
	Device.update({ _id: req.params.id }, req.body, function(err, doc) {
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
 * Delete an Device
 */
exports.delete = function(req, res, id) {
	Device.findByIdAndRemove(req.params.id, function(err, docs) {
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
 * List of Devices
 */
exports.list = function(req, res) {
	Device.find(function(err, docs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(docs);
		}
	});
};