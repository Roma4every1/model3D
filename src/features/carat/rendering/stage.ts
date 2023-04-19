import { CaratTrack } from './track';
import { CaratDrawer } from './drawer';
import { moveSmoothly, isRectInnerPoint } from '../lib/utils';


/** Сцена диаграммы. */
export class CaratStage implements ICaratStage {
  /** Количество пикселей в метре: `96px = 2.54cm`. */
  public static readonly pixelPerMeter = 100 * 96 / 2.54;
  /** Коэффициент уплотнения DPI для улучшения чёткости изображения. */
  public static readonly ratio = 2 * window.devicePixelRatio;

  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;
  /** Ширина области отрисовки. */
  private width: number;
  /** Высота области отрисовки. */
  private height: number;

  /** Зоны распределения каротажных кривых. */
  private readonly zones: CaratZone[];
  /** Список треков. */
  private readonly trackList: CaratTrack[];

  constructor(init: CaratFormSettings, drawer: CaratDrawer) {
    this.drawer = drawer;
    this.zones = init.settings.zones;

    const scale = CaratStage.pixelPerMeter / (init.settings.scale ?? 400);
    this.trackList = [new CaratTrack(init.columns, {y: 0, scale}, drawer)];
  }

  public getActiveTrack(): CaratTrack {
    return this.trackList[0];
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.drawer.setContext(canvas.getContext('2d'));
  }

  public setWell(well: string) {
    const activeTrack = this.trackList[0];
    if (activeTrack) activeTrack.setWell(well);
  }

  public setChannelData(channelData: ChannelDict) {
    // let initY = Infinity;
    // for (const channelName in data) {
    //   const dataModel = data[channelName];
    //   const datum = channelData[channelName].data;
    //
    //   if (!datum?.columns) continue;
    //   if (!dataModel.applied) applyIndexesToModel(dataModel, datum.columns);
    //
    //   const intervals = getCaratIntervals(datum.rows, dataModel.info);
    //   initY = Math.min(initY, ...intervals.map(i => i.top));
    //   dataModel.data = intervals;
    // }
    // viewport.y = initY === Infinity ? 0 : initY;
  }

  public setScale(scale: number) {
    for (const track of this.trackList) track.setViewportScale(scale);
  }

  public handleMouseDown(x: number, y: number) {
    x *= CaratStage.ratio; y *= CaratStage.ratio;
    const track = this.trackList.find(t => isRectInnerPoint(x, y, t.getRect()));
    if (track) track.handleMouseDown(x, y);
  }

  public handleMouseWheel(by: number) {
    const activeTrack = this.trackList[0];
    if (activeTrack) moveSmoothly(activeTrack.getViewport(), this, by);
  }

  public handleMouseMove(by: number) {
    const activeTrack = this.trackList[0];
    if (!activeTrack) return;
    const viewport = activeTrack.getViewport();
    viewport.y -= by / viewport.scale;
    activeTrack.render();
  }

  public resize() {
    const width = this.canvas.clientWidth * CaratStage.ratio * window.devicePixelRatio;
    const height = this.canvas.clientHeight * CaratStage.ratio * window.devicePixelRatio;

    if (this.canvas.width !== width) {
      this.canvas.width = width;
      this.width = width;
    }
    if (this.canvas.height !== height) {
      this.canvas.height = height;
      this.height = height;
    }
    this.render();
  }

  public render() {
    for (const track of this.trackList) track.render();
  }
}
