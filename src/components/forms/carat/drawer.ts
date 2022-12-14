/** Отрисовщик каротажной диаграммы. */
export class CaratDrawer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private ratio: number = window.devicePixelRatio;
  private w: number;

  constructor(canvas: HTMLCanvasElement) {
    this.setCanvas(canvas);
  }

  private updateSize(): void {
    const width = this.canvas.clientWidth * this.ratio;
    const height = this.canvas.clientHeight * this.ratio;

    if (this.canvas.width !== width) {
      this.canvas.width = width;
      this.width = width;
    }
    if (this.canvas.height !== height) {
      this.canvas.height = height;
      this.height = height;
    }
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')
  }

  /* --- Rendering --- */

  private renderHeader(): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#363636';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 24px "Segoe UI", Roboto';
    this.ctx.fillText('32', this.width / 2, 28);
    this.ctx.strokeRect(5, 5, this.width - 10, 30);
  }

  private renderAxes(): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#303030';
    this.ctx.moveTo(0, 100);
    this.ctx.lineTo(this.width, 100);
    this.ctx.stroke();
  }

  private renderColumn(column: CaratColumn) {
    this.w += column.columnSettings.width * this.ratio;
    this.ctx.beginPath();
    this.ctx.moveTo(this.w, 100);
    this.ctx.lineTo(this.w, this.height);
    this.ctx.stroke();
  }

  public render(data: CaratColumn[]): void {
    this.updateSize();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.renderHeader();
    this.renderAxes();
    this.w = 0;
    data.forEach((column) => this.renderColumn(column));
  }
}
