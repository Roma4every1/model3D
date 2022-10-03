export default function cache(fn: Function) {
	let cache = {};
	const ret = function () {
		let n = ['$', arguments.length];

		for (let i = 0; i < arguments.length; ++i) n.push(' $', arguments[i]);
		const m = n.join('');

		const ret = cache[m];
		return ret !== void 0 ? ret : cache[m] = fn.apply(this, arguments);
	};

	ret.clearCache = () => {cache = {}};
	return ret;
}
