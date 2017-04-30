'use strict';

const express = require('express');
const router = express.Router();
const event = require('./event.route');

router.get('/', require('./welcome'));
router.get('/login', require('./login'));
router.get('/user', require('./user'));
router.all('/tunnel', require('./tunnel'));
router.get('/add_event', event.add_event);
router.get('/get_event', event.get_event);
router.get('/get_my_host_events', event.get_my_host_events);

module.exports = router;
