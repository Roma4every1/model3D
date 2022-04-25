// module patterns

var startThread = require("./startThread");
var htmlHelper = require("./htmlHelper");
var cache = require("./cache");
var _ = require("lodash");
var parseSMB = require("./parseSMB");
var pngMono = require("./pngMono");
var parseColor = require("parse-color");

module.exports = provider => {
	var ret = _.extend({}, provider)

	ret.getPatternLib = cache(libName =>
		provider.getPatternLib(libName).then(parseSMB)
	)

	ret.getPatternImage = cache((name, color, bkcolor) => {
		if (name.match(/\./))
			return provider.getPatternImage(name)
		return startThread(function* () {
			var [, libName, index] = name.match(/^(.+)-(\d+)$/)
			if (libName.toLowerCase() === "halftone") {
				var c = parseColor(color).rgb
				var b = (bkcolor === "none" || bkcolor === "background") ? parseColor("#FFFFFF").rgb : parseColor(bkcolor).rgb;
				var t = index / 64
				return `rgba(${b.map((bi, i) =>
					Math.round(bi + (c[i] - bi) * t))
					}, 1)`
			}
			var lib = yield ret.getPatternLib(libName)
			var png = pngMono(lib[index], color, bkcolor)
			var image = yield htmlHelper.loadImageData(png, "image/png")
			return image
		})
	})

	return ret
}
