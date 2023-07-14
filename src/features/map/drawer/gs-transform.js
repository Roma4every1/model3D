import { xml2js } from 'xml-js';
import { toPairs, fromPairs } from 'lodash';
import xmlTransform from './xml-transform';


const transform = xmlTransform({
	MapContainer: {
		type: 'mapcontainer',
		etag: xmlTransform.string('ETag'),
		path: xmlTransform.path('Path'),
		name: xmlTransform.string('Name'),
	},
	MapInfo: {
		namedpoints: xmlTransform.string('NamedPoints'),
		date: xmlTransform.string('Date'),
		mapname: xmlTransform.string('MapName'),
		mapcode: xmlTransform.string('MapCode'),
		plastname: xmlTransform.string('PlastName'),
		plastcode: xmlTransform.string('PlastCode'),
		objectname: xmlTransform.string('ObjectName'),
		objectcode: xmlTransform.string('ObjectCode'),
		organization: xmlTransform.string('Organization'),
		etag: xmlTransform.string('ETag'),
		layers: ['layer', {
			uid: xmlTransform.string,
			name: xmlTransform.string,
			group: xmlTransform.string,
			container: xmlTransform.string,
			visible: xmlTransform.boolean,
			lowscale: xmlTransform.number,
			highscale: xmlTransform.number,
			bounds: [0, bounds],
		}],
	},
	container: [{
		type: xmlTransform.element,
		name: xmlTransform.string,
		uid: xmlTransform.string,
		version: xmlTransform.number,
		elements: [/./, xmlTransform({
			pieslice: {
				type: xmlTransform.element,
				x: xmlTransform.number,
				y: xmlTransform.number,
				color: xmlTransform.string,
				bordercolor: xmlTransform.string,
				radius: xmlTransform.number,
				startangle: xmlTransform.number,
				endangle: xmlTransform.number,
			},
			label: {
				type: xmlTransform.element,
				x: xmlTransform.number,
				y: xmlTransform.number,
				xoffset: xmlTransform.number,
				yoffset: xmlTransform.number,
				angle: xmlTransform.number,
				text: xmlTransform.string,
				color: xmlTransform.string,
				valignment: xmlTransform.number,
				halignment: xmlTransform.number,
				fontname: xmlTransform.string,
				fontsize: xmlTransform.number,
				transparent: xmlTransform.boolean,
				bold: xmlTransform.boolean,
			},
			sign: {
				type: xmlTransform.element,
				x: xmlTransform.number,
				y: xmlTransform.number,
				fontname: xmlTransform.string,
				symbolcode: xmlTransform.number,
				size: xmlTransform.number,
				color: xmlTransform.string,
				UWID: xmlTransform.string,
			},
			namedpoint: {
				type: xmlTransform.element,
				x: xmlTransform.number,
				y: xmlTransform.number,
				name: xmlTransform.string,
				UWID: xmlTransform.string,
			},
			polyline: {
				type: xmlTransform.element,
				bordercolor: xmlTransform.string,
				borderwidth: xmlTransform.number,
				borderstyle: xmlTransform.number,
				borderstyleid: xmlTransform.string,
				transparent: xmlTransform.boolean,
				fillname: xmlTransform.string,
				fillcolor: xmlTransform.string,
				fillbkcolor: xmlTransform.string,
				bounds: [0, bounds],
				arcs: ['arc', arcPlain],
			},
			regular2dfield: {
        type: 'field',
				data: xmlTransform.string,
				sizex: xmlTransform.number,
				sizey: xmlTransform.number,
				stepx: xmlTransform.number,
				stepy: xmlTransform.number,
				x: xmlTransform.number,
				y: xmlTransform.number,
				palette: [/./, xmlTransform({
					palette: {
						interpolated: xmlTransform.string,
						level: [/./, xmlTransform({
							level: {
								color: xmlTransform.string,
								value: xmlTransform.number,
							}
						})],
					}
				})],
        bounds: [0, bounds],
			},
		})],
	}, makeSublayers],
});

function bounds(xml) {
	const x1 = Number(xml.attributes.left);
	const x2 = Number(xml.attributes.right);
	const y1 = Number(xml.attributes.top);
	const y2 = Number(xml.attributes.bottom);

	return {
		min: {x: Math.min(x1, x2), y: Math.min(y1, y2)},
		max: {x: Math.max(x1, x2), y: Math.max(y1, y2)},
	}
}

function removeType(rec) {
	delete rec.type;
	return rec;
}

function makeSublayers(array) {
	return {
		layers: array
			.filter(el => el.type === 'sublayer')
			.map(removeType)
			.reduce((collection, sublayer) => {
				collection[sublayer.uid] = sublayer
				return collection
			}, {}),
		namedpoints:
			[].concat(...array
				.filter(el => el.type === 'namedpoints')
				.map(el => el.elements)
			).map(removeType),
	};
}

function arcPlain(xml) {
	return {
		path: arcXY(xml).reduce(
			(a, { x, y }) => { a.push(x, y); return a; }, []),
        closed: xml.attributes.path.endsWith('Z') || xml.attributes.path.endsWith('z')
	}
}

function arcXY(xml) {
	let last = null;

	return xml.attributes.path.split(/(?=m|M)/)
		.map(x => x.split(/(?=m|M|l|L|z|Z)/).map(pt => {
			switch (pt[0]) {
				case 'z': case 'Z':
					return null;
				case 'M': case 'L':
					pt = pt.slice(1).split(/\s/).map(Number);
					return last = {
						x: pt[0],
						y: pt[1],
					};
				case 'm': case 'l':
					pt = pt.slice(1).split(/\s/).map(Number);
					return last = {
						x: last.x + pt[0],
						y: last.y + pt[1],
					}
				default:
					throw new Error('wrong arc format: ' + x)
			}
		}).filter(p => p))
		.filter((_, i) => {
			if (i > 0) throw new Error('more than one chain in an arc');
			return true;
		})[0];
}

function xmlLite(xml) {
	return fromPairs(toPairs(xml).map(([name, value]) => [
		name === 'attrib'
			? 'attributes'
			: name === 'elements' ? 'children' : name,
		name === 'elements' ? value.map(xmlLite) : value
	]));
}

export function readXml(text) {
	const converted = xml2js(text, {compact: false}).elements[0];
	return transform(xmlLite(converted));
}

export function readTable(text) {
	let fields;
	const table = [];
	const array = JSON.parse(text);

	for (let a of array) {
		if (!fields) { fields = a; continue; }
		if (a === 'lastRow') break;

		const r = {};
		for (let i = 0; i < fields.length; ++i) {
			let s = a[i];
			const n = fields[i];
			if (n === 'PATH') s = s.replace(/\\/g, '/').replace(/\.xml$/, '.json');
			r[n] = s;
		}
		table.push(r);
	}
	return table;
}
