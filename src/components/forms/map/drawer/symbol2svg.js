const specialSymbolsDict = {'&': 'amp', '<': 'lt', '>': 'gt', "'": 'apos', '"': 'quot'};
const replacer = (x) => '&' + specialSymbolsDict[x] + ';';
const encode = (text) => (text + '').replace(/[&<>'"]/g, replacer);

const colorsDict = {
	Black16: "#000000",
	Blue16: "#0000AA",
	Green16: "#00AA00",
	Cyan16: "#00AAAA",
	Red16: "#AA0000",
	Magenta16: "#AA00AA",
	Brown16: "#AAAA00",
	LightGray16: "#AAAAAA",
	DarkGray16: "#555555",
	LightBlue16: "#5555FF",
	LightGreen16: "#55FF55",
	LightCyan16: "#55FFFF",
	LightRed16: "#FF5555",
	LightMagenta16: "#FF55FF",
	Yellow16: "#FFFF55",
	White16: "#FFFFFF",
	Black: "#000000",
	Maroon: "#800000",
	Green: "#008000",
	Olive: "#808000",
	Navy: "#000080",
	Purple: "#800080",
	Teal: "#008080",
	Gray: "#808080",
	Silver: "#C0C0C0",
	Red: "#FF0000",
	Lime: "#00FF00",
	Yellow: "#FFFF00",
	Blue: "#0000FF",
	Fuchsia: "#FF00FF",
	Aqua: "#00FFFF",
	LtGray: "#C0C0C0",
	DkGray: "#808080",
	White: "#FFFFFF",
};

function xml2text(xml) {
	const ret = [];
	walk(xml);
	return ret.join('');

	function walk(xml) {
		if (typeof xml == 'string')
			ret.push(encode(xml))
		else {
			ret.push('<', xml.name);

			if (xml.attributes) {
				for (const i in xml.attributes) {
					if (xml.attributes.hasOwnProperty(i)) {
						ret.push(' ', i, '="', encode(xml.attributes[i]), '"');
					}
				}
			}

			if (xml.children) {
				ret.push('>');
				xml.children.forEach(walk);
				ret.push('</', xml.name, '>');
			}
			else ret.push('/>')
		}
	}
}

function makeDefaultProps() {
	return {
		pen: {color: 'Black', bkcolor: 'Black', style: 'Solid', width: 0},
		brush: {color: 'Black', bkcolor: 'Black', style: 'Solid', hatch: ''},
		font: {
			color: 'Black', bkcolor: '', typeface: '',
			size: 1, angle: 0, weight: 0, italic: 0,
			underlined: 0, strikedout: 0,
		},
	};
}

function parseColor(color) {
	return colorsDict.hasOwnProperty(color) ? colorsDict[color] : color;
}

function calcSvgStyle(props, ret) {
	if (!ret) ret = {};

	switch (props.pen.style) {
		case 'Empty':
			ret.stroke = 'none';
			break;
		case 'Solid':
			if ('ForeColor' !== props.pen.color) ret.stroke = parseColor(props.pen.color)
			if ('Default' !== props.pen.width) ret['stroke-width'] = props.pen.width;
			break;
		default: break;
	}

	switch (props.brush.style) {
		case 'Empty':
			ret.fill = 'none'
			break;
		case 'Solid':
			if ('ForeColor' !== props.brush.color)
				ret.fill = parseColor(props.brush.color)
			break;
		default: break;
	}

	return ret;
}

export function parseDef(lib) {

	const types = {
		Pen: function (pic, props, E) {
			props.pen.color = E.Color;
			props.pen.bkcolor = E.BkColor;
			props.pen.style = E.Style;
			props.pen.width = E.Width;
		},

		Brush: function (pic, props, E) {
			props.brush.color = E.Color;
			props.brush.bkcolor = E.BkColor;
			props.brush.style = E.Style;
			props.brush.hatch = E.Hatch;
		},

		Font: function (pic, props, E) {
			props.font.color = E.Color;
			props.font.bkcolor = E.BkColor;
			props.font.typeface = E.TypeFace;
			props.font.size = E.Size;
			props.font.angle = E.Angle;
			props.font.weight = E.Weight;
			props.font.italic = E.Italic;
			props.font.underlined = E.Underlined;
			props.font.strikedout = E.StrikedOut;
		},

		Reference: function (pic, props, E) {
			draw(pic, props, getElement(E.Ref))
		},

		Shifter: function (pic, props, E) {
			var commands = [];
			draw(commands, props, getElement(E.Ref));
			pic.push({
				name: "g",
				attributes: {transform: 'translate(' + (E.HShift || 0) + ' ' + (E.VShift || 0) + ')'},
				children: commands,
			});
		},

		Polyline: function (pic, props, E) {
			pic.push({
				name: 'path',
				attributes: calcSvgStyle(props, {
					d: makePath(E.Points || {}, props.brush.style !== 'Empty')
				})
			})
		},

		Circle: function (pic, props, E) {
			pic.push({
				name: "circle",
				attributes: calcSvgStyle(props, {cx: E.CenterX || 0, cy: E.CenterY || 0, r: E.Radius || 0}),
			});
		},

		PieSlice: function (pic, props, E) {
			const CX = Number(E.CenterX || 0);
			const CY = Number(E.CenterY || 0);
			const R = Number(E.Radius || 0);
			const SA = Number(E.StartAngle || 0) / 180 * Math.PI;

			let EA = Number(E.EndAngle || 0) / 180 * Math.PI;
			if (EA < SA) EA += 2 * Math.PI
			pic.push({
				name: 'path',
				attributes: calcSvgStyle(props, {
					d:
						"M" + CX + " " + CY +
						"L" + (CX + Math.sin(SA) * R) + " " + (CY + Math.cos(SA) * R) +
						"A" + R + " " + R + " 0 " +
						(EA - SA > Math.PI ? "1" : "0") +
						" 0 " + (CX + Math.sin(EA) * R) + " " + (CY + Math.cos(EA) * R) +
						"Z"
				})
			});
		},

		Text: function (pic, props, E) {
			const fill = parseColor(props.font.color);
			const y = E.AnchorY === 'Center' ? '1em' : E.AnchorY === 'Bottom' ? '0em' : '1em';
			const anchor = E.AnchorX === 'Center' ? 'middle' : E.AnchorX === 'Right' ? 'end' : 'start';
			const transform = 'translate(' + (E.OriginX || 0) + ' ' + (E.OriginY || 0) + ') scale(1 -1)';

			const style =
				'font-family:' + props.font.typeface + ';' +
				'font-style:' + (props.font.italic ? 'italic' : 'normal') + ';' +
				'font-size:' + (Number(props.font.size) / 4) + 'pt;';

			pic.push({
				name: 'text',
				attributes: {y, transform, fill, style, 'text-anchor': anchor},
				children: [E.Text || '']
			});
		},
	};

	function makePath(points, forceClosed) {
		let i = 1;
		const ret = [];
		let x, y, fx, fy;

		while (points.hasOwnProperty('x' + i)) {
			x = Number(points['x' + i]);
			y = Number(points['y' + i]);
			if (i === 1) { fx = x; fy = y; }

			ret.push((i === 1 ? "M" : "L") + x + " " + y);
			++i;
		}

		if ((fx === x && fy === y) || forceClosed) ret.push('Z');
		return ret.join('');
	}

	function draw(pic, props, E) {
		for (const i in E) if (E.hasOwnProperty(i)) types[E[i].Type](pic, props, E[i])
	}

	const vsd = lib['Vector Symbol Definition'];
	const vsdL = {};

	for (let i in vsd) if (vsd.hasOwnProperty(i)) vsdL[i.toLowerCase()] = vsd[i];

	function getElement(name) {
		return vsdL[name.toLowerCase()];
	}

	const ret = {};
	const subst = lib['CHR Substitution'];

	for (let i in subst) if (subst.hasOwnProperty(i)) {
		let pic = [];
		let props = makeDefaultProps();
		draw(pic, props, getElement(subst[i]));

		ret[i] = (color) => xml2text({
			name: 'svg',
			attributes: {
				xmlns: 'http://www.w3.org/2000/svg', version: '1.1',
				width: '15mm', height: '15mm', viewBox: '0 0 15 15',
			},
			children: [{
				name: 'g',
				attributes: calcSvgStyle(
					{
						pen: {style: 'Solid', color, width: 0.2},
						brush: {style: 'Solid', color},
					},
					{transform: 'translate(7.5 7.5) scale(1 -1)'}
				),
				children: pic,
			}],
		})
	}

	return ret;
}
