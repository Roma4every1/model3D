import type { MapExtraObjectProvider } from './types';
import { getBoundViewport } from '../lib/map-utils';


export class MapTraceObjectProvider implements MapExtraObjectProvider<TraceModel> {
  public model: TraceModel | null = null;

  public setModel(trace: TraceModel): void {
    this.model = trace;
  }

  public computeBounds(): Bounds {
    let xMin = Infinity, yMin = Infinity;
    let xMax = -Infinity, yMax = -Infinity;

    for (const { x, y } of this.model.nodes) {
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
    return {min: {x: xMin, y: yMin}, max: {x: xMax, y: yMax}};
  }

  public computeViewport(canvas: HTMLCanvasElement, bounds: Bounds): MapViewport {
    if (this.model.nodes.length === 0) return undefined;
    return getBoundViewport(canvas, bounds, 1.2);
  }

  public needChangeViewport(oldModel: TraceModel | null, newModel: TraceModel): boolean {
    return oldModel === null || oldModel.id !== newModel.id;
  }

  public render(options: MapDrawOptions): void {
    const nodes = this.model.nodes;
    if (nodes.length === 0) return;

    const ctx = options.ctx;
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
}
