import { CaratTrack } from './track';
import { CaratDrawer } from './drawer';
import { CaratCorrelations } from './correlations';
import { CaratDrawerConfig } from './drawer-settings';
import { CaratIntervalModel } from '../lib/types';
import { compareArrays, isRectInnerPoint } from 'shared/lib';
import { calculateTrackWidth, validateCaratScale } from '../lib/utils';
import { moveSmoothly } from '../lib/smooth-scroll';
import { defaultSettings } from '../lib/constants';


/** Сцена диаграммы. */
export class CaratStage implements ICaratStage {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Слушатели событий сцены. */
  public readonly listeners: CaratStageListeners;
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
    this.activeIndex = 0;

    if (this.zones.length) {
      track.getGroups().forEach(g => g.setZones(this.zones));
    }
    this.listeners = {
      scaleChange: () => {}, trackPanelChange: () => {},
      caratPanelChange: () => {}, curveWindowChange: () => {},
    };
  }

  /* --- Getters --- */

  /** Текущий активный трек. */
  public getActiveTrack(): CaratTrack {
    return this.trackList[this.activeIndex];
  }

  /** Правила распределения кривых по зонам. */
  public getZones(): CaratZone[] {
    return this.zones;
  }

  /** Исходные общие настройки диаграммы. */
  public getCaratSettings(): CaratSettings {
    const scale = this.trackList[0].viewport.scale;
    return {
      scale: Math.round(CaratDrawer.pixelPerMeter / scale), useStaticScale: this.useStaticScale,
      strataChannelName: this.strataChannelName, zones: this.zones,
    };
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
  public setTrackList(wells: WellModel[]): void {
    const newWellIDs = wells.map(well => well.id);
    if (compareArrays(this.wellIDs, newWellIDs)) return;
    this.wellIDs = newWellIDs;
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
    this.activeIndex = 0;
    this.trackList[0].active = true;
  }

  /** Обновляет активный трек по индексу. */
  public setActiveTrack(idx: number): void {
    if (this.wellIDs.length > 1) {
      this.trackList[this.activeIndex].active = false;
      this.trackList[idx].active = true;
    }
    this.activeIndex = idx;
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
    this.trackList.forEach((track, i) => {
      const { viewport, inclinometry } = track;
      viewport.min = yMin;
      viewport.max = yMax;
      if (viewport.y === Infinity) viewport.y = yMin;

      if (inclinometry) {
        inclinometry.setData(data[i]);
        inclinometry.updateMarks(viewport);
      }
    });

    this.correlations.setData(this.trackList);
    this.updateTrackRects();
    this.resize();
  }

  /** Обновляет данные справочников. */
  public setLookupData(lookupData: ChannelRecordDict): void {
    for (const track of this.trackList) track.setLookupData(lookupData);
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

  /** Обрабатывает действие редактирования сцены. */
  public edit(action: StageEditAction): void {
    switch (action.type) {
      case 'scale': { // изменение масштаба
        const scale = CaratDrawer.pixelPerMeter / action.payload;
        for (const track of this.trackList) track.setScale(scale);
        return this.listeners.scaleChange(action.payload);
      }
      case 'move': { // изменении порядка колонок
        const { idx, to } = action.payload;
        for (const track of this.trackList) track.moveGroup(idx, to);
        this.listeners.trackPanelChange();
        return;
      }
      case 'active-group': { // изменение номера активной группы
        const idx = action.payload;
        for (const track of this.trackList) track.setActiveGroup(idx);
        this.listeners.trackPanelChange();
        this.listeners.caratPanelChange();
        this.listeners.curveWindowChange();
        return;
      }
      case 'group-width': { // изменение ширины колонки
        const { idx, width } = action.payload;
        for (const track of this.trackList) track.setGroupWidth(idx, width);
        this.updateTrackRects();
        this.resize();
        return;
      }
      case 'group-label': { // изменение подписи колонки
        const { idx, label } = action.payload;
        for (const track of this.trackList) track.setGroupLabel(idx, label);
        this.updateTrackRects();
        this.listeners.trackPanelChange();
        return;
      }
      case 'group-x-axis': {
        const { idx, settings } = action.payload;
        for (const track of this.trackList) track.setGroupXAxisSettings(idx, settings);
        return;
      }
      case 'group-y-axis': { // настройки оси Y для группы
        const { idx, settings } = action.payload;
        for (const track of this.trackList) track.setGroupYAxisSettings(idx, settings);
        return;
      }
      case 'group-y-step': { // изменение шага по оси Y
        const { idx, step } = action.payload;
        for (const track of this.trackList) track.setGroupYAxisStep(idx, step);
        return;
      }
      default: { /* no other action types */ }
    }
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
    this.trackList[index].handleMouseDown(point);

    this.listeners.trackPanelChange();
    this.listeners.caratPanelChange();
    this.listeners.curveWindowChange();
    this.render();
  }

  /** Обрабатывает событие прокрутки колеса мыши. */
  public handleMouseWheel(point: Point, direction: 1 | -1, ctrlKey: boolean): void {
    if (ctrlKey) {
      const scale = CaratDrawer.pixelPerMeter / this.getActiveTrack().viewport.scale;
      let newScale = validateCaratScale(scale + 10 * direction);
      if (scale === 1 && newScale === 11) newScale = 10;
      if (newScale === scale) return;

      this.edit({type: 'scale', payload: newScale});
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

    const trackHeight = resultHeight - 2 * padding;
    for (const track of this.trackList) track.setHeight(trackHeight);
    this.correlations.updateRects(this.trackList);
  }

  /* --- Rendering --- */

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
