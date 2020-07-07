//let request = require('request');
//var moment = require('moment');
//var Promise = require('bluebird');

module.exports.url = 'http://6fc21dc1.ngrok.io';

module.exports.debug = function (logModule, message, data) {
	this.log('DEBUG', logModule, message, data);
};

module.exports.info = function (logModule, message, data) {
		this.log('INFO', logModule, message, data);
};

module.exports.error = function (logModule, message, data) {
	this.log('ERROR', logModule, message, data);
};

module.exports.log = function (level, logModule, message, data) {
	//var logModule = moment().format('D-MMM-YYYY HH:mm:ss SSS ') + '[' + level + '] [' + logModule + ']:';
	var logModule = '[' + level + '] [' + logModule + ']:';
	var data = (typeof data === 'undefined' ? '' : '( ' + JSON.stringify(data) + ' )');

	switch (level) {
	    case 'DEBUG':
	    	//console.info(logModule, message, data);
	    	console.info(logModule + message + data);
	        break;
	    case 'INFO':
	    	//console.info(logModule, message, data);
	    	console.info(logModule + message + data);
	        break;
	    case 'ERROR':
	    	//console.error(logModule, message, data);
	    	console.error(logModule + message + data);
	    	break;
	}
	//this.sendLog(logModule, message, data);
};

/*
exports.sendLog = function(logModule, message, data){
	return new Promise(function (resolve, reject) {
		var body = logModule +  message + data;
		try {
			var options = {
					url: exports.url,
					body: body
			};
			//console.info(logModule, 'sending log to ' + exports.url);
			request.post(options, function (error, response, body) {});
		} catch (e) {

		}
		resolve();
	});
}
*/

//this.info('Logger', 'my logger is loaded', {author: 'kyle'});
