import { extend } from 'lodash';
import { loadImageData } from './html-helper';
import startThread from './start-thread';
import cache from './cache';
import parseSMB from './parse-smb';
import pngMono from './png-mono';
import parseColor from 'parse-color';


export default function patterns(provider) {
	const ret = extend({}, provider);

	ret.getPatternLib = cache(libName => provider.getPatternLib(libName).then(parseSMB));

	ret.getPatternImage = cache((name, color, backColor) => {
		return startThread(function* () {
			const [, libName, index] = name.match(/^(.+)-(\d+)$/);

			if (libName.toLowerCase() === 'halftone') {
				const c = parseColor(color).rgb;
				const b = (backColor === 'none' || backColor === 'background') ? [255, 255, 255] : parseColor(backColor).rgb;
				const t = index / 64;
				return `rgba(${b.map((bi, i) => Math.round(bi + (c[i] - bi) * t))}, 1)`;
			}

			const lib = yield ret.getPatternLib(libName);
      const pngRaw = lib[index]; if (!pngRaw) return;

      const png = pngMono(pngRaw, color, backColor);
      return yield loadImageData(png, 'image/png');
		});
	});

	return ret;
}
