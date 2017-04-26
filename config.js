'use strict';

module.exports = {
	/**
	 * Node 服务器启动端口，如果是自行搭建，请保证负载均衡上的代理地址指向这个端口
	 */
	port : '8443',
	mongo : {
		debug : true,
		host : 'mongodb://localhost',
		database : 'zhaojiren',
		port : 27017,
	},
};
