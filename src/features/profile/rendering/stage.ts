import {ProfileDrawer} from "./drawer.ts";


/** Сцена профиля. */
export class ProfileStage implements IProfileStage {
  /** Отрисовщик. */
  private readonly drawer: ProfileDrawer;
  /** Слушатели событий сцены. */
  public readonly listeners: CaratStageListeners;
  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;

  private plastsLinesData: ProfilePlastData[];
  private xDelta: number;
  private yDelta: number;

  constructor(drawerConfig: ProfileDrawerConfig) {
    this.xDelta = 0;
    this.yDelta = 0;
    this.plastsLinesData = [];
    this.drawer = new ProfileDrawer(drawerConfig);
  }

  /** Обновляет ссылку на холст. */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    if (canvas) {
      this.drawer.setContext(canvas.getContext('2d'));
      this.resize();
    }
  }

  /** Обновляет вид в соответствии с текущими размерами холста. */
  public resize(): void {
    console.log('resize');
    if (!this.canvas) return;

    const resultWidth = this.xDelta * ProfileDrawer.HORIZONTAL_SCALE / ProfileDrawer.ratio;
    const resultHeight = this.yDelta * ProfileDrawer.VERTICAL_SCALE / ProfileDrawer.ratio;

    const neededWidth = resultWidth +
      (ProfileDrawer.PLAST_AXIS_WIDTH + ProfileDrawer.Y_AXIS_WIDTH) / 2;

    const neededHeight = resultHeight +
      (ProfileDrawer.COLUMN_NAME_AXIS_HEIGHT + ProfileDrawer.X_AXIS_HEIGHT) / 2;

    this.canvas.width = neededWidth * ProfileDrawer.ratio;
    this.canvas.height = neededHeight * ProfileDrawer.ratio;
    this.canvas.style.width = neededWidth + 'px';
    this.canvas.style.minHeight = neededHeight + 'px';
  }

  /** Обновляет данные профиля. */
  public setData(cache: ProfileDataCache): void {
    this.xDelta = cache.xAxisSettings.xDelta;
    this.yDelta = cache.yAxisSettings.yDelta;
    this.plastsLinesData = cache.plastsLinesData;

    this.drawer.setXAxisSettings(cache.xAxisSettings);
    this.drawer.setYAxisSettings(cache.yAxisSettings);

    this.resize();
  }

  /** Полный рендер всей сцены профиля. */
  public render(): void {
    if (!this.canvas) return;
    this.drawer.clear();
    this.drawer.render(this.plastsLinesData);
  }
}
