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

export const intersects = (a: Bounds, b: Bounds) => a && b
  && (a.min.x < b.max.x)
  && (b.min.x < a.max.x)
  && (a.min.y < b.max.y)
  && (b.min.y < a.max.y);

function translate(scale1: number, p1: Point, scale2: number, p2: Point) {
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
