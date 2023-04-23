import { CaratTrack } from './track';
import { CaratDrawer } from './drawer';
import { calculateTrackWidth } from '../lib/initialization';
import { moveSmoothly, isRectInnerPoint } from '../lib/utils';


/** Сцена диаграммы. */
export class CaratStage implements ICaratStage {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;
  /** Ширина области отрисовки. */
  private width: number;
  /** Высота области отрисовки. */
  private height: number;

  /** Список треков. */
  private readonly trackList: CaratTrack[];

  public readonly useStaticScale: boolean;
  public readonly strataChannelName: ChannelName;

  constructor(init: CaratFormSettings, zones: CaratZone[], drawer: CaratDrawer) {
    this.drawer = drawer;
    const trackWidth = calculateTrackWidth(init.columns);
    const trackMargin = drawer.trackBodySettings.margin;

    const rect: BoundingRect = {
      top: trackMargin, left: trackMargin,
      bottom: 200 + trackMargin, right: trackWidth + trackMargin,
      width: trackWidth, height: 200,
    };

    const scale = CaratDrawer.pixelPerMeter / (init.settings.scale ?? 400);
    this.trackList = [new CaratTrack(rect, init.columns, {y: 2500, scale}, zones, drawer)];
  }

  public getCaratSettings(): CaratSettings {
    const scale = this.trackList[0].getViewport().scale;
    return {
      scale: CaratDrawer.pixelPerMeter / scale, useStaticScale: this.useStaticScale,
      strataChannelName: this.strataChannelName, zones: null,
    };
  }

  public getActiveTrack(): CaratTrack {
    return this.trackList[0];
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.drawer.setContext(canvas.getContext('2d'));
    this.resize();
  }

  public setWell(well: string) {
    const activeTrack = this.trackList[0];
    if (activeTrack) activeTrack.setWell(well ?? '');
  }

  public setChannelData(channelData: ChannelDict) {
    const activeTrack = this.trackList[0];
    if (activeTrack) activeTrack.setChannelData(channelData);
  }

  public setLookupData(lookupData: ChannelDict) {
    const activeTrack = this.trackList[0];
    if (activeTrack) activeTrack.setLookupData(lookupData);
  }

  public setScale(scale: number) {
    for (const track of this.trackList) track.setScale(scale);
  }

  public handleMouseDown(x: number, y: number): boolean {
    x *= CaratDrawer.ratio; y *= CaratDrawer.ratio;
    const track = this.trackList.find((t) => isRectInnerPoint(x, y, t.getRect()));
    if (track) track.handleMouseDown(x, y);
    return track !== undefined;
  }

  public handleMouseWheel(x: number, y: number, by: number) {
    x *= CaratDrawer.ratio; y *= CaratDrawer.ratio;
    const track = this.trackList.find((t) => isRectInnerPoint(x, y, t.getRect()));
    if (track) moveSmoothly(track.getViewport(), this, by);
  }

  public handleMouseMove(by: number) {
    const activeTrack = this.trackList[0];
    if (!activeTrack) return;
    const viewport = activeTrack.getViewport();
    viewport.y -= by / viewport.scale;
    this.render();
  }

  public resize() {
    const width = this.canvas.clientWidth * CaratDrawer.ratio;
    const height = this.canvas.clientHeight * CaratDrawer.ratio;

    if (this.canvas.width !== width) {
      this.canvas.width = width;
      this.width = width;
    }
    if (this.canvas.height !== height) {
      this.canvas.height = height;
      this.height = height;

      const trackHeight = height - 2 * this.drawer.trackBodySettings.margin;
      for (const track of this.trackList) { track.setHeight(trackHeight); track.render(); }
    }
  }

  public render() {
    for (const track of this.trackList) track.render();
  }
}
