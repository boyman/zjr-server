'use strict';

const express = require('express');
const router = express.Router();
const LoginService = require('qcloud-weapp-server-sdk').LoginService;
const Event = require('../../models/event.model');
const User = require('../../models/user.model');

router.get('/get', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.getGuests(req.query.id, data.userInfo.openId).then(
                guests => res.json({
                    code : 0,
                    message : 'ok',
                    guests : guests
                })).catch(e => next(e));
        });
})

router.get('/my', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.getMyGuests(req.query.id, data.userInfo.openId).then(event => {
                res.json({
                    code : 0,
                    message : 'ok',
                    event : event
                })
            });
        })
});

router.post('/bring', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.bringGuests(req.query.id, data.userInfo.openId, req.body.guests).then(
                guests => res.json({
                    code : 0,
                    message : 'ok'
                })).catch(e => next(e));
        });
})

router.get('/participate', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec().then(
                event => {
                    if (event.participated(data.userInfo.openId) > -1
                        || event.participatePending(data.userInfo.openId) > -1) {
                        res.json({
                            code : 1,
                            message : 'duplicated'
                        });
                    }
                    if (event.settings.needApprove) {
                        event.pendingGuests.push(data.userInfo.openId);
                    } else {
                        event.guests.push({
                            openId : data.userInfo.openId,
                            guests : []
                        });
                    }
                    event.watchers.pull(data.userInfo.openId);
                    event.save().then(savedEvent => res.json({
                        code : 0,
                        message : 'ok'
                    }))
                }
            )
        }).catch(e => next(e));;
});

router.get('/approve', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec().then(
                event => {
                    if(!event || event.createdBy != data.userInfo.openId) {
                        res.json({
                            code : 1,
                            message : 'not your event'
                        })
                    }
                    if(event.participated(req.query.guest) > -1) {
                        res.json({
                            code : 0,
                            message : 'duplicated'
                        })
                    }
                    event.pendingGuests.pull(req.query.guest);
                    event.guests.push({
                        openId : req.query.guest,
                        guests : []
                    })
                    event.save().then(savedEvent => res.json({
                        code : 0,
                        message : 'ok'
                    }))
                }
            )
        }).catch(e => next(e));;
});

router.get('/delete_guest', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec().then(
                event => {
                    if(!event || event.createdBy != data.userInfo.openId) {
                        res.json({
                            code : 1,
                            message : 'not your event'
                        })
                    }
                    var guestIdx = event.participated(req.query.guest)
                    if(guestIdx < 0) {
                        res.json({
                            code : 0,
                            message : 'duplicated'
                        })
                    }
                    event.guests.splice(guestIdx, 1)
                    event.save().then(savedEvent => res.json({
                        code : 0,
                        message : 'ok'
                    }))
                }
            )
        }).catch(e => next(e));;
});

router.get('/delete_pending', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec().then(
                event => {
                    if(!event || event.createdBy != data.userInfo.openId) {
                        res.json({
                            code : 1,
                            message : 'not your event'
                        })
                    }
                    if(event.participatePending(req.query.guest) < 0) {
                        res.json({
                            code : 0,
                            message : 'duplicated'
                        })
                    }
                    event.pendingGuests.pull(req.query.guest)
                    event.save().then(savedEvent => res.json({
                        code : 0,
                        message : 'ok'
                    }))
                }
            )
        }).catch(e => next(e));;
});

router.get('/unparticipate', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec().then(event => {
                var guestIdx = event.participated(data.userInfo.openId)
                if (guestIdx < 0 && event.participatePending(data.userInfo.openId) < 0) {
                    res.json({
                        code : 1,
                        message : 'duplicated'
                    });
                }
                if (guestIdx >= 0) event.guests.splice(guestIdx, 1)
                else event.pendingGuests.pull(data.userInfo.openId);

                event.save().then(savedEvent => res.json({
                    code : 0,
                    message : 'ok'
                })).catch(e => next(e));
            }
            ).catch(e => next(e));
        });
});

module.exports = router;