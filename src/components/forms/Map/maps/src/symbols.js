import {extend} from "lodash";
import {loadImageData} from "./htmlHelper";
import {toUnicode} from "./cp1251";
import startThread from "./startThread";
import symbol2svg from "./symbol2svg";
import def2json from "./def2json";
import cache from "./cache";
import logger from "./logger";


export default function symbols(provider) {
	const ret = extend({}, provider);

	ret.getSymbolsLib = cache(() => provider.getSymbolsLib().then(
		text => symbol2svg(def2json(toUnicode(text)))
	));
	ret.getSignImage = cache((name, index, color) => {
		if (name.match(/\.(png|gif|jpg|jpeg|svg)$/)) return provider.getSignImage(name);

		return startThread(function* () {
			const lib = yield ret.getSymbolsLib();
			let template = lib[`${name.toUpperCase()} (${index})`];

			if (!template) {
				logger.error('well sign is missed ' + name.toUpperCase() + ' ' + index)
				template = lib['PNT.CHR (0)']
			}

			const svg = template(color);
			return yield loadImageData(svg, 'image/svg+xml')
		});
	});

	return ret;
}
