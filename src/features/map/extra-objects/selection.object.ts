import type { MapExtraObjectProvider } from './types';
import { MapStage } from '../lib/map-stage';
import { getPointBounds } from '../lib/bounds';
import { getBoundViewport } from '../lib/map-utils';


export class MapSelectionObjectProvider implements MapExtraObjectProvider<SelectionModel> {
  public model: SelectionModel | null = null;
  private points: Point[];

  constructor(private readonly stage: MapStage) {}

  public setModel(selection: SelectionModel): void {
    this.model = selection;
    this.points = selection.items.map(item => this.stage.getNamedPoint(item.id)).filter(Boolean);
  }

  public computeBounds(): Bounds {
    return getPointBounds(this.points);
  }

  public computeViewport(canvas: HTMLCanvasElement, bounds: Bounds): MapViewport {
    if (this.points.length === 0) return undefined;
    return getBoundViewport(canvas, bounds, 1.2);
  }

  public needChangeViewport(oldModel: SelectionModel | null, newModel: SelectionModel): boolean {
    return oldModel === null || oldModel.id !== newModel.id;
  }

  public render(options: MapDrawOptions): void {
    if (this.model.items.length === 0 || !this.points) return;
    const halfSize = 8 * window.devicePixelRatio;
    const size = halfSize * 2;

    const ctx = options.ctx;
    ctx.strokeStyle = '#a202ba';
    ctx.lineWidth = 2 * window.devicePixelRatio;

    for (const point of this.points) {
      const { x, y } = options.toCanvasPoint(point);
      ctx.strokeRect(x - halfSize, y - halfSize, size, size);
    }
  }
}
