import {PROFILE_X_STEP} from "../lib/constants.ts";

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

  /** Высота оси оси с названиями колонок. */
  public static readonly COLUMN_NAME_AXIS_HEIGHT = 100;
  /** Высота оси X. */
  public static readonly X_AXIS_HEIGHT = 70;
  /** Ширина оси Y. */
  public static readonly Y_AXIS_WIDTH = 90;
  /** Размер шага по оси Y. */
  public static readonly Y_AXIS_BARS_STEP = 5;
  /** Ширина оси с названиями пластов. */
  public static readonly PLAST_AXIS_WIDTH = 50;

  /** Контекст отрисовки. */
  private ctx: CanvasRenderingContext2D;

  /** Отступ по горизонтали для основой области профиля. */
  private xDrawOffset: number;
  /** Отступ по вертикали для основой области профиля. */
  private yDrawOffset: number;

  private yMin: number;
  private yMax: number;
  private yDelta: number;

  private xMin: number;
  private xMax: number;
  private xDelta: number;

  /** Конфиг отрисовщика. */
  public readonly drawerConfig: ProfileDrawerConfig;

  constructor(config: ProfileDrawerConfig) {
    this.drawerConfig = config;
    this.xDrawOffset = ProfileDrawer.PLAST_AXIS_WIDTH + ProfileDrawer.Y_AXIS_WIDTH;
    this.yDrawOffset = ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT;
  }

  /** Устанавливает настройки оси Y. */
  public setYAxisSettings(settings: ProfileYAxisSettings): void {
    this.yMin = settings.yMin;
    this.yMax = settings.yMax;
    this.yDelta = settings.yDelta;
  }

  /** Устанавливает настройки оси X. */
  public setXAxisSettings(settings: ProfileXAxisSettings): void {
    this.xMin = settings.xMin;
    this.xMax = settings.xMax;
    this.xDelta = settings.xDelta;
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

  public render(linesData: ProfilePlastData[]): void {
    console.log('render')
    this.drawAxes();
    this.drawLines(linesData);
  }

  private drawLines(linesData: ProfilePlastData[]): void {
    linesData.forEach(p => this.drawPlastLines(p));
  }

  private drawPlastLines(plastLinesData: ProfilePlastData) {
    this.setLineSettings(1, '#000000');
    this.drawLine(plastLinesData[0]);

    this.setLineSettings(1, '#0000ff');
    this.drawLine(plastLinesData[1]);
  }

  private drawLine(lineData: ProfileLineData): void {
    this.ctx.beginPath();

    const canvasStartY = (this.yMax - lineData[0].value) * ProfileDrawer.VERTICAL_SCALE;
    this.ctx.moveTo(this.xDrawOffset , canvasStartY);

    for (let i = 1; i < lineData.length; i++) {
      const p = lineData[i];
      const canvasY = this.yDrawOffset + (this.yMax - p.value) * ProfileDrawer.VERTICAL_SCALE;
      const canvasX = this.xDrawOffset + (i*PROFILE_X_STEP) * ProfileDrawer.HORIZONTAL_SCALE;
      this.ctx.lineTo(canvasX, canvasY);
    }

    this.ctx.stroke();
  }

  public clear(): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, width, height);
  }

  private drawAxes (): void {
    this.drawColumnNameAxis();
    this.drawPlastAxis();
    this.drawYAxis();
    this.drawXAxis();
  }

  private drawColumnNameAxis (): void {
    this.drawAxisRect(
      0,
      0,
      this.ctx.canvas.width,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT
    );
    this.drawAxisRect(
      0,
      0,
      ProfileDrawer.PLAST_AXIS_WIDTH,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT
    );
    this.drawAxisRect(
      ProfileDrawer.PLAST_AXIS_WIDTH,
      0,
      ProfileDrawer.Y_AXIS_WIDTH,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT
    );
    this.setTextSettings(
      'bold 18px serif',
      '#000000',
      'center',
      'middle'
    );
    this.drawRotatedText(
      'Пласт',
      ProfileDrawer.PLAST_AXIS_WIDTH / 2,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT / 2,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT
    );
    this.drawRotatedText(
      'Абсол. отм.',
      ProfileDrawer.PLAST_AXIS_WIDTH + ProfileDrawer.Y_AXIS_WIDTH / 2,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT / 2,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT
    );
  }

  private drawPlastAxis (): void {
    this.drawAxisRect(
      0,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT,
      ProfileDrawer.PLAST_AXIS_WIDTH,
      this.ctx.canvas.height
    );
  }

  private drawYAxis (): void {
    this.drawAxisRect(
      ProfileDrawer.PLAST_AXIS_WIDTH,
      ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT,
      ProfileDrawer.Y_AXIS_WIDTH,
      this.ctx.canvas.height
    );

    this.setTextSettings(
      'bold 24px serif',
      '#000000',
      'center',
      'middle'
    );

    const canvasX = ProfileDrawer.PLAST_AXIS_WIDTH + ProfileDrawer.Y_AXIS_WIDTH / 2.5;
    const barCanvasX = ProfileDrawer.PLAST_AXIS_WIDTH + ProfileDrawer.Y_AXIS_WIDTH;

    const yMaxRounded = Math.floor(this.yMax);

    let barLength;
    for (let y = yMaxRounded; y >= this.yMin; y--) {
      const canvasY = this.yDrawOffset + (this.yMax - y) * ProfileDrawer.VERTICAL_SCALE;

      barLength = 10;
      this.ctx.lineWidth = 1;
      if (y % ProfileDrawer.Y_AXIS_BARS_STEP === 0) {
        this.ctx.fillText(y.toString(), canvasX, canvasY, ProfileDrawer.Y_AXIS_WIDTH);
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
    const canvasY = this.yDrawOffset + this.yDelta * ProfileDrawer.VERTICAL_SCALE;
    this.drawAxisRect(
      0,
      canvasY,
      this.ctx.canvas.width,
      ProfileDrawer.X_AXIS_HEIGHT
    );
    this.setTextSettings(
      'bold 24px serif',
      '#000000',
      'center',
      'middle'
    );
    const textCanvasY = canvasY + ProfileDrawer.X_AXIS_HEIGHT / 2;
    let barLength;
    for (let x = 0; x < this.xDelta; x += PROFILE_X_STEP ) {
      const canvasX = this.xDrawOffset + x * ProfileDrawer.HORIZONTAL_SCALE;
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
}
