'use strict';

const LoginService = require('qcloud-weapp-server-sdk').LoginService;
const Event = require('../models/event.model');

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
	get_event : get_event,
	add_event : add_event
}
