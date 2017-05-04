'use strict';

const express = require('express');
const router = express.Router();

router.get('/login', require('./login'));
router.get('/user', require('./user'));
router.use('/event', require('./event.route'));

module.exports = router;