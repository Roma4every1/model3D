import { MapLayer } from 'features/map/lib/map-layer';
import { Scroller } from 'features/map/drawer/scroller';
import { showMap } from 'features/map/drawer/maps';
import { PIXEL_PER_METER } from 'features/map/lib/map-utils';
import { getBounds } from './utils';


/** Сцена профиля. */
export class ProfileStage implements IProfileStage {
  /** Ссылка на элемент холста. */
  private canvas: MapCanvas = null;
  /** Данные карты. */
  private data: MapData = null;
  /** Вспомогательные данные для отрисовщика. */
  private detach: () => void;

  /** Scroller. */
  public readonly scroller: Scroller;

  constructor() {
    this.scroller = new Scroller();
  }

  /** Обновляет ссылку на холст. */
  public setCanvas(canvas: HTMLCanvasElement): void {
    if (canvas) {
      this.canvas = canvas as MapCanvas;
      this.scroller.setCanvas(this.canvas);
      this.resize();
      this.updateViewport();
    }
  }

  /** Обновляет вид в соответствии с текущими размерами холста. */
  public resize(): void {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
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

  /** Обновляет данные профиля. */
  public setData(mapData: MapData): void {
    if (!mapData) return;
    this.data = mapData;
    this.updateViewport();
    this.render();
  }

  /** Возвращает данные профиля. */
  public getMapData(): MapData {
    return this.data;
  }

  public updateViewport(): void {
    if (!this.canvas) return;
    if (!this.data?.layers) return;

    const mapBounds = getBounds(this.data.layers as MapLayer[]);

    const scale = (mapBounds.max.y - mapBounds.min.y)
      * PIXEL_PER_METER / this.canvas.clientHeight * 1.3;

    const viewportWidth = this.canvas.clientWidth / PIXEL_PER_METER * scale / 1.3;

    const centerX = mapBounds.min.x + viewportWidth / 2;
    const centerY = (mapBounds.min.y + mapBounds.max.y) / 2;

    this.data.x = centerX;
    this.data.y = centerY;
    this.data.scale = scale;
  }

  /** Полный рендер всей сцены профиля. */
  public render(viewport?: MapViewport): void {
    if (!this.canvas || !this.data) return;
    if (!viewport) {
      if (this.data.x === undefined) return;
      viewport = {centerX: this.data.x, centerY: this.data.y, scale: this.data.scale};
    }
    if (this.detach) this.detach();
    this.detach = showMap(this.canvas, this.data, viewport);
  }
}
