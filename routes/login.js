'use strict';

const User = require('../models/user.model');
const LoginService = require('qcloud-weapp-server-sdk').LoginService;

module.exports = (req, res, next) => {
console.log("LOGIN")
    LoginService.create(req, res).login((err, result) => {
console.log("LOGIN callback")
        User.findOne({openId : result.userInfo.openId})
            .exec().then(user => {
console.log(user)
                if(user == null) {
                    const user = new User({openId: result.userInfo.openId, name: result.userInfo.nickName});
                    user.save().then().catch(e=>next(e))
                }
            }).catch(e=>next(e));
console.log("LOGIN end callback")
    });
};
