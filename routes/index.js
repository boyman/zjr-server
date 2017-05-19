'use strict';

const express = require('express');
const router = express.Router();

router.get('/login', require('./login'));
router.get('/user', require('./user'));
router.use('/event', require('./event.route'));
router.use('/test-install', require('./test-install.route'))

module.exports = router;