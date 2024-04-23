import { PIXEL_PER_METER } from '../lib/map-utils';


/** Объект для перевода координат. */
export interface Translator {
	mapScale: MapScale;
	pointToControl(point: Point): Point;
	pointToMap(point: Point): Point;
}

export const intersects = (a: Bounds, b: Bounds) => a && b
  && (a.min.x < b.max.x)
  && (b.min.x < a.max.x)
  && (a.min.y < b.max.y)
  && (b.min.y < a.max.y);

function translate(scale1: number, p1: Point, scale2: number, p2: Point) {
	const sc = scale2 / scale1;
	return (point: Point): Point => ({
    x: p2.x + (point.x - p1.x) * sc,
    y: p2.y + (point.y - p1.y) * sc
  });
}

/**
 * @param mScale "MapScale"
 * @param mCenter "MapCenter"
 * @param cCenter "CanvasCenter"
 * */
export function getTranslator(mScale: number, mCenter: Point, cCenter: Point): Translator {
	const cScale = window.devicePixelRatio * PIXEL_PER_METER;
  return {
    mapScale: mScale,
    pointToControl: translate(mScale, mCenter, cScale, cCenter),
    pointToMap: translate(cScale, cCenter, mScale, mCenter),
  };
}
