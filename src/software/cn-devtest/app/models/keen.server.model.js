'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Keen Schema
 */
var KeenSchema = new Schema({

		projectId: {
			type: String,
			default: ''
		},
		readKey: {
			type: String,
			default: ''
		}

});

mongoose.model('Keen', KeenSchema);