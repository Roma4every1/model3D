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
			const m = sum(array);
			return array.map(a => a / m)
		}
		function middleCoord(coords) {
			const m = middle(coords);
			const w = norm(coords.map(c => 1 / (1 + (c - m) * (c - m))));
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

const translate = (scale1, p1, scale2, p2) => {
	const sc = 1 / scale1 * scale2;
	return (point) => ({
		x: p2.x + (point.x - p1.x) * sc,
		y: p2.y + (point.y - p1.y) * sc,
	});
}

/** Евклидово расстояние между двумя точками по их координатам.
 *
 * `√ (x1 - x2)^2 + (y1 - y2)^2`
 * */
export const distance = (x1, x2, y1, y2) => {
	return Math.sqrt((x1 * x1 + x2 * x2) + (y1 * y1 + y2 * y2) - 2 * (x1 * x2 + y1 * y2));
}

export function translator(mScale, mCenter, cScale, cCenter) {
	let ret;
	return ret = {
		mscale: mScale, cscale: cScale,
		pointToControl: translate(mScale, mCenter, cScale, cCenter),
		pointToMap: translate(cScale, cCenter, mScale, mCenter),
		scaleVisible: obj =>
			obj.lowscale == null || obj.highscale == null ||
			(((typeof obj.lowscale === 'string' && obj.lowscale.includes('INF')) || obj.lowscale <= mScale) &&
                         ((typeof obj.highscale === 'string' && obj.highscale.includes('INF')) || mScale <= obj.highscale)),
		zoom: (scaleIn, cPoint, mPoint) => ret.setScale(mScale * scaleIn, cPoint, mPoint),
		setScale: (scale, cPoint, mPoint) => {
			if (cPoint == null) {
				cPoint = cCenter
				mPoint = mCenter
			}
			else if (mPoint == null)
				mPoint = ret.pointToMap(cPoint)
			return translator(scale, mPoint, cScale, cPoint)
		},
		changeResolution: mul => mul === 1 ? ret : translator(mScale, ret.pointToMap({ x: 0, y: 0 }), cScale * mul, { x: 0, y: 0 }),
	}
}
