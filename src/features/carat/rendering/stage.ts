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
  private trackList: CaratTrack[];
  /** Список ID скважин треков. */
  public wellIDs: WellID[];

  /** Модель разбиения кривых по зонам. */
  private zones: CaratZone[];
  private readonly useStaticScale: boolean;
  private readonly strataChannelName: ChannelName;
  /** Настройки корреляций. */
  public readonly correlationInit: CaratColumnInit;

  constructor(init: CaratFormSettings, drawerConfig: CaratDrawerConfig) {
    this.wellIDs = [];
    this.zones = init.settings.zones;
    this.drawer = new CaratDrawer(drawerConfig);
    this.useStaticScale = init.settings.useStaticScale;
    this.strataChannelName = init.settings.strataChannelName;
    this.correlationInit = init.columns.find(c => c.settings.type === 'external');

    const trackWidth = calculateTrackWidth(init.columns);
    const trackMargin = this.drawer.trackBodySettings.margin;
    const rect: Rectangle = {top: trackMargin, left: trackMargin, width: trackWidth, height: 0};
    const scale = CaratDrawer.pixelPerMeter / (init.settings.scale ?? defaultSettings.scale);
    const track = new CaratTrack(rect, init.columns, scale, this.drawer);
    this.trackList = [track];
    if (this.zones.length) track.setZones(this.zones);
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
    this.setTrackLefts();
    this.resize();
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    if (canvas) {
      this.drawer.setContext(canvas.getContext('2d'));
      this.resize();
    }
  }

  /** Установить режим показа треков по указанным скважинам. */
  public setTrackList(wells: WellModel[]): void {
    this.wellIDs = wells.map(well => well.id);
    const wellNames = wells.map(well => well.name ?? well.id?.toString() ?? '');

    const activeTrack = this.getActiveTrack();
    const rect = activeTrack.rect;
    this.trackList = [];

    for (const wellName of wellNames) {
      const track = activeTrack.cloneFor({...rect}, wellName);
      this.trackList.push(track);
      rect.left += rect.width + 50;
    }
  }

  public setData(data: ChannelRecordDict[], cache: CurveDataCache) {
    for (let i = 0; i < data.length; i++) {
      this.trackList[i].setData(data[i], cache);
      this.setTrackLefts();
      this.resize();
    }
  }

  public setLookupData(lookupData: ChannelRecordDict) {
    for (const track of this.trackList) track.setLookupData(lookupData);
  }

  public setScale(scale: number) {
    for (const track of this.trackList) track.setScale(scale);
  }

  public handleKeyDown(key: string): boolean {
    if (key.startsWith('Arrow')) {
      let direction: 1 | -1;
      if (key.endsWith('Up')) {
        direction = -1;
      } else if (key.endsWith('Down')) {
        direction = 1;
      }
      if (direction) {
        moveSmoothly(this.getActiveTrack(), direction)
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
    if (track) moveSmoothly(track, direction);
  }

  public handleMouseMove(by: number) {
    const track = this.getActiveTrack();
    const viewport = track.viewport;
    let newY = viewport.y - by / (viewport.scale * window.devicePixelRatio);

    if (newY > viewport.max) newY = viewport.max;
    else if (newY < viewport.min) newY = viewport.min;

    if (viewport.y !== newY) { viewport.y = newY; track.lazyRender(); }
  }

  /** Обновляет горизонтальное положение треков. */
  private setTrackLefts() {
    let left = this.trackList[0].rect.left;
    for (const track of this.trackList) {
      track.rect.left = left;
      left += track.rect.width + 50;
    }
  }

  public resize() {
    if (!this.canvas) return;
    const track = this.trackList[0];
    const trackMargin = this.drawer.trackBodySettings.margin;
    const trackHeaderHeight = this.drawer.trackHeaderSettings.height;

    let neededWidth = (this.trackList.length - 1) * 50;
    for (const track of this.trackList) {
      neededWidth += track.rect.width + 2 * trackMargin;
    }
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
    if (!this.canvas) return;
    this.drawer.clear();
    for (const track of this.trackList) track.render();
  }
}
