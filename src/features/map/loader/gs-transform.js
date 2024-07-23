import 'stream'; // for xml-js
import { xml2js } from 'xml-js';
import xmlTransform from './xml-transform.js';


export function parseContainerXML(text) {
  const rootElement = xml2js(text, {compact: false}).elements[0];
  return transform(rootElement);
}

const transform = xmlTransform({
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
				UWID: xmlTransform.number,
        name: xmlTransform.string,
        x: xmlTransform.number,
        y: xmlTransform.number,
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

function makeSublayers(array) {
  const layers = {};
  const pointsLists = [];

  for (const element of array) {
    if (element.type === 'sublayer') {
      layers[element.uid] = element;
    } else if (element.type === 'namedpoints') {
      pointsLists.push(element.elements);
    }
  }

  let namedPoints;
  if (pointsLists.length === 0) {
    namedPoints = [];
  } else if (pointsLists.length === 1) {
    namedPoints = pointsLists[0];
  } else {
    namedPoints = [].concat(...pointsLists);
  }
  for (const point of namedPoints) {
    delete point.type;
  }
	return {layers, namedpoints: namedPoints};
}

/** @return {PolylineArc} */
function arcPlain(xml) {
  const pathString = xml.attributes.path;
  const points = arcXY(pathString);

  const path = [];
  for (const point of points) path.push(point.x, point.y);

  const closed = pathString.endsWith('Z') || pathString.endsWith('z');
  return {path, closed};
}

function arcXY(pathString) {
	let last = null;

	return pathString.split(/(?=m|M)/)
		.map(x => x.split(/(?=m|M|l|L|z|Z)/).map(pt => {
			switch (pt[0]) {
				case 'z': case 'Z':
					return null;
				case 'M': case 'L':
					pt = pt.slice(1).split(/\s/).map(Number);
					return last = {x: pt[0], y: pt[1]};
				case 'm': case 'l':
					pt = pt.slice(1).split(/\s/).map(Number);
					return last = {x: last.x + pt[0], y: last.y + pt[1]};
				default:
					throw new Error('wrong arc format: ' + x)
			}
		}).filter(p => p))
		.filter((_, i) => {
			if (i > 0) throw new Error('more than one chain in an arc');
			return true;
		})[0];
}
