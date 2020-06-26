const http = require('http');
const log4js = require("log4js");
const raw = require('raw-body');
const inflate = require('inflation');

log4js.configure({
  appenders: {
    everything: { type: 'file', filename: './logs/all.log' }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'debug' }
  }
});

const logger = log4js.getLogger();

http.createServer((req, res) => {
	const opts = {};
	const len = req.headers['content-length'];
	const encoding = req.headers['content-encoding'] || 'identity';
	if (len && encoding === 'identity') opts.length = ~~len;
	opts.encoding = opts.encoding || 'utf8';
	opts.limit = opts.limit || '1mb';
	const strict = opts.strict !== false;
	raw(inflate(req), opts).then(str => {
		logger.info('-----------------------------------------------------');
		logger.info([req.method, req.url, 'HTTP/', req.httpVersion].join(' '));
		logger.info(req.rawHeaders);
		logger.info(str);
	});
  	res.writeHead(200, { 'Content-Type': 'text/plain' });
  	res.end('okay');
}).listen(8080);
