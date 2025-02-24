import type { MapExtraObjectProvider } from './types';


export class MapFieldValueObjectProvider implements MapExtraObjectProvider<Point> {
  public model: Point | null = null;

  public setModel(payload: Point): void {
    this.model = payload;
  }

  public computeBounds(): Bounds {
    const { x, y } = this.model;
    return {min: {x, y}, max: {x, y}};
  }

  public render(options: MapDrawOptions): void {
    const ctx = options.ctx;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5 * window.devicePixelRatio;

    const { x, y } = options.toCanvasPoint(this.model);
    const r = 3 * window.devicePixelRatio;
    const d = 1.5 * window.devicePixelRatio;
    const pi = Math.PI, pi2 = Math.PI / 2;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * pi);
    ctx.stroke();

    ctx.beginPath(); // right top quarter
    ctx.arc(x + d, y - d, r + d, -pi2, 0);
    ctx.stroke();

    ctx.beginPath(); // left top quarter
    ctx.arc(x - d, y - d, r + d, pi, -pi2);
    ctx.stroke();

    ctx.beginPath(); // left bottom quarter
    ctx.arc(x - d, y + d, r + d, pi2, pi);
    ctx.stroke();

    ctx.beginPath(); // right bottom quarter
    ctx.arc(x + d, y + d, r + d, 0, pi2);
    ctx.stroke();
  }
}
