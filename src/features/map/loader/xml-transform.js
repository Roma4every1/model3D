import { extend, mapValues, constant, toPairs, fromPairs } from 'lodash';


export default extend(function (transforms) {
	transforms = mapValues(transforms, v => xmlType(v));

	const transform = (xml) => {
		if (transforms[xml.name]) {
			return transforms[xml.name](xml, void 0, transform)
		}
	};
	return transform;
}, {
	transform: (xml, __, transform) => transform(xml, void 0, transform),
	string: attribute(a => a),
	number: attribute(a => Number(+a)),
	boolean: attribute(a => Boolean(a && +a)),
	path: attribute(a => a.replace(/\\/g, '/')),
	element: fSelf(xml => xml.name),
});

function fSelf(f) {
	return function self() {
		return arguments.length === 0 ? self : f.apply(null, arguments);
	}
}

function attribute(type) {
	return fSelf(function (name) {
		return arguments.length === 1 ? xml => read(xml, name) : read.apply(null, arguments);
	})

	function read(xml, name) {
		return xml.attributes == null || xml.attributes[name] == null
			? void 0
			: type(xml.attributes[name]);
	}
}

function xmlType(desc, attribute) {
	if (typeof desc == 'function')
		return desc
	else if (
		typeof desc === 'string' ||
		typeof desc === 'number' ||
		typeof desc === 'boolean' ||
		typeof desc === 'undefined'
	)
		return constant(desc)
	else if (Array.isArray(desc)) {
		desc = desc.slice();
		let name;
		let index;

		if (desc.length > 1 && desc[0] instanceof RegExp)
			name = desc.shift()
		else if (desc.length > 1 && typeof desc[0] === 'string')
			name = desc.shift()
		else if (typeof attribute == 'string')
			name = attribute
		if (desc.length > 1 && typeof desc[0] === 'number')
			index = desc.shift()
		if (desc.length === 0)
			throw new Error('wrong description')

		const descE = xmlType(desc.shift());

		if (!(desc.length === 0 || (desc.length === 1 && typeof desc[0] === "function")))
			throw new Error('wrong description')

		const descT = desc.shift();

		return (xml, __, transform) => {
			let ret = xml.elements || [];

			if (typeof name == 'string')
				ret = ret.filter(c => c.name === name)
			else if (name)
				ret = ret.filter(c => c.name && c.name.match(name))
			if (index)
				ret = ret.slice(index, index + 1)
			ret = ret
				.map(a => descE(a, void 0, transform))
				.filter(c => c !== void 0)
			if (index)
				ret = ret[0]
			if (descT)
				ret = descT(ret)
			return ret
		}
	} else {
		desc = toPairs(desc).map(([name, fun]) => [
			name, xmlType(fun, name)])
		return (xml, __, transform) => fromPairs(
			[...(desc
				.map(([name, fun]) => [name, fun(xml, name, transform)])
				.filter(([, value]) => value !== void 0)),
				['attrTable', fromPairs(toPairs(xml.attributes).filter(a => !desc.some(d => d[0] === a[0])))]
			]
		)
	}
}
