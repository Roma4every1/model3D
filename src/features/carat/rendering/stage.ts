import type {
  CaratFormSettings, CaratGlobalSettings, CaratColumnInit,
  CaratColumnXAxis, CaratColumnYAxis,
} from '../lib/dto.types';

import type { CaratIntervalModel } from '../lib/types';
import { CaratTrack } from './track';
import { CaratDrawer } from './drawer';
import { CaratDrawerConfig } from './drawer-settings';
import { CaratCorrelations } from './correlations';

import { EventBus, compareArrays, isRectInnerPoint } from 'shared/lib';
import { validateCaratScale } from '../lib/utils';
import { moveSmoothly } from '../lib/smooth-scroll';
import { defaultSettings } from '../lib/constants';
import { CaratImageRengering } from './image-rendering';


/** Типы аргументов для событий сцены каротажной диаграммы. */
export interface CaratEventMap {
  /** Событие изменения трека. */
  'track': number;
  /** Событие изменения группы. */
  'group': number;
  /** Событие изменения масштаба. */
  'scale': number;
}

/** Типы событий сцены каротажной диаграммы.
 * + `track` — изменение активного трека
 * + `group` — изменение активной группы
 * + `curve` — изменения активной кривой
 */
export type CaratEventKind = keyof CaratEventMap;


/** Сцена диаграммы. */
export class CaratStage {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Шина событий для сцены. */
  private readonly eventBus: EventBus<CaratEventKind, CaratEventMap>;
  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;

  /** Модель корреляций. */
  public readonly correlations: CaratCorrelations;
  /** Модель разбиения кривых по зонам. */
  private zones: CaratZone[];

  /** Список ID скважин треков. */
  public wellIDs: WellID[];
  /** Список треков. */
  public trackList: CaratTrack[];
  /** Индекс активного трека. */
  private activeIndex: number;

  private readonly strataChannelName: ChannelName;
  public actualLookup: boolean;
  /** Расстояния между треками */
  public distance: number[];

  constructor(settings: CaratGlobalSettings, columns: CaratColumnInit[], drawerConfig: CaratDrawerConfig) {
    this.drawer = new CaratDrawer(drawerConfig);
    this.eventBus = new EventBus();

    this.wellIDs = [];
    this.zones = settings.zones;
    this.strataChannelName = settings.strataChannelName;
    this.actualLookup = false;
    this.distance = [];

    const correlationsInit = columns.find(c => c.settings.type === 'external');
    this.correlations = new CaratCorrelations(correlationsInit, this.drawer);

    let trackWidth = 0;
    for (const column of columns) {
      const { type, width } = column.settings;
      if (type === 'normal') trackWidth += width;
    }

    const padding = this.drawer.trackBodySettings.padding;
    const rect: Rectangle = {top: padding, left: padding, width: trackWidth, height: 0};
    const scale = CaratDrawer.pixelPerMeter / (settings.scale ?? defaultSettings.scale);

    const track = new CaratTrack(rect, columns, scale, this.drawer);
    this.trackList = [track];
    this.activeIndex = 0;

    if (this.zones.length) {
      track.getGroups().forEach(g => g.setZones(this.zones));
    }
  }

  public subscribe<T extends CaratEventKind>(e: T, cb: EventCallback<CaratEventMap[T]>): void {
    this.eventBus.subscribe(e, cb);
  }
  public unsubscribe<T extends CaratEventKind>(e: T, cb: EventCallback<CaratEventMap[T]>): void {
    this.eventBus.unsubscribe(e, cb);
  }

  /* --- Getters --- */

  /** Трек по индексу. */
  public getTrack(idx: number): CaratTrack {
    return this.trackList[idx];
  }

  /** Текущий активный трек. */
  public getActiveTrack(): CaratTrack {
    return this.trackList[this.activeIndex];
  }

  /** Индекс активного трека. */
  public getActiveIndex(): number {
    return this.activeIndex;
  }

  /** Правила распределения кривых по зонам. */
  public getZones(): CaratZone[] {
    return this.zones;
  }

  /** Исходные настройки. */
  public getInitSettings(): Omit<CaratFormSettings, 'id'> {
    const track = this.getActiveTrack();
    const columns = track.getGroups().map(g => g.getInit());
    columns.push(track.getBackgroundGroup().getInit());
    columns.push(this.correlations.getInit());

    const settings: CaratGlobalSettings = {
      scale: Math.round(CaratDrawer.pixelPerMeter / track.viewport.scale),
      strataChannelName: this.strataChannelName, zones: this.zones,
    };
    return {settings, columns};
  }

  /* --- Setters --- */

  /** Обновляет ссылку на холст. */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    if (canvas) {
      this.drawer.setContext(canvas.getContext('2d'));
      this.resize();
    }
  }

  /** Устанавливает режим показа треков по указанным скважинам. */
  public setTrackList(arg: WellModel | TraceNode[]): void {
    let newWellIDs: WellID[];
    let wellNames: string[];

    if (Array.isArray(arg)) {
      newWellIDs = arg.map(node => node.id);
      wellNames = arg.map(well => well.name ?? well.id?.toString() ?? '');
    } else {
      newWellIDs = [arg.id];
      wellNames = [arg.name ?? arg.id?.toString() ?? ''];
    }
    if (compareArrays(this.wellIDs, newWellIDs)) return;
    this.wellIDs = newWellIDs;

    const correlationWidth = this.correlations.getWidth();
    if (Array.isArray(arg)) this.correlations.setPoints(arg);

    const activeTrack = this.getActiveTrack();
    const rect = activeTrack.rect;
    this.trackList = [];

    for (const wellName of wellNames) {
      const track = activeTrack.cloneFor({...rect}, wellName.trim());
      this.trackList.push(track);
      rect.left += rect.width + correlationWidth;
    }
    this.activeIndex = 0;
    this.trackList[0].active = true;
    this.eventBus.publish('track', 0);
  }

  /** Обновляет активный трек по индексу. */
  public setActiveTrack(idx: number): void {
    if (this.wellIDs.length > 1) {
      this.trackList[this.activeIndex].active = false;
      this.trackList[idx].active = true;
    }
    this.activeIndex = idx;
    this.eventBus.publish('track', idx);
  }

  /** Обновляет данные диаграммы. */
  public setData(data: ChannelRecordDict[], cache: CurveDataCache): void {
    let yMin = Infinity;
    let yMax = -Infinity;

    this.trackList.forEach((track, i) => {
      track.setData(data[i], cache);
      const { min, max } = track.viewport;
      if (min < yMin) yMin = min;
      if (max > yMax) yMax = max;
    });
    this.trackList.forEach((track) => {
      const viewport = track.viewport;
      viewport.min = yMin;
      viewport.max = yMax;
      if (viewport.y === Infinity) viewport.y = yMin;
    });

    this.correlations.setData(this.trackList);
    this.updateTrackRects();
    this.resize();

    const track = this.trackList[this.activeIndex];
    if (track.constructionMode) {
      const dataHeight /* px */ = track.getBackgroundGroup().getDataRect().height - 10;
      const constructionHeight /* m */ = track.transformer.constructionHeight;
      const scale = (constructionHeight / dataHeight) * window.devicePixelRatio;
      track.setScale(1 / scale);
      this.eventBus.publish('scale', Math.round(CaratDrawer.pixelPerMeter * scale));
    }
  }

  /** Обновляет данные справочников. */
  public setLookupData(lookupData: ChannelRecordDict): void {
    for (const track of this.trackList) track.setLookupData(lookupData);
    this.actualLookup = true;
  }

  /** Обновляет правила разбиения кривых по зонам. */
  public setZones(zones: CaratZone[]): void {
    for (const track of this.trackList) {
      track.getGroups().forEach(g => g.setZones(zones));
      track.updateGroupRects();
    }
    this.updateTrackRects();
    this.resize();
    this.zones = zones;
  }

  /* --- App Logic Actions --- */

  /** Выравнивает вьюпорт треков по абсолютой отметке указанного пласта. */
  public alignByStratum(id: StratumID): void {
    let extremum = -Infinity;
    for (const track of this.trackList) {
      if (!track.inclinometry) continue;
      const strata: CaratIntervalModel[] = track.getBackgroundGroup().getStrata(id);
      if (strata.length === 0) continue;

      const depth = Math.round(Math.min(...strata.map(s => s.top)));
      const absMark = track.inclinometry.getAbsMark(depth);
      if (absMark > extremum) extremum = absMark;
    }

    if (extremum === -Infinity) return;
    for (const track of this.trackList) {
      track.viewport.y = track.inclinometry?.getDepth(extremum) ?? -extremum;
    }
  }

  /** Выравнивает вьюпорт по глубинам указанного пласта в треках. */
  public gotoStratum(id: StratumID, toTop: boolean): void {
    for (const track of this.trackList) {
      const strata: CaratIntervalModel[] = track.getBackgroundGroup().getStrata(id);
      if (strata.length === 0) continue;

      if (toTop) {
        track.viewport.y = Math.min(...strata.map(s => s.top));
      } else {
        const depth = Math.max(...strata.map(s => s.bottom));
        track.viewport.y = depth - track.viewport.height;
      }
    }
  }

  public setScale(value: number): void {
    const scale = CaratDrawer.pixelPerMeter / value;
    for (const track of this.trackList) track.setScale(scale);
    this.eventBus.publish('scale', value);
  }

  public setGroupWidth(idx: number, width: number): void {
    for (const track of this.trackList) track.setGroupWidth(idx, width);
    this.updateTrackRects();
    this.resize();
    this.eventBus.publish('group', idx);
  }

  public setGroupLabel(idx: number, label: string): void {
    for (const track of this.trackList) track.setGroupLabel(idx, label);
    this.updateTrackRects();
    this.eventBus.publish('group', idx);
  }

  public setGroupXAxis(idx: number, settings: CaratColumnXAxis): void {
    for (const track of this.trackList) track.setGroupXAxisSettings(idx, settings);
    this.eventBus.publish('group', idx);
  }

  public setGroupYAxis(idx: number, settings: CaratColumnYAxis): void {
    for (const track of this.trackList) track.setGroupYAxisSettings(idx, settings);
    this.eventBus.publish('group', idx);
  }

  public setGroupYStep(idx: number, step: number): void {
    for (const track of this.trackList) track.setGroupYAxisStep(idx, step);
    this.eventBus.publish('group', idx);
  }

  public setGroupVisibility(idx: number, visibility: boolean): void {
    for (const track of this.trackList) track.setGroupVisibility(idx, visibility);
    this.updateTrackRects();
    this.resize();
    this.eventBus.publish('group', idx);
  }

  public setGroupColumnVisibility(groupIdx: number, columnIdx: number, visibility: boolean): void {
    for (const track of this.trackList) {
      track.setGroupColumnVisibility(groupIdx, columnIdx, visibility);
    }
    this.eventBus.publish('group', groupIdx);
  }

  public moveGroup(idx: number, position: number): void {
    for (const track of this.trackList) track.moveGroup(idx, position);
    this.eventBus.publish('group', idx);
  }

  /* --- Event Handlers --- */

  /** Обрабатывает событие нажатия клавиши. */
  public handleKeyDown(key: string): boolean {
    if (key.startsWith('Arrow')) {
      let direction: 1 | -1;
      if (key.endsWith('Up')) {
        direction = -1;
      } else if (key.endsWith('Down')) {
        direction = 1;
      }
      if (direction) {
        moveSmoothly(this, -1, direction)
      }
    }
    return false;
  }

  /** Обрабатывает событие нажатия ПКМ. */
  public handleMouseDown(point: Point): void {
    const index = this.trackList.findIndex(t => isRectInnerPoint(point, t.rect));
    if (index === -1) return;
    this.setActiveTrack(index);

    const track = this.trackList[index];
    track.handleMouseDown(point);
    this.eventBus.publish('group', track.getActiveIndex());
    this.render();
  }

  /** Обрабатывает событие прокрутки колеса мыши. */
  public handleMouseWheel(point: Point, direction: 1 | -1, ctrlKey: boolean): void {
    if (ctrlKey) {
      const track = this.trackList[this.activeIndex];
      const scale = CaratDrawer.pixelPerMeter / track.viewport.scale;

      const step = track.constructionMode ? 50 : 10;
      let newScale = validateCaratScale(scale + step * direction, !track.constructionMode);
      if (scale === 1 && newScale === step + 1) newScale = step;
      if (newScale === scale) return;

      this.setScale(newScale);
      this.render();
    } else {
      const index = this.trackList.findIndex(t => isRectInnerPoint(point, t.rect));
      moveSmoothly(this, index, direction);
    }
  }

  /** Обрабатывает событие движения мыши. */
  public handleMouseMove(point: Point, by: number): void {
    const move = (idx: number) => {
      const viewport = this.trackList[idx].viewport;
      let newY = viewport.y - by / (viewport.scale * window.devicePixelRatio);

      if (newY + viewport.height > viewport.max) {
        newY = viewport.max - viewport.height;
      } else if (newY < viewport.min) {
        newY = viewport.min;
      }
      if (viewport.y !== newY) {
        viewport.y = newY;
        this.lazyRender(idx);
      }
    };

    const index = this.trackList.findIndex(t => isRectInnerPoint(point, t.rect));
    if (index === -1) {
      for (let i = 0; i < this.trackList.length; i++) move(i);
    } else {
      move(index);
    }
  }

  /* --- Technical Methods --- */

  /** Обновляет горизонтальное положение треков и корреляций. */
  public updateTrackRects(): void {
    let left = this.drawer.trackBodySettings.padding;
    let maxHeaderHeight = 0;
    const correlationWidth = this.correlations.getWidth();

    for (const track of this.trackList) {
      track.rect.left = left;
      left += track.rect.width + correlationWidth;

      const heights = track.getGroups().map(g => g.header.getContentHeight());
      const trackHeaderHeight = Math.max(...heights);
      if (maxHeaderHeight < trackHeaderHeight) maxHeaderHeight = trackHeaderHeight;
    }
    this.trackList.forEach(t => t.setHeaderHeight(maxHeaderHeight));
    this.correlations.updateRects(this.trackList);
  }

  /** Обновляет вид в соответствии с текущими размерами холста. */
  public resize(): void {
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

    const dataRect = track.getBackgroundGroup().getDataRect();
    const oldRectHeight = dataRect.height;

    const trackHeight = resultHeight - 2 * padding;
    for (const track of this.trackList) track.setHeight(trackHeight);
    this.correlations.updateRects(this.trackList);

    if (track.constructionMode && dataRect.height !== oldRectHeight) {
      const newScale = track.viewport.scale * (dataRect.height / oldRectHeight);
      track.setScale(newScale);
      this.eventBus.publish('scale', Math.round(CaratDrawer.pixelPerMeter / newScale));
    }
  }

  /* --- Rendering --- */

  /** Рендер картинки с заданными характеристиками. */
  public renderImage(options: CaratExportOptions): HTMLCanvasElement {
    const renderer = new CaratImageRengering(this, this.drawer);
    const canvas = renderer.caratImage(options);
    CaratDrawer.ratio = 2;
    this.drawer.setContext(this.canvas.getContext('2d'));
    return canvas;
  }

  /** Полный рендер всей диаграммы. */
  public render(): void {
    if (!this.canvas) return;
    this.drawer.clear();
    this.correlations.render();
    for (const track of this.trackList) track.render();
  }

  /** Рендер активного трека и корреляций вокруг него. */
  public lazyRender(index: number): void {
    this.correlations.render(index);
    if (index > 0) this.correlations.render(index - 1);
    this.trackList[index].lazyRender();
  }
}
