'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Location Schema
 */
var LocationSchema = new Schema({

	name: String,
	adr: String,
	contact: {
		firstName: String,
		lastName: String,
		phone: Number,
		email: String
	},
	devices: [ String ]
	

});

mongoose.model('Location', LocationSchema);