'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');

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
        type : [ {
        	openId : {
        		type : String,
        		required : true
        	},
        	guests : [String]
        } ]
    },
    pendingGuests : {
        type : [ String ]
    },
    watchers : [ String ],
    createdBy : {
        type : String,
        required : true
    },
    createdDateTime : {
        type : Date,
        default : Date.now
    }
});

EventSchema.methods.participated = function (openId) {
	let i;
	for(i = 0; i < this.guests.length; i++) {
		if(this.guests[i].openId == openId) return i;
	}
	return -1;
};

EventSchema.methods.participatePending = function (openId) {
	return this.pendingGuests.indexOf(openId);
};

EventSchema.statics.toResponseObject = (event, wxuser, _user) => {
    return {
        _id : event._id,
        name : event.name,
        createdBy : event.createdBy,
        dateTime : event.dateTime,
        description : event.description,
        numGuests : event.guests.length,
        address : event.address,
        numPendingGuests : event.pendingGuests.length,
        isMine : event.createdBy == wxuser.openId,
        participated : (event.participated(wxuser.openId) > -1),
        pending : (event.participatePending(wxuser.openId) > -1),
        watching : (event.watchers.indexOf(wxuser.openId) > -1),
        host : _user.name
    }
};

module.exports = mongoose.model('Event', EventSchema);