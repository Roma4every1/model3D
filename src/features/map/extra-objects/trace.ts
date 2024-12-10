import type { MapExtraObjectConfig, MapExtraObjectViewPayload } from '../lib/types';
import { PIXEL_PER_METER } from '../lib/map-utils';


export const traceMapConfig: MapExtraObjectConfig<TraceModel> = {
  id: 'trace',
  layer: {displayName: 'Трасса', minScale: 0, maxScale: Infinity},
  bound: traceBounds,
  render: traceRender,
  viewport: traceViewport,
};

function traceBounds(trace: TraceModel): Bounds {
  const min: Point = {x: Infinity, y: Infinity};
  const max: Point = {x: -Infinity, y: -Infinity};

  for (const { x, y } of trace.nodes) {
    if (x > max.x) max.x = x;
    if (x < min.x) min.x = x;
    if (y > max.y) max.y = y;
    if (y < min.y) min.y = y;
  }
  return {min, max};
}

function traceRender(trace: TraceModel, options: MapDrawOptions): void {
  const ctx = options.ctx;
  const nodes = trace.nodes;
  if (nodes.length === 0) return;

  const color = '#0000ff';
  const thickness = 5 * window.devicePixelRatio;
  const first = options.toCanvasPoint(nodes[0]);

  if (nodes.length === 1) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(first.x, first.y, thickness, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;

    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < nodes.length; ++i) {
      const point = options.toCanvasPoint(nodes[i]);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
  }
}

function traceViewport(payload: MapExtraObjectViewPayload<TraceModel>): MapViewport {
  if (payload.objectModel.nodes.length === 0) return;
  const { min, max } = payload.objectBounds;

  const cx = (min.x + max.x) / 2;
  const cy = (min.y + max.y) / 2;

  const sizeX = Math.abs(max.x - min.x);
  const sizeY = Math.abs(max.y - min.y);

  const { clientWidth, clientHeight } = payload.canvas;
  const kScale = 1.2 * Math.max(sizeX / clientWidth, sizeY / clientHeight);
  return {cx, cy, scale: kScale * PIXEL_PER_METER};
}
