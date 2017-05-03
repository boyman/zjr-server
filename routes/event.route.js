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
                     User.findOne({openId : data.userInfo.openId})
                         .exec()
                         .then(_user => {
                             if(_user != null) event.createdBy = _user.name;
                             res.json({
                    		code : 0,
                    		message : 'ok',
                    		event : event
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

module.exports = {
    new_get_event : new_get_event,
    get_event : get_event,
    get_my_host_events : get_my_host_events,
    add_event : add_event
}
