'use strict';

const LoginService = require('qcloud-weapp-server-sdk').LoginService;
const Event = require('../models/event.model');
const User = require('../models/user.model');

const get_event = (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
                .then(data => {
            Event.findById(req.query.id).exec()
                .then(event => res.json({
                    code : 0,
                    message : 'ok',
                    event : event
                }))
                .catch(e => next(e));
        });
};

const new_get_event = (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
                .then(data => {
            Event.findById(req.query.id).exec()
                .then(event => {
                     User.findOne({openId : event.createdBy})
                         .exec()
                         .then(_user => {
                             res.json({
                    		code : 0,
                    		message : 'ok',
                    		event : {
_id : event._id,
name : event.name,
createdBy : event.createdBy,
dateTime : event.dateTime,
description : event.description,
numGuests : event.guests.length,
address : event.address,
numPendingGuests : event.pendingGuests.length,
isMine : event.createdBy == data.userInfo.openId,
participated : (event.guests.indexOf(data.userInfo.openId)>-1),
pending : (event.pendingGuests.indexOf(data.userInfo.openId)>-1),
watching : (event.watchers.indexOf(data.userInfo.openId)>-1),
host : (_user==null?event.createdBy:_user.name)
}
                	    })
                         }).catch(e => next(e))
        });})
};



const get_my_host_events = (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check().then(
        data => {
            Event.find({createdBy : data.userInfo.openId}).select('name dateTime').exec().then(
                events => res.json({
                    code : 0,
                    message : 'ok',
                    events : events
                })
            ).catch(e => next(e));
        }
    );
};

const all_events = (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check().then(
data => {
            Event.find().select('name dateTime').exec().then(
                events => res.json({
                    code : 0,
                    message : 'ok',
                    events : events
                })
            ).catch(e => next(e));
        }
    );
};

const add_event = (req, res, next) => {
    const loginService = LoginService.create(req, res);

    loginService.check()
        .then(data => {
            const event = new Event(req.query);
            event.createdBy = data.userInfo.openId;
            console.log(req.query.date+' '+req.query.time);
            event.dateTime = new Date(req.query.date+' '+req.query.time);
            event.save()
                .then(savedEvent => res.json({
                    code : 0,
                    message : 'ok',
                    savedEvent : savedEvent
                }))
                .catch(e => next(e));

        });
};

const participate = (req, res, next) => {
    const loginService = LoginService.create(req, res);

    loginService.check()
        .then(data => {
Event.findById(req.query.id).exec().then(
event => {
if(event.guests.indexOf(data.userInfo.openId)>-1 || event.pendingGuests.indexOf(data.userInfo.openId)>-1)
res.json({code:1, message:'duplicated'});
if(event.settings.needApprove) event.pendingGuests.push(data.userInfo.openId);
else event.guests.push(data.userInfo.openId);
event.save().then(savedEvent=>res.json({code:0, message:'ok'})).catch(e=>next(e));
}
).catch(e=>next(e));
});
}

const unparticipate = (req, res, next) => {
    const loginService = LoginService.create(req, res);

    loginService.check()
        .then(data => {
Event.findById(req.query.id).exec().then(
event => {
if(event.guests.indexOf(data.userInfo.openId)<0 && event.pendingGuests.indexOf(data.userInfo.openId)<0)
res.json({code:1, message:'duplicated'});
event.pendingGuests.pull(data.userInfo.openId);
event.guests.pull(data.userInfo.openId);
event.save().then(savedEvent=>res.json({code:0, message:'ok'})).catch(e=>next(e));
}
).catch(e=>next(e));
});
}

module.exports = {
    new_get_event : new_get_event,
    get_event : get_event,
    get_my_host_events : get_my_host_events,
    all_events : all_events,
    participate : participate,
    unparticipate : unparticipate,
    add_event : add_event
}
