'use strict';

require('./globals');
require('./setup-qcloud-sdk');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');

const mongoose = require('mongoose');
const promise = require('bluebird');
const util = require('util');

//plugin bluebird promise in mongoose
mongoose.Promise = promise;

//connect to mongo db
const db = config.mongo.debug ? `${config.mongo.database}_test` : config.mongo.database;
const mongoUri = `${config.mongo.host}:${config.mongo.port}/${db}`;
mongoose.connect(mongoUri, {
	server : {
		socketOptions : {
			keepAlive : 1
		}
	}
});
mongoose.connection.on('error', () => {
	throw new Error(`unable to connect to database: ${mongoUri}`);
});

//print mongoose logs in dev env
if (config.mongo.debug) {
	mongoose.set('debug', (collectionName, method, query, doc) => {
		debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
	});
}

const app = express();

app.set('query parser', 'simple');
app.set('case sensitive routing', true);
app.set('jsonp callback name', 'callback');
app.set('strict routing', true);
app.set('trust proxy', true);

app.disable('x-powered-by');

// 记录请求日志
app.use(morgan('tiny'));

// parse `application/x-www-form-urlencoded`
app.use(bodyParser.urlencoded({ extended: true }));

// parse `application/json`
app.use(bodyParser.json());

app.use('/', require('./routes'));

// 打印异常日志
process.on('uncaughtException', error => {
    console.log(error);
});

// 启动server
http.createServer(app).listen(config.port, () => {
    console.log('Express server listening on port: %s', config.port);
});
