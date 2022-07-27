export default function cache(func) {
	let cache = {};
	const ret = function () {
		let n = ['$', arguments.length];

		for (let i = 0; i < arguments.length; ++i) n.push(' $', arguments[i]);
		n = n.join('');

		const ret = cache[n];
		return ret !== void 0 ? ret : cache[n] = func.apply(this, arguments);
	};

	ret.clearCache = () => {cache = {}};
	return ret;
}
