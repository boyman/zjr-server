'use strict';

const User = require('../models/user.model');
const LoginService = require('qcloud-weapp-server-sdk').LoginService;

module.exports = (req, res, next) => {
    LoginService.create(req, res).login((err, result) => {
        User.findOne({
            openId : result.userInfo.openId
        })
            .exec().then(user => {
            if (user == null) {
                const user = new User({
                    openId : result.userInfo.openId,
                    name : result.userInfo.nickName
                });
                user.save().then().catch(e => next(e))
            }
        }).catch(e => next(e));
    });
};