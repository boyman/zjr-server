'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	openId : {
		type : String,
		required : true
	},
	name : {
		type : String,
		required : true
	}
});

module.exports = mongoose.model('User', UserSchema);
