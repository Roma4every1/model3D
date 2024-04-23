import { PROFILE_X_STEP } from '../lib/constants';
import { ProfileStage } from './stage';


/** Отрисовщик профиля. */
export class ProfileDrawer implements IProfileDrawer {
  /** Количество пикселей в метре: `96px = 2.54cm`. */
  public static readonly pixelPerMeter = 100 * 96 / 2.54;
  /** Коэффициент уплотнения DPI для улучшения чёткости изображения. */
  public static readonly ratio = 2;
  /** Коэффицент для перевода горизнотального значения точки на карте в координаты канваса. */
  public static readonly HORIZONTAL_SCALE =
    ProfileDrawer.pixelPerMeter / 25000 * ProfileDrawer.ratio;
  /** Коэффицент для перевода вертикального значения точки на карте в координаты канваса. */
  public static readonly VERTICAL_SCALE =
    ProfileDrawer.pixelPerMeter / 200 * ProfileDrawer.ratio;

  /** Контекст отрисовки. */
  private ctx: CanvasRenderingContext2D;

  /** Порт просмотра профиля. */
  public readonly viewport: ProfileViewport;

  /** Конфиг отрисовщика. */
  public readonly drawerConfig: ProfileDrawerConfig;

  constructor(config: ProfileDrawerConfig) {
    this.drawerConfig = config;

    this.viewport = {
      currentX: 0, currentY: 0,
      currentMaxX: 10000, currentMaxY: 10000,
      startX: 0, startY: 0,
      width: 0, height: 0,
      realWidth: 0, realHeight: 0,
      minX: 0, maxX: 10000, minY: 1400, maxY: 1500
    }
  }

  public setViewportCurrentPosition(x: number, y: number) {
    if (x !== null) this.viewport.currentX = x;
    if (y !== null) this.viewport.currentY = y;

    this.viewport.currentMaxX = this.viewport.currentX + this.viewport.realWidth;
    this.viewport.currentMaxY = this.viewport.currentY + this.viewport.realHeight;
  }

  /** Устанавливает настройки оси Y. */
  public setYAxisSettings(settings: ProfileYAxisSettings): void {
    this.viewport.minY = settings.yMin;
    this.viewport.maxY = settings.yMax;
    // this.yDelta = settings.yDelta;
  }

  /** Устанавливает настройки оси X. */
  public setXAxisSettings(settings: ProfileXAxisSettings): void {
    this.viewport.minX = settings.xMin;
    this.viewport.maxX = settings.xMax;
    // this.xDelta = settings.xDelta;
  }

  /** Устанавливает контекст отрисовки. */
  public setContext(context: CanvasRenderingContext2D): void {
    this.ctx = context;
  }

  /* --- Rendering --- */

  private setLineSettings(width: number, color: ColorHEX | CanvasPattern): void {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
  }

  private setTextSettings(font: string, color: ColorHEX, align: CanvasTextAlign, baseline: CanvasTextBaseline): void {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
  }

  public toCanvasCoords(point: Point): Point {
    return {
      x: this.viewport.startX + (point.x - this.viewport.currentX) * ProfileDrawer.HORIZONTAL_SCALE,
      y: this.viewport.startY + (point.y - this.viewport.currentY) * ProfileDrawer.VERTICAL_SCALE
    }
  }

  public render(plastDataMap: ProfilePlastMap): void {
    this.drawLines(plastDataMap);

    this.drawAxes();
  }

  private drawLines(plastDataMap: ProfilePlastMap): void {
    plastDataMap.forEach((plastData) => {
      if (plastData?.layers?.length) {
        plastData.layers.forEach(layer => {
          this.drawPlastLines(layer.borderLine, true);
        })
      }

      this.drawPlastLines(plastData.borderLine);
    })
  }

  private drawPlastLines(plastLinesData: ProfileBorderLineData, isLayer = false) {

    this.setLineSettings(1, isLayer ? '#00FF00' : '#000000');
    this.drawLine(plastLinesData, 'TOP');

    this.setLineSettings(1, isLayer ? '#FF0000' : '#0000ff');
    this.drawLine(plastLinesData, 'BASE');
  }

  private drawLine(lineData: ProfileBorderLineData, type: 'TOP' | 'BASE'): void {
    if (!lineData?.length) {
      return;
    }

    this.ctx.beginPath();

    let isFirstPoint = true;
    for (let i = 1; i < lineData.length; i++) {
      if ((i*PROFILE_X_STEP < this.viewport.currentX) || (i*PROFILE_X_STEP > this.viewport.currentMaxX))
        continue;
      const p = lineData[i];
      const absMark = type === 'TOP' ? p.topAbsMark : p.baseAbsMark;

      const point = {x: i*PROFILE_X_STEP, y: absMark};
      const {x: canvasX, y: canvasY} = this.toCanvasCoords(point);

      if (isFirstPoint) {
        this.ctx.moveTo(canvasX, canvasY);
        isFirstPoint = false;
      } else {
        this.ctx.lineTo(canvasX, canvasY);
      }
    }
    this.ctx.stroke();
  }

  public clear(): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, width, height);
  }

  private drawAxes (): void {
    this.drawPlastAxis();
    this.drawYAxis();
    this.drawXAxis();
    this.drawColumnNameAxis();
  }

  private drawColumnNameAxis (): void {
    this.drawAxisRect(
      0,
      0,
      this.ctx.canvas.width,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT
    );
    this.drawAxisRect(
      0,
      0,
      ProfileStage.PLAST_AXIS_WIDTH,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT
    );
    this.drawAxisRect(
      ProfileStage.PLAST_AXIS_WIDTH,
      0,
      ProfileStage.Y_AXIS_WIDTH,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT
    );
    this.setTextSettings(
      'bold 18px serif',
      '#000000',
      'center',
      'middle'
    );
    this.drawRotatedText(
      'Пласт',
      ProfileStage.PLAST_AXIS_WIDTH / 2,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT / 2,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT
    );
    this.drawRotatedText(
      'Абсол. отм.',
      ProfileStage.PLAST_AXIS_WIDTH + ProfileStage.Y_AXIS_WIDTH / 2,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT / 2,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT
    );
  }

  private drawPlastAxis (): void {
    this.drawAxisRect(
      0,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT,
      ProfileStage.PLAST_AXIS_WIDTH,
      this.ctx.canvas.height
    );
  }

  private drawYAxis (): void {
    this.drawAxisRect(
      ProfileStage.PLAST_AXIS_WIDTH,
      ProfileStage.COLUMN_NAME_AXIS_HEIGHT,
      ProfileStage.Y_AXIS_WIDTH,
      this.ctx.canvas.height
    );

    this.setTextSettings(
      'bold 24px serif',
      '#000000',
      'right',
      'bottom'
    );

    const barCanvasX = ProfileStage.PLAST_AXIS_WIDTH + ProfileStage.Y_AXIS_WIDTH;

    let barLength: number;
    const firstNodeY = Math.ceil(this.viewport.currentY);
    for (let y = firstNodeY; y < this.viewport.currentMaxY; y++) {
      const {y: canvasY} = this.toCanvasCoords({x: 0, y})

      barLength = 10;
      this.ctx.lineWidth = 1;
      if (y % ProfileStage.Y_AXIS_BARS_STEP === 0) {
        this.ctx.fillText(y.toString(), barCanvasX - 5, canvasY - 2, ProfileStage.Y_AXIS_WIDTH);
        barLength = 20;
        this.ctx.lineWidth = 2;
      }
      this.ctx.strokeStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.moveTo(barCanvasX, canvasY);
      this.ctx.lineTo(barCanvasX - barLength, canvasY);
      this.ctx.stroke();
    }
  }

  private drawXAxis (): void {
    const canvasY = this.ctx.canvas.height - ProfileStage.X_AXIS_HEIGHT;
    this.drawAxisRect(
      0,
      canvasY,
      this.ctx.canvas.width,
      ProfileStage.X_AXIS_HEIGHT
    );
    this.setTextSettings(
      'bold 24px serif',
      '#000000',
      'center',
      'middle'
    );
    const textCanvasY = canvasY + ProfileStage.X_AXIS_HEIGHT / 2;
    let barLength;
    const firstNodeX = Math.ceil(this.viewport.currentX/PROFILE_X_STEP)*PROFILE_X_STEP;
    for (let x = firstNodeX; x < this.viewport.currentMaxX; x += PROFILE_X_STEP ) {
      const {x: canvasX} = this.toCanvasCoords({x, y: 0})
      barLength = this.drawerConfig.axis.markSize;
      this.ctx.lineWidth = 1;
      if (x % 1000 === 0) {
        this.ctx.fillText(x.toString(), canvasX, textCanvasY, PROFILE_X_STEP);
        barLength = this.drawerConfig.axis.markSize * 2;
        this.ctx.lineWidth = 2;
      }
      this.ctx.strokeStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.moveTo(canvasX, canvasY);
      this.ctx.lineTo(canvasX, canvasY + barLength);
      this.ctx.stroke();
    }
  }

  private drawRotatedText(
    text: string,
    x: number,
    y: number,
    width: number,
  ): void {
    this.ctx.save();
    this.ctx.rotate(-Math.PI/2);
    this.ctx.translate(-y, x);
    this.ctx.fillText(text, 0, 0, width);
    this.ctx.restore();
  }

  private drawAxisRect(x: number, y: number, w: number, h: number) {
    this.ctx.fillStyle = '#EAEAEA';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = '#000000';
    this.ctx.strokeRect(x, y, w, h);
  }

  // public drawTraceNodes(traceNodesInclData: any) {
  //   traceNodesInclData.forEach(node => {
  //     if (!node) {
  //       return;
  //     }
  //     this.setLineSettings(3, '#ff0000');
  //     this.ctx.beginPath();
  //
  //     const topCanvasPoint = {x: node.ustDistance, y: 0};
  //     const {x: topX, y: topY} = this.toCanvasCoords(topCanvasPoint);
  //     this.setTextSettings(
  //       'bold 24px serif',
  //       '#ff0000',
  //       'center',
  //       'bottom'
  //     );
  //     this.ctx.fillText(node.WELL_ID.toString(), topX, topY);
  //     this.ctx.moveTo(topX, topY);
  //     this.ctx.lineTo(topX, topY + this.viewport.height);
  //
  //     this.ctx.stroke();
  //
  //     this.setLineSettings(2, '#00ec05');
  //     this.ctx.beginPath();
  //     let isFirstPoint = true;
  //     node?.inclPoints?.forEach(point => {
  //       const canvasPoint = {x: point.distance, y: point.absValue};
  //       const {x, y} = this.toCanvasCoords(canvasPoint);
  //       if (isFirstPoint) {
  //         this.ctx.moveTo(x, y);
  //         isFirstPoint = false;
  //       } else {
  //         this.ctx.lineTo(x, y);
  //       }
  //     })
  //     this.ctx.stroke();
  //   })
  // }

  // public drawLitology(plastDataMap: ProfilePlastDataMap, inclData: any) {
  //
  // }
}
