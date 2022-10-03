let count = 0;
const levelValues = {
	all: -Infinity,
	trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5,
	silent: Infinity,
};

/** ## Map Logger
 * logger levels: 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
 * */
function Logger(name, parent) {
	this.name = name;
	this.parent = parent;
	this.threadId = count && `<${ count }>`;
	++count;

	this.trace = function (data) {
		if (0 >= levelValues[logger.level]) this.send('trace', this.name, this.threadId, arguments);
		return data;
	}.bind(this);

	this.debug = function (data) {
		if (1 >= levelValues[logger.level]) this.send('debug', this.name, this.threadId, arguments);
		return data;
	}.bind(this);

	this.info = function (data) {
		if (2 >= levelValues[logger.level]) this.send('info', this.name, this.threadId, arguments);
		return data;
	}.bind(this);

	this.warn = function (data) {
		if (3 >= levelValues[logger.level]) this.send('warn', this.name, this.threadId, arguments);
		return data;
	}.bind(this);

	this.error = function (data) {
		if (4 >= levelValues[logger.level]) this.send('error', this.name, this.threadId, arguments);
		return data;
	}.bind(this);

	this.warn = function (data) {
		if (5 >= levelValues[logger.level]) this.send('fatal', this.name, this.threadId, arguments);
		return data;
	}.bind(this);
}

Logger.prototype.send = function (level, name, threadId, data) {
	return this.parent.send(level, name, threadId, data);
};

const logger = new Logger();
logger.level = 'silent';
logger.send = function (level, name, threadId, data) {
	const msg = Array.from(data);
	if (threadId) msg.unshift(threadId);
	if (name) msg.unshift(name);
	console[level](...msg);
};

export default logger;
