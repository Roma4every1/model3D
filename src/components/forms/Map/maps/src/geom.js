// module geom

export var rects = {
	join: (...rects) => rects.reduce(
		(a, b) => !a ? b : !b ? a : {
			min: {
				x: Math.min(a.min.x, b.min.x),
				y: Math.min(a.min.y, b.min.y),
			},
			max: {
				x: Math.max(a.max.x, b.max.x),
				y: Math.max(a.max.y, b.max.y),
			},
		}
	),
	intersects: (a, b) => a && b
		&& (a.min.x < b.max.x)
		&& (b.min.x < a.max.x)
		&& (a.min.y < b.max.y)
		&& (b.min.y < a.max.y),
	joinPoints: (...points) =>
		rects.join(...points.map(p => ({ min: p, max: p }))),
	inflate: (r, d) => ({
		min: { x: r.min.x - d, y: r.min.y - d },
		max: { x: r.max.x + d, y: r.max.y + d },
	}),
	middleRect: (...rects) => {
		function sum(array) {
			return array.reduce((a, b) => a + b)
		}
		function middle(array) {
			return sum(array) / array.length
		}
		function norm(array) {
			var m = sum(array)
			return array.map(a => a / m)
		}
		function middleCoord(coords) {
			var m = middle(coords)
			var w = norm(coords.map(c => 1 / (1 + (c - m) * (c - m))))
			return sum(coords.map((c, i) => c * w[i]))
		}
		return {
			min: {
				x: middleCoord(rects.map(r => r.min.x)),
				y: middleCoord(rects.map(r => r.min.y)),
			},
			max: {
				x: middleCoord(rects.map(r => r.max.x)),
				y: middleCoord(rects.map(r => r.max.y)),
			},
		}
	},
}

var translate = (scale1, p1, scale2, p2) => {
	var sc = 1 / scale1 * scale2
	return p => ({
		x: p2.x + (p.x - p1.x) * sc,
		y: p2.y + (p.y - p1.y) * sc,
	})
}

export function translator(mscale, mcenter, cscale, ccenter) {
	var ret
	return ret = {
		mscale, cscale,
		pointToControl: translate(mscale, mcenter, cscale, ccenter),
		pointToMap: translate(cscale, ccenter, mscale, mcenter),
		scaleVisible: obj =>
			obj.lowscale == null || obj.highscale == null ||
			(((typeof obj.lowscale === 'string' && obj.lowscale.includes('INF')) || obj.lowscale <= mscale) && 
                         ((typeof obj.highscale === 'string' && obj.highscale.includes('INF')) || mscale <= obj.highscale)),
		zoom: (scaleIn, cpoint, mpoint) =>
			ret.setScale(mscale * scaleIn, cpoint, mpoint),
		setScale: (scale, cpoint, mpoint) => {
			if (cpoint == null) {
				cpoint = ccenter
				mpoint = mcenter
			}
			else if (mpoint == null)
				mpoint = ret.pointToMap(cpoint)
			return translator(scale, mpoint, cscale, cpoint)
		},
		changeResolution: mul => mul === 1 ? ret : translator(mscale, ret.pointToMap({ x: 0, y: 0 }), cscale * mul, { x: 0, y: 0 }),
	}
}
