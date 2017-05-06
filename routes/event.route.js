'use strict';

const express = require('express');
const router = express.Router();
const LoginService = require('qcloud-weapp-server-sdk').LoginService;
const Event = require('../models/event.model');
const User = require('../models/user.model');

/**
 * Get detail of a single event
 * Path: /event/get?id=<event_id>
 */
router.get('/get', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            Event.findById(req.query.id).exec()
                .then(event => {
                    User.findOne({
                        openId : event.createdBy
                    })
                        .exec()
                        .then(_user => {
                            res.json({
                                code : 0,
                                message : 'ok',
                                event : Event.toResponseObject(event, data.userInfo, _user)
                            })
                        }).catch(e => next(e))
                });
        })
});

router.get('/my_hosting', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check().then(
        data => {
            Event.find({
                createdBy : data.userInfo.openId
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

// TODO: make this POST
router.get('/add', (req, res, next) => {
    const loginService = LoginService.create(req, res);
    loginService.check()
        .then(data => {
            const event = new Event(req.query);
            event.createdBy = data.userInfo.openId;
            console.log(req.query.date + ' ' + req.query.time);
            event.dateTime = new Date(req.query.date + ' ' + req.query.time);
            event.save()
                .then(savedEvent => res.json({
                    code : 0,
                    message : 'ok',
                    savedEvent : { _id : savedEvent._id },
                }))
                .catch(e => next(e));
        });
})

router.use('/guest', require('./event/guest.route'))

module.exports = router;