var winston = require('winston');
process.env.NODE_ENV = 'development';
var ENV = process.env.NODE_ENV; //app.get('env')

function getLogger(module) {

	var path = module.filename.split('/').splice(-2).join('/');

	var Logger  = new winston.Logger({
		transports : [
			new winston.transports.Console({
				colorize: true,
				level: ENV == 'development' ? 'debug' : 'error',
				label: path
			})
		]
	});

	return Logger;
}
module.exports = getLogger;