import { CaratTrack } from './track';
import { CaratDrawer } from './drawer';
import { CaratDrawerConfig } from './drawer-settings';
import { CaratCurveModel } from '../lib/types';
import { isRectInnerPoint } from 'shared/lib';
import { moveSmoothly, calculateTrackWidth } from '../lib/utils';
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
  private readonly moveViewportStep: number;

  constructor(init: CaratFormSettings, drawerConfig: CaratDrawerConfig) {
    this.zones = init.settings.zones;
    this.drawer = new CaratDrawer(drawerConfig);
    this.useStaticScale = init.settings.useStaticScale;
    this.strataChannelName = init.settings.strataChannelName;

    const trackWidth = calculateTrackWidth(init.columns);
    const trackMargin = this.drawer.trackBodySettings.margin;
    const rect: Rectangle = {top: trackMargin, left: trackMargin, width: trackWidth, height: 0};
    const scale = CaratDrawer.pixelPerMeter / (init.settings.scale ?? defaultSettings.scale);
    const track = new CaratTrack(rect, init.columns, scale, this.drawer);
    this.trackList = [track];
    if (this.zones.length) track.setZones(this.zones);

    const groupWithYAxis = init.columns.find((group) => group.yAxis.show);
    this.moveViewportStep = groupWithYAxis?.yAxis.step ?? defaultSettings.yAxisStep;
  }

  public getCaratSettings(): CaratSettings {
    const scale = this.trackList[0].viewport.scale;
    return {
      scale: Math.round(CaratDrawer.pixelPerMeter / scale), useStaticScale: this.useStaticScale,
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
    this.resize();
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
    this.resize();
  }

  public async setCurveData(channelData: ChannelDict) {
    const activeCurve = await this.trackList[0].setCurveData(channelData);
    this.resize();
    return activeCurve;
  }

  public setLookupData(lookupData: ChannelDict) {
    this.trackList[0].setLookupData(lookupData);
  }

  public setScale(scale: number) {
    for (const track of this.trackList) track.setScale(scale);
  }

  public handleKeyDown(key: string): boolean {
    if (key.startsWith('Arrow')) {
      let direction;
      if (key.endsWith('Up')) {
        direction = -1;
      } else if (key.endsWith('Down')) {
        direction = 1;
      }
      if (direction) {
        const viewport = this.trackList[0].viewport;
        moveSmoothly(viewport, this, direction * this.moveViewportStep)
      }
    }
    return false;
  }

  public handleMouseDown(point: Point): CaratCurveModel | boolean {
    const track = this.trackList.find((t) => isRectInnerPoint(point, t.rect));
    if (!track) return false;
    const activeCurve = track.handleMouseDown(point);
    return activeCurve ?? true;
  }

  public handleMouseWheel(point: Point, direction: 1 | -1) {
    const track = this.trackList.find((t) => isRectInnerPoint(point, t.rect));
    if (track) moveSmoothly(track.viewport, this, direction * this.moveViewportStep);
  }

  public handleMouseMove(by: number) {
    const viewport = this.trackList[0].viewport;
    let newY = viewport.y - by / (viewport.scale * window.devicePixelRatio);

    if (newY > viewport.max) newY = viewport.max;
    else if (newY < viewport.min) newY = viewport.min;

    if (viewport.y !== newY) { viewport.y = newY; this.render(); }
  }

  public resize() {
    const track = this.trackList[0];
    const trackMargin = this.drawer.trackBodySettings.margin;
    const trackHeaderHeight = this.drawer.trackHeaderSettings.height;

    const neededWidth = track.rect.width + 2 * trackMargin;
    const neededHeight = track.rect.top + trackHeaderHeight + track.maxGroupHeaderHeight + 20;
    const resultHeight = Math.max(this.canvas.clientHeight, neededHeight);

    this.canvas.width = neededWidth * CaratDrawer.ratio;
    this.canvas.height = resultHeight * CaratDrawer.ratio;
    this.canvas.style.width = neededWidth + 'px';
    this.canvas.style.minHeight = neededHeight + 'px';

    const trackHeight = resultHeight - 2 * trackMargin;
    for (const track of this.trackList) track.setHeight(trackHeight);
  }

  public render() {
    this.drawer.clear();
    for (const track of this.trackList) track.render();
  }
}
