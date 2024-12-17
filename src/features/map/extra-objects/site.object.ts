import type { MapExtraObjectProvider } from './types';
import { getBoundViewport } from '../lib/map-utils';


export class MapSiteObjectProvider implements MapExtraObjectProvider<SiteModel> {
  public model: SiteModel | null = null;

  public setModel(site: SiteModel): void {
    this.model = site;
  }

  public computeBounds(): Bounds {
    let xMin = Infinity, yMin = Infinity;
    let xMax = -Infinity, yMax = -Infinity;

    for (const { x, y } of this.model.points) {
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
    return {min: {x: xMin, y: yMin}, max: {x: xMax, y: yMax}};
  }

  public computeViewport(canvas: HTMLCanvasElement, bounds: Bounds): MapViewport {
    if (this.model.points.length === 0) return undefined;
    return getBoundViewport(canvas, bounds, 1.2);
  }

  public needChangeViewport(oldModel: SiteModel | null, newModel: SiteModel): boolean {
    return oldModel === null || oldModel.id !== newModel.id;
  }

  public render(options: MapDrawOptions): void {
    const { name, points } = this.model;
    if (points.length === 0) return;

    const ctx = options.ctx;
    const stroke = '#435740';
    const strokeWidth = 1.5 * window.devicePixelRatio;
    const first = options.toCanvasPoint(points[0]);

    if (points.length === 1) {
      ctx.beginPath();
      ctx.fillStyle = stroke;
      ctx.arc(first.x, first.y, strokeWidth, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.fillStyle = 'rgba(146,211,137,0.4)';
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; ++i) {
      const point = options.toCanvasPoint(points[i]);
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();

    ctx.fill('evenodd');
    ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';

    if (name && points.length > 2) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Roboto';

      const { x, y } = options.toCanvasPoint(getCentroid(points));
      const width = ctx.measureText(name).width;

      ctx.fillStyle = '#eee';
      ctx.fillRect(x - width / 2 - 1, y - 9, width + 2, 18);
      ctx.fillStyle = '#111';
      ctx.fillText(name, x, y);
    }
  }
}

function getCentroid(points: Point[]): Point {
  let sumX = 0;
  let sumY = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }
  return {x: sumX / points.length, y: sumY / points.length};
}
