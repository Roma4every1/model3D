import { pixelPerMeter } from './constants';


export function createMapElementInit(element: MapElement): MapElement {
  const type = element.type;
  let copy: MapElement;

  if (type === 'sign' || type === 'label') {
    copy = {...element};
  } else if (type === 'field') {
    copy = structuredClone(element);
  } else {
    copy = structuredClone({...element, fillStyle: undefined});
    copy.fillStyle = element.fillStyle;
  }
  delete copy.selected;
  delete copy.edited;
  return copy;
}

export function validateMapElement(element: MapElement): boolean {
  if (element.type === 'polyline') {
    return element.arcs[0].path.length > 2;
  }
  return true;
}

/** Определяет вьюпорт карты, чтобы всё внутри указанных границ было видимым. */
export function getBoundViewport(canvas: HTMLCanvasElement, bounds: Bounds, k: number): MapViewport {
  const { x: xMin, y: yMin } = bounds.min;
  const { x: xMax, y: yMax } = bounds.max;

  const sizeX = (xMax - xMin) / canvas.clientWidth;
  const sizeY = (yMax - yMin) / canvas.clientHeight;

  const scale = k * Math.max(sizeX, sizeY) * pixelPerMeter;
  return {cx: (xMin + xMax) / 2, cy: (yMin + yMax) / 2, scale};
}

/** Определяет вьюпорт карты, чтобы все её элементы были видимыми. */
export function getFullViewport(canvas: HTMLCanvasElement, layers: IMapLayer[]): MapViewport {
  let xMin = Infinity, yMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity;

  for (const layer of layers) {
    if (!layer.visible) continue;
    const { min, max } = layer.bounds;

    if (min.x < xMin) xMin = min.x;
    if (min.y < yMin) yMin = min.y;
    if (max.x > xMax) xMax = max.x;
    if (max.y > yMax) yMax = max.y;
  }
  const sizeX = (xMax - xMin) / canvas.clientWidth;
  const sizeY = (yMax - yMin) / canvas.clientHeight;

  const scale = 1.15 * Math.max(sizeX, sizeY) * pixelPerMeter;
  return {cx: (xMin + xMax) / 2, cy: (yMin + yMax) / 2, scale};
}
