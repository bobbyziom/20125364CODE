'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Device Schema
 */
var DeviceSchema = new Schema({
	// Device model fields   
	// ...

	name: {
		type: String,
		default: ''
	},
	col: {
		type: String,
		default: ''
	},
	id: {
		type: String,
		default: ''
	}


});

mongoose.model('Device', DeviceSchema);