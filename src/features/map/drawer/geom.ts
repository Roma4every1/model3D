/** Функция переводящая точку из одной системы координат в другую. */
type PointTranslator = (point: Point) => Point;

/** ## Translator.
 * Объект для работы с координатами и масштабом.
 * + `mscale` — масштаб карты
 * + `cscale` — масштаб холста
 * + `pointToControl` — переводит координаты точки из СК карты в СК холста
 * + `pointToMap` — переводит координаты точки из СК холста в СК карты
 * + `scaleVisible` — проверяет, является ли слой видимым
 * */
export interface Translator {
	mscale: number;
	cscale: number;
	pointToControl(point: Point): Point;
	pointToMap(point: Point): Point;
	zoom(scaleIn, cPoint: Point, mPoint: Point): Translator;
	setScale(scale: number, cPoint: Point | null, mPoint: Point | null): Translator;
	changeResolution(multiplier: number): Translator;
}

interface Rects {
	join(...rects: Bounds[]): Bounds
	intersects(a: Bounds, b: Bounds): boolean
	joinPoints(...points: Point[]): Bounds
	inflate(r: Bounds, d: number): Bounds
	middleRect(...rects: Bounds[]): Bounds
}


const sum = (array: number[]) => array.reduce((a, b) => a + b);
const middle = (array: number[]) => sum(array) / array.length;
const norm = (array: number[]) => { const m = sum(array); return array.map(a => a / m) };

const middleCoordinate = (coords: number[]) => {
	const m = middle(coords);
	const w = norm(coords.map(c => 1 / (1 + (c - m) * (c - m))));
	return sum(coords.map((c, i) => c * w[i]))
};

export const rects: Rects = {
	join: (...rects: Bounds[]) => rects.reduce(
		(a, b) => !a ? b : !b ? a : {
			min: {x: Math.min(a.min.x, b.min.x), y: Math.min(a.min.y, b.min.y)},
			max: {x: Math.max(a.max.x, b.max.x), y: Math.max(a.max.y, b.max.y)},
		}
	),
	intersects: (a: Bounds, b: Bounds) => a && b
		&& (a.min.x < b.max.x)
		&& (b.min.x < a.max.x)
		&& (a.min.y < b.max.y)
		&& (b.min.y < a.max.y),
	joinPoints: (...points: Point[]) => rects.join(...points.map(p => ({ min: p, max: p }))),
	inflate: (r: Bounds, d: number): Bounds => ({
		min: { x: r.min.x - d, y: r.min.y - d },
		max: { x: r.max.x + d, y: r.max.y + d },
	}),
	middleRect: (...rects: Bounds[]): Bounds => {
		return {
			min: {x: middleCoordinate(rects.map(r => r.min.x)), y: middleCoordinate(rects.map(r => r.min.y))},
			max: {x: middleCoordinate(rects.map(r => r.max.x)), y: middleCoordinate(rects.map(r => r.max.y))},
		};
	},
}

function translate(scale1: number, p1: Point, scale2: number, p2: Point): PointTranslator {
	const sc = 1 / scale1 * scale2;
	return (point: Point): Point => ({x: p2.x + (point.x - p1.x) * sc, y: p2.y + (point.y - p1.y) * sc});
}

/** Возвращает {@link Translator} — объект для перевода координат и прочего.
 * @param mScale "MapScale"
 * @param mCenter "MapCenter"
 * @param cScale "CanvasScale"
 * @param cCenter "CanvasCenter"
 * */
export function getTranslator(mScale: number, mCenter: Point, cScale: number, cCenter: Point): Translator {
	let ret: Translator;
	return ret = {
		mscale: mScale, cscale: cScale,
		pointToControl: translate(mScale, mCenter, cScale, cCenter),
		pointToMap: translate(cScale, cCenter, mScale, mCenter),

		zoom: (scaleIn, cPoint, mPoint) => ret.setScale(mScale * scaleIn, cPoint, mPoint),

		setScale: (scale, cPoint, mPoint) => {
			if (cPoint == null) {
				cPoint = cCenter;
				mPoint = mCenter;
			} else if (mPoint == null) {
				mPoint = ret.pointToMap(cPoint);
			}
			return getTranslator(scale, mPoint, cScale, cPoint);
		},

		changeResolution: (mul: number) => {
			if (mul === 1) return ret;
			return getTranslator(mScale, ret.pointToMap({ x: 0, y: 0 }), cScale * mul, { x: 0, y: 0 })
		},
	};
}
