import { Scroller } from 'features/map/drawer/scroller';
import { showMap } from 'features/map/drawer/maps';
import { getTotalBounds } from 'features/map/lib/bounds';
import { pixelPerMeter } from 'features/map/lib/constants';


/** Сцена профиля. */
export class ProfileStage implements IProfileStage {
  /** Scroller. */
  public readonly scroller: Scroller;
  /** Ссылка на элемент холста. */
  private ctx: CanvasRenderingContext2D = null;
  /** Данные карты. */
  private data: MapData = null;
  /** Вспомогательные данные для отрисовщика. */
  private detach: () => void;

  constructor() {
    this.scroller = new Scroller();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    if (canvas) {
      this.ctx = canvas.getContext('2d');
      this.scroller.setCanvas(canvas as MapCanvas);
      this.resize();
    } else {
      this.ctx = null;
    }
  }

  public resize(): void {
    if (!this.ctx) return;
    const canvas = this.ctx.canvas;
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
  }

  public handleMouseDown(event: MouseEvent): void {
    this.scroller.mouseDown(event);
  }

  public handleMouseMove(event: MouseEvent): void {
    this.scroller.mouseMove(event);
  }

  public handleMouseWheel(event: WheelEvent): void {
    this.scroller.wheel(event);
  }

  public setData(mapData: MapData): void {
    if (!mapData) return;
    this.data = mapData;
    this.updateViewport();
    this.render();
  }

  public setActiveLayer(): void {
    // for LayerTreeLeaf
  }

  public getMapData(): MapData {
    return this.data;
  }

  public updateViewport(): void {
    if (!this.ctx || !this.data?.layers) return;
    const { clientWidth, clientHeight } = this.ctx.canvas;
    const { min, max } = getTotalBounds(this.data.layers);

    const scale = (max.y - min.y) * pixelPerMeter / clientHeight * 1.3;
    const viewportWidth = clientWidth / pixelPerMeter * scale / 1.3;

    this.data.x = min.x + viewportWidth / 2;
    this.data.y = (min.y + max.y) / 2;
    this.data.scale = scale;
  }

  public render(viewport?: MapViewport): void {
    if (!this.ctx || !this.data) return;
    if (!viewport) {
      if (this.data.x === undefined) return;
      viewport = {cx: this.data.x, cy: this.data.y, scale: this.data.scale};
    }
    if (this.detach) this.detach();
    this.detach = showMap(this.ctx, this.data, viewport);
  }
}
