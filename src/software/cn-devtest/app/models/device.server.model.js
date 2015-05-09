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

	id: {
		type: String,
		default: ''
	},
	name: {
		type: String,
		default: ''
	},
	config: {
		collect: Number,
		interval: Number
	},
	reading: {
		collect_cycle: Number,
        humidity: Number,
        lux: Number,
        temp: Number,
        moisture: Number,
        battery: Number
	},
	notification: {
        contacts: [ String ],
        entity: {
            battery: { 
            	value: Number,
            	sent: Boolean 
            },
            moisture: { 
            	value: Number, 
            	sent: Boolean 
            }
        },
        interval: Number
    }

});

mongoose.model('Device', DeviceSchema);