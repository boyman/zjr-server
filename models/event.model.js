const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const Schema = mongoose.Schema;

const EventSchema = new Schema({
	name : {
		type : String,
		required : true
	},
	description : {
		type : String,
		required : true
	},
	dateTime : {
		type : Date,
		required : true
	},
	address : {
		type : String,
		required : true
	},
	settings : {
		needApprove : {
			type : Boolean,
			default : false
		},
		allowGuest : {
			type : Boolean,
			default : true
		},
		allowSearch : {
			type : Boolean,
			default : true
		},
		privateGuestList : {
			type : Boolean,
			default : true
		}
	},
	guests : {
		type : [ String ]
	},
	pendingGuests : {
		type : [ String ]
	},
	createdBy : {
		type : String,
		required : true
	},
	createdDateTime : {
		type : Date,
		default : Date.now
	}
});

module.exports = mongoose.model('Event', EventSchema);