import type { MapExtraObjectProvider } from './types';
import { MapStage } from '../lib/map-stage';
import { getPointBounds } from '../lib/bounds';
import { getBoundViewport } from '../lib/map-utils';


export class MapSiteObjectProvider implements MapExtraObjectProvider<SiteModel> {
  public model: SiteModel | null = null;

  constructor(private readonly stage: MapStage) {}

  public setModel(site: SiteModel): void {
    this.model = site;
  }

  public computeBounds(): Bounds {
    return getPointBounds(this.model.points);
  }

  public computeViewport(canvas: HTMLCanvasElement, bounds: Bounds): MapViewport {
    if (this.model.points.length === 0) return undefined;
    return getBoundViewport(canvas, bounds, 1.2);
  }

  public needChangeViewport(oldModel: SiteModel | null, newModel: SiteModel): boolean {
    return oldModel === null || oldModel.id !== newModel.id;
  }

  public render(options: MapDrawOptions): void {
    const { name, points: mapPoints } = this.model;
    if (mapPoints.length === 0) return;

    const ctx = options.ctx;
    const stroke = '#2d302d';
    const strokeWidth = 2 * window.devicePixelRatio;

    const points = mapPoints.map(p => options.toCanvasPoint(p));
    const first = points[0];

    if (points.length === 1) {
      ctx.fillStyle = stroke;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = window.devicePixelRatio;
      return this.drawPointRect(ctx, first);
    }
    ctx.beginPath();
    ctx.fillStyle = 'rgba(146,211,137,0.4)';
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';

    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; ++i) {
      const point = points[i];
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();

    ctx.fill('evenodd');
    ctx.stroke();
    ctx.lineJoin = 'miter';

    if (this.stage.getMode().startsWith('site')) {
      ctx.fillStyle = stroke;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = window.devicePixelRatio;

      this.drawPointRect(ctx, first);
      ctx.fillStyle = '#eafae7';

      for (let i = 1; i < points.length; ++i) {
        this.drawPointRect(ctx, points[i])
      }
    }
    if (name && mapPoints.length > 2) {
      const fontSize = 12 * window.devicePixelRatio;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = fontSize + 'px Roboto';

      const width = ctx.measureText(name).width;
      const { x, y } = getCentroid(points);

      ctx.fillStyle = '#eee';
      ctx.fillRect(x - width / 2 - 1, y - fontSize / 2 - 1, width + 2, fontSize + 2);
      ctx.fillStyle = '#111';
      ctx.fillText(name, x, y);
    }
  }

  private drawPointRect(ctx: CanvasRenderingContext2D, point: Point): void {
    const halfSize = 2.5 * window.devicePixelRatio;
    const size = halfSize * 2;

    ctx.beginPath();
    ctx.rect(point.x - halfSize, point.y - halfSize, size, size);
    ctx.fill();
    ctx.stroke();
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
