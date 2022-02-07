// module gsTransform

var _ = require("lodash");
var xml = require("node-xml-lite");
var x = require("./xmlTransform");

var transform = x({
	MapContainer: {
		type: "mapcontainer",
		etag: x.string("ETag"),
		path: x.path("Path"),
		name: x.string("Name"),
	},
	MapInfo: {
		namedpoints: x.string("NamedPoints"),
		date: x.string("Date"),
		mapname: x.string("MapName"),
		mapcode: x.string("MapCode"),
		plastname: x.string("PlastName"),
		plastcode: x.string("PlastCode"),
		objectname: x.string("ObjectName"),
		objectcode: x.string("ObjectCode"),
		organization: x.string("Organization"),
		etag: x.string("ETag"),
		layers: ["layer", {
			uid: x.string,
			name: x.string,
			group: x.string,
			container: x.string,
			visible: x.boolean,
			lowscale: x.number,
			highscale: x.number,
			bounds: [0, bounds],
		}],
	},
	container: [{
		type: x.element,
		name: x.string,
		uid: x.string,
		version: x.number,
		elements: [/./, x({
			pieslice: {
				type: x.element,
				x: x.number,
				y: x.number,
				color: x.string,
				bordercolor: x.string,
				radius: x.number,
				startangle: x.number,
				endangle: x.number,
			},
			label: {
				type: x.element,
				x: x.number,
				y: x.number,
				xoffset: x.number,
				yoffset: x.number,
				angle: x.number,
				text: x.string,
				color: x.string,
				valignment: x.number,
				halignment: x.number,
				fontname: x.string,
				fontsize: x.number,
				transparent: x.boolean,
			},
			sign: {
				type: x.element,
				x: x.number,
				y: x.number,
				fontname: x.string,
				symbolcode: x.number,
				size: x.number,
				color: x.string,
				UWID: x.string,
			},
			namedpoint: {
				type: x.element,
				x: x.number,
				y: x.number,
				name: x.string,
				UWID: x.string,
			},
			polyline: {
				type: x.element,
				bordercolor: x.string,
				borderwidth: x.number,
				borderstyle: x.number,
				borderstyleid: x.string,
				transparent: x.boolean,
				fillname: x.string,
				fillcolor: x.string,
				fillbkcolor: x.string,
				bounds: [0, bounds],
				arcs: ["arc", arcPlain],
			},
			regular2dfield_: {
				data: x.string,
				sizex: x.number,
				sizey: x.number,
				stepx: x.number,
				stepy: x.number,
				x: x.number,
				y: x.number,
				elements: [/./, x({
					palette: {
						interpolated: x.string,
						elements: [/./, x({
							level: {
								color: x.string,
								value: x.string,
							}
						})],
					}
				})],
			},
		})],
	}, makeSublayers],
});

function bounds(xml) {
	var x1 = Number(xml.attributes.left)
	var x2 = Number(xml.attributes.right)
	var y1 = Number(xml.attributes.top)
	var y2 = Number(xml.attributes.bottom)
	return {
		min: {
			x: Math.min(x1, x2),
			y: Math.min(y1, y2),
		},
		max: {
			x: Math.max(x1, x2),
			y: Math.max(y1, y2),
		},
	}
}

function removeType(rec) {
	delete rec.type
	return rec
}

function makeSublayers(array) {
	return {
		layers: array
			.filter(el => el.type === "sublayer")
			.map(removeType)
			.reduce((collection, sublayer) => {
				collection[sublayer.uid] = sublayer
				return collection
			}, {}),
		namedpoints:
			[].concat(...array
				.filter(el => el.type === "namedpoints")
				.map(el => el.elements)
			)
				.map(removeType)
	}
}

function arcPlain(xml) {
	return {
		path: arcXY(xml).reduce(
			(a, { x, y }) => { a.push(x, y); return a; }, [])
	}
}

function arcXY(xml) {
	var last = null
	return xml.attributes.path.split(/(?=m|M)/)
		.map(x => x.split(/(?=m|M|l|L|z|Z)/).map(pt => {
			switch (pt[0]) {
				case "z": case "Z":
					return { x: last.x, y: last.y } // check for null
				case "M": case "L":
					pt = pt.slice(1).split(/\s/).map(Number);
					return last = {
						x: pt[0],
						y: pt[1],
					};
				case "m": case "l":
					pt = pt.slice(1).split(/\s/).map(Number);
					return last = {
						x: last.x + pt[0],
						y: last.y + pt[1],
					}
				default:
					throw new Error("wrong arc format: " + x)
			}
		}))
		.filter((_, i) => {
			if (i > 0)
				throw new Error("more than one chain in an arc")
			return true
		})
	[0]
}

function xmlLite(xml) {
	return _.fromPairs(_.toPairs(xml).map(([name, value]) => [
		name === "attrib" ? "attributes" : name === "childs" ? "children" : name,
		name === "childs" ? value.map(xmlLite) : value
	]))
}

export function readXml(text) {
	var parsed = xml.parseString(text);
	var lite = xmlLite(parsed);
	return transform(lite);
}

export function readTable(text) {
	var array = JSON.parse(text)
	var fields
	var table = []
	for (var a of array) {
		if (!fields) {
			fields = a
			continue
		}
		if (a === "lastRow")
			break
		var r = {}
		for (var i = 0; i < fields.length; ++i) {
			var s = a[i]
			var n = fields[i]
			if (n === "PATH")
				s = s.replace(/\\/g, "/").replace(/\.xml$/, ".json")
			r[n] = s
		}
		table.push(r)
	}
	return table
}
