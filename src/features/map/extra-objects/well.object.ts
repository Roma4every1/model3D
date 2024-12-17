import type { MapExtraObjectProvider } from './types';
import { MapStage } from '../lib/map-stage';


export class MapWellObjectProvider implements MapExtraObjectProvider<MapPoint, MapPoint | WellID> {
  public model: MapPoint | null = null;

  constructor(private readonly stage: MapStage) {}

  public setModel(payload: MapPoint | WellID): void {
    if (typeof payload === 'number') {
      if (this.model?.UWID === payload) return;
      this.model = this.stage.getNamedPoint(payload) ?? null;
    } else {
      this.model = payload;
    }
  }

  public computeBounds(): Bounds {
    const { x, y } = this.model;
    return {min: {x, y}, max: {x, y}};
  }

  public computeViewport(): MapViewport {
    const data = this.stage.getMapData();
    const pointLayer = data.layers.find(l => l.elementType === 'sign');
    const wellScale = pointLayer?.getMaxScale() ?? 50_000;
    const scale = data.scale ? Math.min(data.scale, wellScale) : wellScale;
    return {cx: this.model.x, cy: this.model.y, scale};
  }

  public render(options: MapDrawOptions): void {
    const { x, y } = options.toCanvasPoint(this.model);
    const halfSize = 8 * window.devicePixelRatio;
    const size = halfSize * 2;

    const ctx = options.ctx;
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.strokeRect(x - halfSize, y - halfSize, size, size);
  }
}
