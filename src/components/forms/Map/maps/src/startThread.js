import logger from "./logger"


export default function startThread(proc) {
	return new Promise(function (resolve, reject) {
		let i;
		try {
			i = proc();
		} catch (err) {
			logger.debug('thread', err);
			return reject(err);
		}
		next();

		function step(iMethod, result) {
			let v;
			try {
				v = iMethod.call(i, result);
			} catch (err) {
				logger.debug('thread', err);
				return reject(err);
			}

			if (v.done) return resolve(v.value);
			if (v.value && v.value.then) v.value.then(next, fail);
		}

		function next(result) {return step(i.next, result)}
		function fail(result) {return step(i.throw, result)}
	});
}

export const sleep = (milliseconds) => new Promise( resolve => setTimeout(resolve, milliseconds));
