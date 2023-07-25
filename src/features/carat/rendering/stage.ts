import { CaratTrack } from './track';
import { CaratDrawer } from './drawer';
import { CaratCorrelations } from './correlations';
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

  /** Модель корреляций. */
  public readonly correlations: CaratCorrelations;
  /** Список треков. */
  public trackList: CaratTrack[];
  /** Список ID скважин треков. */
  public wellIDs: WellID[];

  /** Модель разбиения кривых по зонам. */
  private zones: CaratZone[];
  private readonly useStaticScale: boolean;
  private readonly strataChannelName: ChannelName;

  constructor(init: CaratFormSettings, drawerConfig: CaratDrawerConfig) {
    this.wellIDs = [];
    this.zones = init.settings.zones;
    this.drawer = new CaratDrawer(drawerConfig);
    this.useStaticScale = init.settings.useStaticScale;
    this.strataChannelName = init.settings.strataChannelName;

    const correlationsInit = init.columns.find(c => c.settings.type === 'external');
    this.correlations = new CaratCorrelations(correlationsInit, this.drawer);

    const trackWidth = calculateTrackWidth(init.columns);
    const padding = this.drawer.trackBodySettings.padding;
    const rect: Rectangle = {top: padding, left: padding, width: trackWidth, height: 0};
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

    const correlationWidth = this.correlations.getWidth();
    const activeTrack = this.getActiveTrack();
    const rect = activeTrack.rect;
    this.trackList = [];

    for (const wellName of wellNames) {
      const track = activeTrack.cloneFor({...rect}, wellName);
      this.trackList.push(track);
      rect.left += rect.width + correlationWidth;
    }
  }

  public setData(data: ChannelRecordDict[], cache: CurveDataCache) {
    for (let i = 0; i < data.length; i++) {
      this.trackList[i].setData(data[i], cache);
    }
    this.setTrackLefts();
    this.resize();
    this.correlations.setData(this.trackList);
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
        moveSmoothly(this, 0, direction)
      }
    }
    return false;
  }

  public handleMouseDown(point: Point): CaratCurveModel | boolean {
    const track = this.trackList.find(t => isRectInnerPoint(point, t.rect));
    if (!track) return false;
    const activeCurve = track.handleMouseDown(point);
    return activeCurve ?? true;
  }

  public handleMouseWheel(point: Point, direction: 1 | -1) {
    const index = this.trackList.findIndex(t => isRectInnerPoint(point, t.rect));
    moveSmoothly(this, index, direction);
  }

  public handleMouseMove(point: Point, by: number) {
    const index = this.trackList.findIndex(t => isRectInnerPoint(point, t.rect));
    if (index === -1) return;

    const viewport = this.trackList[index].viewport;
    let newY = viewport.y - by / (viewport.scale * window.devicePixelRatio);

    if (newY > viewport.max) newY = viewport.max;
    else if (newY < viewport.min) newY = viewport.min;

    if (viewport.y !== newY) { viewport.y = newY; this.lazyRender(index); }
  }

  /** Обновляет горизонтальное положение треков. */
  private setTrackLefts() {
    let left = this.trackList[0].rect.left;
    const correlationWidth = this.correlations.getWidth();

    for (const track of this.trackList) {
      track.rect.left = left;
      left += track.rect.width + correlationWidth;
    }
  }

  public resize() {
    if (!this.canvas) return;
    const track = this.trackList[0];
    const padding = this.drawer.trackBodySettings.padding;
    const trackHeaderHeight = this.drawer.trackHeaderSettings.height;

    const correlationWidth = this.correlations.getWidth();
    let neededWidth = (this.trackList.length - 1) * correlationWidth + 2 * padding;
    for (const track of this.trackList) neededWidth += track.rect.width;

    const neededHeight = track.rect.top + trackHeaderHeight + track.maxGroupHeaderHeight + 20;
    const resultHeight = Math.max(this.canvas.clientHeight, neededHeight);

    this.canvas.width = neededWidth * CaratDrawer.ratio;
    this.canvas.height = resultHeight * CaratDrawer.ratio;
    this.canvas.style.width = neededWidth + 'px';
    this.canvas.style.minHeight = neededHeight + 'px';

    const trackHeight = resultHeight - 2 * padding;
    for (const track of this.trackList) track.setHeight(trackHeight);
  }

  /* --- Rendering --- */

  public render(): void {
    if (!this.canvas) return;
    this.drawer.clear();
    this.correlations.render();
    for (const track of this.trackList) track.render();
  }

  public lazyRender(index: number): void {
    this.correlations.render(index);
    if (index > 0) this.correlations.render(index - 1);
    this.trackList[index].lazyRender();
  }
}
