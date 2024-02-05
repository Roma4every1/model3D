import {ProfileDrawer} from "./drawer.ts";


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
  /** Слушатели событий сцены. */
  public readonly listeners: CaratStageListeners;
  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;

  private plastsLinesDataMap: ProfilePlastMap;
  private inclData: ProfileInclDataMap
  private xDelta: number;
  private yDelta: number;

  /** Отступ по горизонтали для основой области профиля. */
  private xViewportOffset: number;
  /** Отступ по вертикали для основой области профиля. */
  private yViewportOffset: number;

  constructor(drawerConfig: ProfileDrawerConfig) {
    this.xDelta = 0;
    this.yDelta = 0;
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
    }
  }

  /** Обновляет вид в соответствии с текущими размерами холста. */
  public resize(): void {
    if (!this.canvas) return;

    // const resultWidth = (this.xDelta + 1000) * ProfileDrawer.HORIZONTAL_SCALE / ProfileDrawer.ratio;
    // const resultHeight = this.yDelta * ProfileDrawer.VERTICAL_SCALE / ProfileDrawer.ratio;
    //
    // const neededWidth = resultWidth +
    //   (ProfileDrawer.PLAST_AXIS_WIDTH + ProfileDrawer.Y_AXIS_WIDTH) / 2;
    //
    // const neededHeight = resultHeight +
    //   (ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT + ProfileDrawer.X_AXIS_HEIGHT) / 2;


    this.canvas.width = this.canvas.clientWidth * ProfileDrawer.ratio;
    this.canvas.height = this.canvas.clientHeight * ProfileDrawer.ratio;

    this.drawer.viewport.width = this.canvas.width - this.xViewportOffset;
    this.drawer.viewport.height = this.canvas.width - this.yViewportOffset;

    this.drawer.viewport.startX = this.xViewportOffset;
    this.drawer.viewport.startY = this.yViewportOffset;
  }

  /** Обновляет данные профиля. */
  public setData(cache: ProfileDataCache): void {
    if (!cache) return;

    // this.xDelta = cache.xAxisSettings.xDelta;
    // this.yDelta = cache.yAxisSettings.yDelta;
    this.plastsLinesDataMap = cache.plastsData;
    // this.inclData = cache.inclinometryData;
    //
    // this.drawer.setXAxisSettings(cache.xAxisSettings);
    // this.drawer.setYAxisSettings(cache.yAxisSettings);

    this.resize();
  }

  /** Обрабатывает событие прокрутки колеса мыши. */
  public handleMouseWheel(point: Point, direction: 1 | -1, shiftKey: boolean): void {
    const viewport = this.drawer.viewport;

    if (shiftKey) {
      const stepX = 20;
      const newX = viewport.currentX + direction * stepX / (ProfileDrawer.HORIZONTAL_SCALE * window.devicePixelRatio);
      if (!(viewport.currentX === newX)) {
        this.drawer.setViewportCurrentPosition(newX, viewport.currentY);
        this.render();
      }
    } else {
      const stepY = 20;
      const newY = viewport.currentY + direction * stepY / (ProfileDrawer.VERTICAL_SCALE * window.devicePixelRatio);
      if (!(viewport.currentY === newY)) {
        this.drawer.setViewportCurrentPosition(viewport.currentX, newY);
        this.render();
      }
    }
  }

  /** Обрабатывает событие движения мыши. */
  public handleMouseMove(point: Point, bx: number, by: number): void {
    const viewport = this.drawer.viewport;
    let newX = viewport.currentX - bx / (ProfileDrawer.HORIZONTAL_SCALE * window.devicePixelRatio);
    let newY = viewport.currentY - by / (ProfileDrawer.VERTICAL_SCALE * window.devicePixelRatio);

    if (newY + viewport.height > viewport.maxY) {
      newY = viewport.maxY - viewport.height; // !!!
    } else if (newY < viewport.minY) {
      newY = viewport.minY;
    }

    if (newX + viewport.width > viewport.maxX) {
      newX = viewport.maxX - viewport.width; // !!!!
    } else if (newX < viewport.minX) {
      newX = viewport.minX;
    }

    if (!(viewport.currentX === newX && viewport.currentY === newY)) {
      this.drawer.setViewportCurrentPosition(newX, newY);
      this.render();
    }
  }

  /** Полный рендер всей сцены профиля. */
  public render(): void {
    if (!this.canvas) return;
    this.drawer.clear();
    this.drawer.render(this.plastsLinesDataMap, this.inclData);
  }
}
