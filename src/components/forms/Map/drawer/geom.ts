/** Функция переводящая точку из одной системы координат в другую. */
type PointTranslator = (point: ClientPoint) => ClientPoint;

/** ## Translator.
 * Объект для работы с координатами и масштабом.
 * + `mscale` — масштаб карты
 * + `cscale` — масштаб холста
 * + `pointToControl` — переводит координаты точки из СК карты в СК холста
 * + `pointToMap` — переводит координаты точки из СК холста в СК карты
 * + `scaleVisible` — проверяет, является ли слой видимым
 * */
export interface Translator {
	mscale: number,
	cscale: number,
	pointToControl(point: ClientPoint): ClientPoint,
	pointToMap(point: ClientPoint): ClientPoint,
	scaleVisible(layer: MapLayer): boolean,
	zoom(scaleIn, cPoint: ClientPoint, mPoint: ClientPoint): Translator,
	setScale(scale: number, cPoint: ClientPoint | null, mPoint: ClientPoint | null): Translator,
	changeResolution(multiplier: number): Translator,
}

interface Rects {
	join(...rects: Bounds[]): Bounds
	intersects(a: Bounds, b: Bounds): boolean
	joinPoints(...points: ClientPoint[]): Bounds
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
	joinPoints: (...points: ClientPoint[]) => rects.join(...points.map(p => ({ min: p, max: p }))),
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

function translate(scale1: number, p1: ClientPoint, scale2: number, p2: ClientPoint): PointTranslator {
	const sc = 1 / scale1 * scale2;
	return (point: ClientPoint) => ({x: p2.x + (point.x - p1.x) * sc, y: p2.y + (point.y - p1.y) * sc});
}

/** Возвращает {@link Translator} — объект для перевода координат и прочего.
 * @param mScale _"MapScale"_
 * @param mCenter _"MapCenter"_
 * @param cScale _"CanvasScale"_
 * @param cCenter _"CanvasCenter"_
 * */
export function getTranslator(mScale: number, mCenter: ClientPoint, cScale: number, cCenter: ClientPoint): Translator {
	let ret: Translator;
	return ret = {
		mscale: mScale, cscale: cScale,
		pointToControl: translate(mScale, mCenter, cScale, cCenter),
		pointToMap: translate(cScale, cCenter, mScale, mCenter),

		scaleVisible: (layer: MapLayer) => {
			const lowScale = layer.lowscale, highScale = layer.highscale;
			if ((!lowScale && lowScale !== 0) || (!highScale && highScale !== 0)) return true;
			const isLowScaleInfinity = typeof lowScale === 'string' && lowScale.includes('INF');
			const isHighScaleInfinity = typeof highScale === 'string' && highScale.includes('INF');
			return (isLowScaleInfinity || lowScale <= mScale) && (isHighScaleInfinity || mScale <= highScale);
		},

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
	}
}
