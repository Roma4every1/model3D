import { PIXEL_PER_METER } from '../lib/map-utils';


/** Объект для перевода координат. */
export interface Translator {
	mapScale: MapScale;
	pointToControl(point: Point): Point;
	pointToMap(point: Point): Point;
}


export function getTranslator(mapScale: MapScale, mapCenter: Point, canvasCenter: Point): Translator {
	const cScale = window.devicePixelRatio * PIXEL_PER_METER;
  const pointToMapRatio = mapScale / cScale;
  const pointToControlRatio = cScale / mapScale;

  const pointToMap = (p: Point): Point => {
    const x = mapCenter.x + (p.x - canvasCenter.x) * pointToMapRatio;
    const y = mapCenter.y + (p.y - canvasCenter.y) * pointToMapRatio;
    return {x, y};
  };
  const pointToControl = (p: Point): Point => {
    const x = canvasCenter.x + (p.x - mapCenter.x) * pointToControlRatio;
    const y = canvasCenter.y + (p.y - mapCenter.y) * pointToControlRatio;
    return {x, y};
  };
  return {mapScale, pointToControl, pointToMap};
}
