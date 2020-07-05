const http = require('http');
const log4js = require("log4js");
const raw = require('raw-body');
const inflate = require('inflation');

log4js.configure({
  appenders: {
	'file': { type: 'file', filename: './logs/all.log' },
	'out': { type: 'stdout' }
  },
  categories: {
    default: { appenders: [ 'file', 'out' ], level: 'debug' }
  }
});

const logger = log4js.getLogger();

function logClientInfo(req) {
	const ip = req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
	req.connection.remoteAddress || // 判断 connection 的远程 IP
	req.socket.remoteAddress || // 判断后端的 socket 的 IP
	req.connection.socket.remoteAddress;

	logger.info("client ip: ", ip, " port: ", req.socket.remotePort);
}

http.createServer((req, res) => {
	const opts = {};
	const len = req.headers['content-length'];
	const encoding = req.headers['content-encoding'] || 'identity';
	if (len && encoding === 'identity') opts.length = ~~len;
	opts.encoding = opts.encoding || 'utf8';
	opts.limit = opts.limit || '1mb';
	const strict = opts.strict !== false;
	raw(inflate(req), opts).then(str => {
		// logger.info(req);
		logger.info('-----------------------------------------------------');
		logger.info([req.method, req.url, 'HTTP/' + req.httpVersion].join(' '));
		logger.info(req.rawHeaders);
		if (str != '') logger.info(str);
		logClientInfo(req);
	});
  	res.writeHead(200, { 'Content-Type': 'text/plain' });
  	res.end('okay');
}).listen(8080);
