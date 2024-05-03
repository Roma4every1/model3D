import { ProfileDrawer } from './drawer';


/** Сцена профиля. */
export class ProfileStage implements IProfileStage {
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

  /** Отрисовщик. */
  private readonly drawer: ProfileDrawer;
  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;

  private plastsLinesDataMap: ProfilePlastMap;

  /** Отступ по горизонтали для основой области профиля. */
  private xViewportOffset: number;
  /** Отступ по вертикали для основой области профиля. */
  private yViewportOffset: number;

  constructor(drawerConfig: ProfileDrawerConfig) {
    this.plastsLinesDataMap = null;
    this.drawer = new ProfileDrawer(drawerConfig);
  }

  /** Обновляет ссылку на холст. */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    if (canvas) {
      this.drawer.setContext(canvas.getContext('2d'));
      this.xViewportOffset = ProfileStage.PLAST_AXIS_WIDTH + ProfileStage.Y_AXIS_WIDTH;
      this.yViewportOffset = ProfileStage.COLUMN_NAME_AXIS_HEIGHT;
      this.resize();
      this.drawer.setViewportCurrentPosition(0, 1440);
    }
  }

  /** Обновляет вид в соответствии с текущими размерами холста. */
  public resize(): void {
    if (!this.canvas) return;

    this.canvas.width = this.canvas.clientWidth * ProfileDrawer.ratio;
    this.canvas.height = this.canvas.clientHeight * ProfileDrawer.ratio;

    const width = this.canvas.width - this.xViewportOffset;
    const height = this.canvas.height - this.yViewportOffset;

    this.drawer.viewport.width = width;
    this.drawer.viewport.height = height;

    this.drawer.viewport.realWidth = Math.ceil(width / ProfileDrawer.HORIZONTAL_SCALE);
    this.drawer.viewport.realHeight = Math.ceil(height / ProfileDrawer.VERTICAL_SCALE);

    this.drawer.viewport.startX = this.xViewportOffset;
    this.drawer.viewport.startY = this.yViewportOffset;
  }

  /** Обновляет данные профиля. */
  public setData(cache: ProfileDataCache): void {
    if (!cache) return;

    this.plastsLinesDataMap = cache.plastsData;
    this.render();
  }

  private validateViewportMoveX (delta: number): number {
    const viewport = this.drawer.viewport;

    let newX = viewport.currentX + delta;
    let newMaxX = viewport.currentMaxX + delta;

    if (newMaxX > viewport.maxX) {
      newX = viewport.maxX - viewport.realWidth;
    } else if (newX < viewport.minX) {
      newX = viewport.minX;
    }

    return newX;
  }

  private validateViewportMoveY (delta: number): number {
    const viewport = this.drawer.viewport;

    let newY = viewport.currentY + delta;
    let newMaxY = viewport.currentMaxY + delta;

    if (newMaxY > viewport.maxY) {
      newY = viewport.maxY - viewport.realHeight;
    } else if (newY < viewport.minY) {
      newY = viewport.minY;
    }

    return newY;
  }

  /** Обрабатывает событие прокрутки колеса мыши. */
  public handleMouseWheel(point: Point, direction: 1 | -1, shiftKey: boolean): void {

    if (shiftKey) {
      const stepX = 20;
      const coef = ProfileDrawer.HORIZONTAL_SCALE * window.devicePixelRatio;
      const delta = direction * stepX / coef;
      let newX = this.validateViewportMoveX(delta);
      this.drawer.setViewportCurrentPosition(newX, null);

      this.render();
    } else {
      const stepY = 20;
      const coef = ProfileDrawer.VERTICAL_SCALE * window.devicePixelRatio;
      const delta = direction * stepY / coef;

      let newY = this.validateViewportMoveY(delta);

      this.drawer.setViewportCurrentPosition(null, newY);
      this.render();
    }
  }

  /** Обрабатывает событие движения мыши. */
  public handleMouseMove(point: Point, bx: number, by: number): void {
    const deltaX = -bx / (ProfileDrawer.HORIZONTAL_SCALE * window.devicePixelRatio);
    const deltaY = -by / (ProfileDrawer.VERTICAL_SCALE * window.devicePixelRatio);
    let newX = this.validateViewportMoveX(deltaX);
    let newY = this.validateViewportMoveY(deltaY);

    this.drawer.setViewportCurrentPosition(newX, newY);
    this.render();
  }

  /** Полный рендер всей сцены профиля. */
  public render(): void {
    if (!this.canvas) return;
    this.drawer.clear();
    this.drawer.render(this.plastsLinesDataMap);
  }
}
