// module xmlTransform

var _ = require("lodash");

module.exports = _.extend(function (transforms) {
	transforms = _.mapValues(transforms, v => xmlType(v))
	var transform = xml => transforms[xml.name](xml, void 0, transform)
	return transform
}, {
	transform: (xml, __, transform) => transform(xml, void 0, transform),
	string: attribute(a => a),
	number: attribute(a => Number(+a)),
	boolean: attribute(a => Boolean(a && +a)),
	path: attribute(a => a.replace(/\\/g, "/")),
	element: fself(xml => xml.name),
});

function fself(f) {
	return function self() {
		if (arguments.length === 0)
			return self
		else
			return f.apply(null, arguments)
	}
}

function attribute(type) {
	return fself(function (name) {
		if (arguments.length === 1)
			return xml => read(xml, name)
		else
			return read.apply(null, arguments)
	})
	function read(xml, name) {
		return xml.attributes == null || xml.attributes[name] == null
			? void 0 : type(xml.attributes[name])
	}
}

function xmlType(descr, attribute) {
	if (typeof descr == "function")
		return descr
	else if (typeof descr === "string" || typeof descr === "number" || typeof descr === "boolean" || typeof descr === "undefined")
		return _.constant(descr)
	else if (Array.isArray(descr)) {
		descr = descr.slice()
		var name
		var index
		if (descr.length > 1 && descr[0] instanceof RegExp)
			name = descr.shift()
		else if (descr.length > 1 && typeof descr[0] === "string")
			name = descr.shift()
		else if (typeof attribute == "string")
			name = attribute
		if (descr.length > 1 && typeof descr[0] === "number")
			index = descr.shift()
		if (descr.length === 0)
			throw new Error("wrong description")
		var descrE = xmlType(descr.shift())
		if (!(descr.length === 0 || (descr.length === 1 && typeof descr[0] === "function")))
			throw new Error("wrong description")
		var descrT = descr.shift()
		return (xml, __, transform) => {
			var ret = xml.children || []
			if (typeof name == "string")
				ret = ret.filter(c => c.name === name)
			else if (name)
				ret = ret.filter(c => c.name && c.name.match(name))
			if (index)
				ret = ret.slice(index, index + 1)
			ret = ret
				.map(a => descrE(a, void 0, transform))
				.filter(c => c !== void 0)
			if (index)
				ret = ret[0]
			if (descrT)
				ret = descrT(ret)
			return ret
		}
	}
	else {
		descr = _.toPairs(descr).map(([name, fun]) => [
			name, xmlType(fun, name)])
		return (xml, __, transform) => _.fromPairs(
			descr
				.map(([name, fun]) => [name, fun(xml, name, transform)])
				.filter(([, value]) => value !== void 0)
		)
	}
}
