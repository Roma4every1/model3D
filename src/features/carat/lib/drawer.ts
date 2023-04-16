import { CaratDrawerSettings } from './types';


/** Отрисовщик каротажной диаграммы. */
export class CaratDrawer implements ICaratDrawer {
  /** Количество пикселей в метре: `96px = 2.54cm`. */
  public static readonly pixelPerMeter = 100 * 96 / 2.54;
  /** Коэффициент уплотнения DPI для улучшения чёткости изображения. */
  public static ratio = 2;

  /** Настройки отрисовки. */
  private readonly drawSettings: CaratDrawerSettings;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  private well: string;
  private data: CaratData;
  private viewport: CaratViewport;
  private columns: CaratColumnInit[];

  private currentColumn: CaratColumnInit;
  private currentX: number;
  private currentWidth: number;

  constructor(drawSettings: CaratDrawerSettings) {
    this.drawSettings = drawSettings;
  }

  public resize(): void {
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /* --- Rendering --- */

  private setLineSettings(width: number, color: string) {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
  }

  private setTextSettings(font: string, color: string, align?: CanvasTextAlign, baseline?: CanvasTextBaseline) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align ?? 'left';
    this.ctx.textBaseline = baseline ?? 'bottom';
  }

  private renderHeader() {
    const { font, color } = this.drawSettings.header;
    this.setTextSettings(font, color, 'center');
    this.ctx.fillText(this.well, this.width / 2, 60);
    this.setLineSettings(1, '#363636');
    this.ctx.strokeRect(6, 6, this.width - 12, 55);
  }

  private renderColumnAxis() {
    const { font, color, markSize } = this.drawSettings.verticalAxes;
    const viewportY = this.viewport.y;

    const step = this.currentColumn.yAxis.step;
    const minY = Math.ceil(viewportY / step) * step;
    const maxY = minY + (this.height - 6) / this.viewport.scale / CaratDrawer.ratio;

    this.setLineSettings(5, '#303030');
    this.setTextSettings(font, color, 'left', 'middle');
    this.ctx.beginPath();

    for (let y = minY; y < maxY; y += step) {
      const canvasY = 115 + (y - viewportY) * this.viewport.scale * CaratDrawer.ratio;
      this.ctx.moveTo(this.currentX, canvasY);
      this.ctx.lineTo(this.currentX + markSize, canvasY);
      this.ctx.fillText(y.toString(), this.currentX + 1.1 * markSize, canvasY);
    }
    this.ctx.stroke();
  }

  private renderColumnHeader() {
    const settings = this.currentColumn.settings;
    const width = settings.width * CaratDrawer.ratio * window.devicePixelRatio;
    const x = this.currentX + width / 2;
    if (settings.label) this.ctx.fillText(settings.label, x, 105, width);
    this.currentX += width;
  }

  private renderColumn() {
    this.currentWidth = this.currentColumn.settings.width * CaratDrawer.ratio * window.devicePixelRatio;
    this.renderIntervals();
    if (this.currentColumn.yAxis.show) this.renderColumnAxis();

    this.setLineSettings(this.currentColumn.active ? 5 : 2, 'black');
    this.ctx.strokeRect(this.currentX, 115, this.currentWidth, this.height - 120);
    this.currentX += this.currentWidth;
  }

  private renderIntervals() {
    const { y, scale } = this.viewport;

    for (const { name } of this.currentColumn.channels) {
      this.ctx.lineWidth = 2 * CaratDrawer.ratio;
      this.ctx.strokeStyle = 'black';
      this.ctx.fillStyle = 'gray';

      this.data[name]?.data.forEach((interval) => {
        if (interval.base < y) return;
        const intervalY = 115 + scale * CaratDrawer.ratio * (interval.top - y);
        const height = scale * CaratDrawer.ratio * (interval.base - interval.top);
        this.ctx.fillRect(this.currentX, intervalY, this.currentWidth, height);
        this.ctx.strokeRect(this.currentX, intervalY, this.currentWidth, height);
      });
    }
  }

  public render(well?: string, viewport?: CaratViewport, columns?: CaratColumnInit[], data?: CaratData) {
    if (arguments.length) {
      this.well = well;
      this.viewport = viewport;
      this.columns = columns;
      this.data = data;
    }
    if (!this.ctx || !this.columns) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.currentX = 4;
    for (const column of this.columns) {
      this.currentColumn = column;
      this.renderColumn();
    }

    this.ctx.clearRect(0, 0, this.width, 114);

    const { font, color, align } = this.drawSettings.columnLabels;
    this.setTextSettings(font, color, align);

    this.currentX = 4;
    for (const column of this.columns) {
      this.currentColumn = column;
      this.renderColumnHeader();
    }
    this.renderHeader();
  }
}
