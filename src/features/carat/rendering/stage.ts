import { CaratTrack } from './track';
import { CaratDrawer } from './drawer';
import { calculateTrackWidth } from '../lib/initialization';
import { moveSmoothly, isRectInnerPoint } from '../lib/utils';
import { defaultSettings } from '../lib/constants';


/** Сцена диаграммы. */
export class CaratStage implements ICaratStage {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;

  /** Список треков. */
  private readonly trackList: CaratTrack[];
  private zones: CaratZone[];

  public readonly useStaticScale: boolean;
  public readonly strataChannelName: ChannelName;

  constructor(init: CaratFormSettings, zones: CaratZone[], drawer: CaratDrawer) {
    this.drawer = drawer;
    this.zones = zones;
    const trackWidth = calculateTrackWidth(init.columns);
    const trackMargin = drawer.trackBodySettings.margin;
    const rect: BoundingRect = {top: trackMargin, left: trackMargin, width: trackWidth, height: 0};
    const scale = CaratDrawer.pixelPerMeter / (init.settings.scale ?? defaultSettings.scale);
    this.trackList = [new CaratTrack(rect, init.columns, scale, drawer)];
    this.trackList[0].setZones(zones);
  }

  public getCaratSettings(): CaratSettings {
    const scale = this.trackList[0].viewport.scale;
    return {
      scale: CaratDrawer.pixelPerMeter / scale, useStaticScale: this.useStaticScale,
      strataChannelName: this.strataChannelName, zones: this.zones,
    };
  }

  public getActiveTrack(): CaratTrack {
    return this.trackList[0];
  }

  public getZones(): CaratZone[] {
    return this.zones;
  }

  public setZones(zones: CaratZone[]) {
    this.zones = zones;
    for (const track of this.trackList) track.setZones(zones);
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.drawer.setContext(canvas.getContext('2d'));
    this.resize();
  }

  public setWell(well: string) {
    this.trackList[0].setWell(well ?? '');
  }

  public setChannelData(channelData: ChannelDict) {
    this.trackList[0].setChannelData(channelData);
  }

  public async setCurveData(channelData: ChannelDict) {
    await this.trackList[0].setCurveData(channelData);
  }

  public setLookupData(lookupData: ChannelDict) {
    this.trackList[0].setLookupData(lookupData);
  }

  public setScale(scale: number) {
    for (const track of this.trackList) track.setScale(scale);
  }

  public handleMouseDown(x: number, y: number): boolean {
    const track = this.trackList.find((t) => isRectInnerPoint(x, y, t.rect));
    if (track) track.handleMouseDown(x - track.rect.left, y - track.rect.top);
    return track !== undefined;
  }

  public handleMouseWheel(x: number, y: number, by: number) {
    const track = this.trackList.find((t) => isRectInnerPoint(x, y, t.rect));
    if (track) moveSmoothly(track.viewport, this, by);
  }

  public handleMouseMove(by: number) {
    const viewport = this.trackList[0].viewport;
    let newY = viewport.y - by / (viewport.scale * window.devicePixelRatio);

    if (newY > viewport.max) newY = viewport.max;
    else if (newY < viewport.min) newY = viewport.min;

    if (viewport.y !== newY) { viewport.y = newY; this.render(); }
  }

  public resize() {
    const width = this.canvas.clientWidth * CaratDrawer.ratio;
    const height = this.canvas.clientHeight * CaratDrawer.ratio;

    if (this.canvas.width !== width) {
      this.canvas.width = width;
    }
    if (this.canvas.height !== height) {
      this.canvas.height = height;
      const trackHeight = this.canvas.clientHeight - 2 * this.drawer.trackBodySettings.margin;
      for (const track of this.trackList) track.setHeight(trackHeight)
    }
  }

  public render() {
    this.drawer.clear();
    for (const track of this.trackList) track.render();
  }
}
