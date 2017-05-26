'use strict';

const express = require('express');
const router = express.Router();
const LoginService = require('qcloud-weapp-server-sdk').LoginService;
const Event = require('../models/event.model');
const User = require('../models/user.model');


router.get('/get', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.getDetail(req.query.id, data.userInfo.openId).then(event => {
                res.json({
                    code : 0,
                    message : 'ok',
                    event : event
                })
            });
        })
});

router.get('/thumbnail', (req, res, next) => {
    Event.getThumbnail(req.query.id).then(event => {
        res.json({
            code : 0,
            message : 'ok',
            event : event
        })
    }).catch(e => next(e));
});

router.get('/watch', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.watch(req.query.id, data.userInfo.openId).then(event => {
                res.json({
                    code : 0,
                    message : 'ok'
                })
            }).catch(e => next(e))
        });
});

router.get('/unwatch', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.unwatch(req.query.id, data.userInfo.openId).then(event => {
                res.json({
                    code : 0,
                    message : 'ok'
                })
            }).catch(e => next(e))
        });
});

router.get('/for_me', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    var myEvents = {
        hosting : [],
        participating : [],
        pending : [],
        watching : [],
    };
    const columns = 'name dateTime';
    loginService.check().then(
        data => {
            Event.hosting(data.userInfo.openId).then(
                events => {
                    myEvents.hosting = events;
                    Event.participating(data.userInfo.openId).then(
                        events => {
                            myEvents.participating = events;
                            Event.pending(data.userInfo.openId).then(events => {
                                myEvents.pending = events;
                                Event.watching(data.userInfo.openId).then(events => {
                                    myEvents.watching = events;
                                    res.json({
                                        code : 0,
                                        message : 'ok',
                                        events : myEvents
                                    })
                                })
                            })
                        }
                    )
                }
            ).catch(e => next(e));
        }
    );
});

// TODO: remove this
router.get('/all', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check().then(
        data => {
            Event.find({
                createdBy : {
                    $ne : data.userInfo.openId
                }
            }).select('name dateTime').exec().then(
                events => res.json({
                    code : 0,
                    message : 'ok',
                    events : events
                })
            ).catch(e => next(e));
        }
    );
});

router.post('/add', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            const event = new Event(req.body);
            event.createdBy = data.userInfo.openId;
            event.settings = req.body;
            event.dateTime = req.body.utcTime;
            debug(event)
            event.save()
                .then(savedEvent => res.json({
                    code : 0,
                    message : 'ok',
                    savedEvent : {
                        _id : savedEvent._id
                    },
                }))
        }).catch(e => next(e));
})

router.post('/edit', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.body.id).exec().then(event => {
                if(event == null) {
                    res.json({
                        code : 1,
                        message : 'invalid id',                        
                    })
                }
                if(event.createdBy != data.userInfo.openId) {
                    res.json({
                        code : 1,
                        message : 'unauthorized',
                    })
                }
                event.description = req.body.description;
                event.dateTime = req.body.utcTime;
                event.address = req.body.address;
                event.settings = {
                        needApprove : req.body.needApprove,
                        allowGuest : req.body.allowGuest,
                        allowSearch : req.body.allowSearch,
                        guestsVisibility : req.body.guestsVisibility,
                }
                debug(event)
                event.save().then(event => res.json({
                    code : 0,
                    message : 'ok'
                }))
            })
        }).catch(e => next(e));
    ;
})

router.use('/guest', require('./event/guest.route'))

module.exports = router;