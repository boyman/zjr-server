'use strict';

const LoginService = require('qcloud-weapp-server-sdk').LoginService;
const Event = require('../models/event.model');

module.exports = (req, res) => {
	const loginService = LoginService.create(req, res);

	loginService.check()
		.then(data => {
			const event = new Event(req.query);
			event.createdBy = data.userInfo.openid;
			event.dateTime = new Date(event.dateTime);
			event.save()
				.then(savedEvent => res.json({
					code : 0,
					message : 'ok',
					savedEvent : savedEvent
				}))
				.catch(e => next(e));

		});
};