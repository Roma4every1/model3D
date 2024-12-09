import type { Translator } from './translator';
import type { MapExtraObject } from '../lib/types';
import { PolylineDrawer } from './polyline-drawer'
import { LabelDrawer } from './label-drawer';
import { SignDrawer } from './sign-drawer';
import { PieSliceDrawer } from './pieslice-drawer';
import { FieldDrawer } from './field-drawer';
import { PIXEL_PER_METER } from '../lib/map-utils';


export const types = {
  polyline: new PolylineDrawer(),
  label: new LabelDrawer(),
  sign: new SignDrawer(),
  pieslice: new PieSliceDrawer(),
  field: new FieldDrawer(),
};

function intersects(a: Bounds, b: Bounds): boolean {
  return a && b
    && (a.min.x < b.max.x)
    && (b.min.x < a.max.x)
    && (a.min.y < b.max.y)
    && (b.min.y < a.max.y);
}

export async function startPaint(canvas: HTMLCanvasElement, map: MapData, options: any): Promise<void> {
  const coords: Translator = options.coords;
  const topLeft = coords.pointToMap({x: 0, y: 0});
  const bottomRight = coords.pointToMap({x: canvas.width, y: canvas.height});

  const bounds: Bounds = {
    min: {x: Math.min(topLeft.x, bottomRight.x), y: Math.min(topLeft.y, bottomRight.y)},
    max: {x: Math.max(topLeft.x, bottomRight.x), y: Math.max(topLeft.y, bottomRight.y)},
  };

  const d = 0.1 * Math.max(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);
  bounds.min.x -= d;
  bounds.max.x += d;
  bounds.min.y -= d;
  bounds.max.y += d;

  const drawOptions: MapDrawOptions = {
    ctx: options.ctx,
    dotsPerMeter: window.devicePixelRatio * PIXEL_PER_METER,
    toMapPoint: coords.pointToMap,
    toCanvasPoint: coords.pointToControl,
  };

  const noDrafts = !options.draftDrawing;
  const mapScale = coords.mapScale;
  const extraObjects: Map<MapExtraObjectID, MapExtraObject> = options.extra;
  const onCheckExecution = options.onCheckExecution;

  map.x = options.point.x;
  map.y = options.point.y;
  map.scale = mapScale;

  try {
    for (const layer of map.layers) {
      if (!layer.visible || !layer.isScaleVisible(mapScale)) continue;
      if (!layer.elements || layer.elements.length === 0) continue;
      if (!intersects(bounds, layer.bounds)) continue;

      let c = onCheckExecution();
      if (c) await c;

      const elementDrawer: MapElementDrawer = types[layer.elementType];
      if (noDrafts) {
        for (const element of layer.elements) {
          if (!intersects(bounds, elementDrawer.bound(element))) continue;
          c = onCheckExecution();
          if (c) await c;
          elementDrawer.draw(element, drawOptions);
        }
      } else if (elementDrawer.draft) {
        for (const element of layer.elements) {
          if (!intersects(bounds, elementDrawer.bound(element))) continue;
          c = onCheckExecution();
          if (c) await c;
          elementDrawer.draft(element, drawOptions);
        }
      }
    }
    if (noDrafts && extraObjects) {
      for (const { layer, objectModel, objectBounds, render } of extraObjects.values()) {
        if (objectModel && layer.visible && layer.isScaleVisible(mapScale)) {
          if (intersects(bounds, objectBounds)) render(objectModel, drawOptions);
        }
      }
    }
    if (map.onDrawEnd) {
      map.onDrawEnd(options.point, coords.mapScale);
    }
  } catch {
    // ...
  }
}
