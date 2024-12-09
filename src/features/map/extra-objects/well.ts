import type { MapExtraObjectConfig, MapExtraObjectViewPayload } from '../lib/types';
import { MapStage } from '../lib/map-stage';
import { PIXEL_PER_METER } from '../lib/map-utils';


export const wellMapConfig: MapExtraObjectConfig<MapPoint> = {
  id: 'well',
  layer: {displayName: 'Скважина', minScale: 0, maxScale: Infinity},
  bound: wellBounds,
  render: wellRender,
  viewport: wellViewport,
};

function wellBounds(well: MapPoint): Bounds {
  const { x, y } = well;
  return {min: {x, y}, max: {x, y}};
}

function wellRender(well: MapPoint, options: MapDrawOptions): void {
  const { x, y } = options.toCanvasPoint(well);
  const halfSize = 8 * window.devicePixelRatio;
  const size = halfSize * 2;

  const ctx = options.ctx;
  ctx.strokeStyle = '#0000ff';
  ctx.lineWidth = 2 * window.devicePixelRatio;
  ctx.strokeRect(x - halfSize, y - halfSize, size, size);
}

function wellViewport(payload: MapExtraObjectViewPayload): MapViewport {
  const point = payload.objectModel;
  const stage = payload.stage as MapStage;

  if (stage.inclinometryModeOn) {
    const scale = 5_000;
    const inclPlugin = stage.getPlugin('incl');
    const centerX = point.x - inclPlugin.mapShiftX * scale / window.devicePixelRatio / PIXEL_PER_METER;
    const centerY = point.y - inclPlugin.mapShiftY * scale / window.devicePixelRatio / PIXEL_PER_METER;
    return {centerX, centerY, scale};
  } else {
    const data = stage.getMapData();
    const pointLayer = data.layers.find(l => l.elementType === 'sign');
    const wellScale = pointLayer?.getMaxScale() ?? 50_000;
    const scale = data.scale ? Math.min(data.scale, wellScale) : wellScale;
    return {centerX: point.x, centerY: point.y, scale};
  }
}
