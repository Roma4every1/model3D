import { extend } from "lodash";
import { loadImageData } from "./htmlHelper";
import startThread from "./startThread";
import cache from "./cache";
import parseSMB from "./parseSMB";
import pngMono from "./pngMono";
import parseColor from "parse-color";


export default function patterns(provider) {
	const ret = extend({}, provider);

	ret.getPatternLib = cache(libName => provider.getPatternLib(libName).then(parseSMB));
	ret.getPatternImage = cache((name, color, backColor) => {
		if (name.match(/\./)) return provider.getPatternImage(name);

		return startThread(function* () {
			const [, libName, index] = name.match(/^(.+)-(\d+)$/);

			if (libName.toLowerCase() === 'halftone') {
				const c = parseColor(color).rgb;
				const b = (backColor === 'none' || backColor === 'background') ? [255, 255, 255] : parseColor(backColor).rgb;
				const t = index / 64;
				return `rgba(${b.map((bi, i) => Math.round(bi + (c[i] - bi) * t))}, 1)`;
			}

			const lib = yield ret.getPatternLib(libName);
			const png = pngMono(lib[index], color, backColor);
			return yield loadImageData(png, 'image/png');
		});
	});

	return ret;
}
