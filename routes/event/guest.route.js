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
            Event.findById(req.query.id).select('guests pendingGuests').exec().then(
                event => res.json({
                    code : 0,
                    message : 'ok',
                    guests : {
                    	guests: event.guests,
                    	pendingGuests: (event.createdBy == data.userInfo.openId ? event.pendingGuests : [])
                    }
                }))
        });
})

router.get('/participate', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec().then(
                event => {
                	let guestIdx = event.participated(data.userInfo.openId)
                    if (guestIdx > -1 || event.participatePending(data.userInfo.openId) > -1)
                        res.json({
                            code : 1,
                            message : 'duplicated'
                        });
                    if (event.settings.needApprove) event.pendingGuests.push(data.userInfo.openId);
                    else event.guests.push({ openId : data.userInfo.openId, guests : [] });
                    event.save().then(savedEvent => res.json({
                        code : 0,
                        message : 'ok'
                    })).catch(e => next(e));
                }
            ).catch(e => next(e));
        });
});

router.get('/unparticipate', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec().then(event => {
            	let guestIdx = event.participated(data.userInfo.openId)
                if (guestIdx < 0 && event.participatePending(data.userInfo.openId) < 0) {
                    res.json({
                        code : 1,
                        message : 'duplicated'
                    });
                }
            	if(guestIdx >= 0) event.guests.splice(guestIdx, 1)
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