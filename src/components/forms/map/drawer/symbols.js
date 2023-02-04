import { extend } from 'lodash';
import { parseDef } from './symbol2svg';
import { loadImageData } from './html-helper';
import cache from './cache';
import startThread from './start-thread';


export default function symbols(provider) {
	const ret = extend({}, provider);

	ret.getSymbolsLib = cache(() => provider.getSymbolsLib().then((text) => {
		return parseDef(def2json(toUnicode(text)));
	}));

	ret.getSignImage = cache((name, index, color) => {
		return startThread(function* () {
			const lib = yield ret.getSymbolsLib();
			const template = lib[`${name.toUpperCase()} (${index})`] || lib['PNT.CHR (0)'];
			return yield loadImageData(template(color), 'image/svg+xml');
		});
	});

	return ret;
}

/* --- utils --- */

// Преобразования symbol.def:
// 1. toUnicode
// 2. def2json
// 3. symbol2svg

/* --- toUnicode --- */

function toUnicode(str) {
	return [].map.call(str, mapFn).join('');
}

function mapFn(x) {
	const c = x & 255;
	return String.fromCharCode(c < 128 ? c : table1251[c - 128]);
}

const table1251 = [
	0x0402, 0x0403, 0x201A, 0x0453, 0x201E, 0x2026, 0x2020, 0x2021, 0x20AC, 0x2030, 0x0409,
	0x2039, 0x040A, 0x040C, 0x040B, 0x040F, 0x0452, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022,
	0x2013, 0x2014, 0x0020, 0x2122, 0x0459, 0x203A, 0x045A, 0x045C, 0x045B, 0x045F, 0x00A0,
	0x040E, 0x045E, 0x0408, 0x00A4, 0x0490, 0x00A6, 0x00A7, 0x0401, 0x00A9, 0x0404, 0x00AB,
	0x00AC, 0x00AD, 0x00AE, 0x0407, 0x00B0, 0x00B1, 0x0406, 0x0456, 0x0491, 0x00B5, 0x00B6,
	0x00B7, 0x0451, 0x2116, 0x0454, 0x00BB, 0x0458, 0x0405, 0x0455, 0x0457, 0x0410, 0x0411,
	0x0412, 0x0413, 0x0414, 0x0415, 0x0416, 0x0417, 0x0418, 0x0419, 0x041A, 0x041B, 0x041C,
	0x041D, 0x041E, 0x041F, 0x0420, 0x0421, 0x0422, 0x0423, 0x0424, 0x0425, 0x0426, 0x0427,
	0x0428, 0x0429, 0x042A, 0x042B, 0x042C, 0x042D, 0x042E, 0x042F, 0x0430, 0x0431, 0x0432,
	0x0433, 0x0434, 0x0435, 0x0436, 0x0437, 0x0438, 0x0439, 0x043A, 0x043B, 0x043C, 0x043D,
	0x043E, 0x043F, 0x0440, 0x0441, 0x0442, 0x0443, 0x0444, 0x0445, 0x0446, 0x0447, 0x0448,
	0x0449, 0x044A, 0x044B, 0x044C, 0x044D, 0x044E, 0x044F
];

/* --- def2json --- */

function def2json(def) {
	var ret = def
		.split('\n')
		.map((str) => str.trim())
		.filter(Boolean)
		.filter((str) => str.charAt(0) !== ';')
		.map((str) => str.match(/(?:^\[\s*(\/)?\s*(.*?)(?:\s*=\s*(.*?))?\]$)|(?:^(.*?)\s*=\s*(.*?)$)/))
		.filter(Boolean)
		.reduce(function (stack, parsed) {
			if (parsed[ 1 ] != null) {
				let name = parsed[2]
				while (stack.length > 1) {
					var head = stack.pop();
					if (head.name === name) break;
				}
			}
			else if (parsed[2] != null) {
				let name = parsed[2];
				var ret = {};
				if (parsed[3] != null) ret.$ = mayBeNumber(parsed[3]);
				stack[stack.length - 1].value[name] = ret;
				stack.push({name, value: ret});
			}
			else if (parsed[4] != null ) {
				let name = parsed[4];
				stack[stack.length - 1].value[name] = mayBeNumber(parsed[5]);
			}
			return stack;
		}, [{value: {}}])[0].value;

	return ret;
}

function mayBeNumber(str) {
	const ret = Number(str);
	return (ret + '' !== 'NaN') ? ret : str;
}
