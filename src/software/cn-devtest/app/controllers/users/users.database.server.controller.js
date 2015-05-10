'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Create a Usersdatabase
 */
exports.create = function(req, res) {

};

/**
 * Show the current Usersdatabase
 */
exports.read = function(req, res) {
	User.findById(req.params.id, function(err, docs) {
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
 * Update a Usersdatabase
 */
exports.update = function(req, res) {

};

/**
 * Delete an Usersdatabase
 */
exports.delete = function(req, res) {

};

/**
 * List of Usersdatabases
 */
exports.list = function(req, res) {
	User.find(function(err, docs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(docs);
		}
	});
};