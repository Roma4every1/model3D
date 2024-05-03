import type { CaratCurveModel } from '../lib/types';
import type { CaratColumnInit, CaratColumnXAxis, CaratColumnYAxis } from '../lib/dto.types';
import { CaratDrawer } from './drawer';
import { CaratColumnGroup } from './column-group';
import { CaratInclinometry } from '../lib/inclinometry';
import { ConstructionTransformer } from '../lib/transformer';
import { ConstructionLabels } from './construction-labels';
import { isRectInnerPoint } from 'shared/lib';
import { defaultSettings } from '../lib/constants';


/** Трек. */
export class CaratTrack {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник. */
  public readonly rect: Rectangle;
  /** Порт просмотра трека. */
  public readonly viewport: CaratViewport;
  /** Инклинометрия скважины. */
  public readonly inclinometry: CaratInclinometry;

  /** Находится ли трек в режиме показа конструкции скважины. */
  public readonly constructionMode: boolean;
  /** Класс, который трансформирует элементы для показа конструкции скважины. */
  public readonly transformer: ConstructionTransformer;
  /** Класс, отвечающий за отрисовку подписей к элементам конструкции. */
  private readonly constructionLabels: ConstructionLabels;

  /** Является ли трек активным. */
  public active: boolean;
  /** Список групп колонок. */
  private readonly groups: CaratColumnGroup[];
  /** Группа колонок типа `background`. */
  private readonly backgroundGroup: CaratColumnGroup;

  /** Название скважины трека. */
  public wellName: string;
  /** Подпись трека. */
  private label: string;
  /** Высота заголовков групп колонок. */
  public maxGroupHeaderHeight: number;
  /** Индекс активной группы. */
  private activeIndex: number;
  /** Активная кривая. */
  private activeCurve: CaratCurveModel | null;

  constructor(rect: Rectangle, columns: CaratColumnInit[], scale: number, drawer: CaratDrawer) {
    this.active = false;
    this.rect = rect;
    this.drawer = drawer;
    this.label = '';
    this.groups = [];
    this.activeIndex = -1;
    this.activeCurve = null;
    this.maxGroupHeaderHeight = 0;

    const groupWithYAxis = columns.find((group) => group.yAxis?.show);
    const step = groupWithYAxis?.yAxis.step ?? defaultSettings.yAxisStep;
    const scroll = {queue: [], direction: 0, step, id: null};
    this.viewport = {y: 0, height: 0, min: 0, max: 0, scale, scroll};

    let x = 0, index = 0;
    const top = drawer.trackHeaderSettings.height;
    const height = rect.height - top;

    for (const column of columns) {
      if (!this.inclinometry) {
        const channel = column.channels.find(c => c.type === 'inclinometry');
        if (channel) this.inclinometry = new CaratInclinometry(channel.info.inclinometry.details);
      }

      const { type, width } = column.settings;
      if (type === 'normal' || type === 'labels') {
        const groupRect = {top, left: x, width, height};
        const group = new CaratColumnGroup(groupRect, drawer, column);
        this.groups.push(group);
        if (column.active) this.activeIndex = index;
        x += width; index++;
        if (type === 'labels') this.constructionLabels = new ConstructionLabels(drawer, group);
      } else if (type === 'background') {
        const groupRect = {top, left: 0, height, width: rect.width};
        this.backgroundGroup = new CaratColumnGroup(groupRect, drawer, column);
      }
    }

    this.constructionMode = this.groups.some(g => g.constructionMode());
    if (this.constructionMode) this.transformer = new ConstructionTransformer();
  }

  /* --- Getters --- */

  /** Копия трека под заданные место и скважину. */
  public cloneFor(rect: Rectangle, wellName: string): CaratTrack {
    const groups = this.groups.map(g => g.cloneFor(rect));
    groups.forEach(g => g.active = false);
    groups[0].active = true;

    if (this.constructionLabels) {
      this.constructionLabels.dataGroup = groups.find(g => g.constructionMode());
      this.constructionLabels.labelGroup = groups.find(g => g.settings.type === 'labels');
    }

    const scroll = {queue: [], direction: 0, step: this.viewport.scroll.step, id: null};
    const viewport = {y: 0, height: 0, min: 0, max: 0, scale: this.viewport.scale, scroll};

    const copy: CaratTrack = {
      drawer: this.drawer,
      groups: groups,
      backgroundGroup: this.backgroundGroup.cloneFor(rect),
      wellName: wellName,
      label: wellName,
      maxGroupHeaderHeight: 0,
      activeIndex: 0,
      activeCurve: null,
      rect: rect,
      viewport: viewport,
      inclinometry: this.inclinometry ? new CaratInclinometry(this.inclinometry.channel) : null,
      constructionMode: this.constructionMode,
      transformer: this.transformer,
      constructionLabels: this.constructionLabels,
    } as any;

    Object.setPrototypeOf(copy, CaratTrack.prototype);
    return copy;
  }

  /** Колонки трека. */
  public getGroups(): CaratColumnGroup[] {
    return this.groups;
  }

  /** Текущая активная колонка. */
  public getActiveGroup(): CaratColumnGroup | null {
    if (this.activeIndex === -1) return null;
    return this.groups[this.activeIndex];
  }

  /** Колонка с кривыми (активная или первая подходящая). */
  public getCurveGroup(): CaratColumnGroup | null {
    const activeGroup = this.groups[this.activeIndex];
    if (activeGroup?.hasCurveColumn()) return activeGroup;
    return this.groups.find(g => g.hasCurveColumn()) ?? null;
  }

  /** Фоновая колонка. */
  public getBackgroundGroup(): CaratColumnGroup {
    return this.backgroundGroup;
  }

  /** Индекс текущей активной колонки. */
  public getActiveIndex(): number {
    return this.activeIndex;
  }

  /** Активная кривая. */
  public getActiveCurve(): CaratCurveModel | null {
    return this.activeCurve;
  }

  /** Список справочников, необходимых для отрисовки. */
  public getLookupNames(): ChannelName[] {
    const names: ChannelName[] = [];
    for (const group of this.groups) {
      names.push(...group.getLookupNames());
    }
    return [...new Set(names)];
  }

  /* --- Setters --- */

  /** Обновляет данные трека. */
  public setData(data: ChannelRecordDict, cache: CurveDataCache): void {
    const viewport = this.viewport;
    this.backgroundGroup.setData(data, cache);
    [viewport.min, viewport.max] = this.backgroundGroup.getRange();
    viewport.y = viewport.min;

    for (const group of this.groups) {
      group.setData(data, cache);
      const [groupMin, groupMax] = group.getRange();
      if (groupMin < viewport.min) viewport.min = groupMin;
      if (groupMax > viewport.max) viewport.max = groupMax;
    }

    if (this.constructionMode) {
      this.transformer.setConstructionElements(this.groups);
      this.transformer.transformGroups(this.groups, this.backgroundGroup);
      if (this.constructionLabels) this.constructionLabels.updateData();
      this.viewport.scroll.step = this.transformer.step / 4;
    }

    this.setActiveCurve(null);
    this.updateGroupRects();

    if (viewport.min === Infinity) viewport.min = 0;
    if (viewport.max === -Infinity) viewport.max = viewport.min + viewport.height;
  }

  /** Обновление данных справочников. */
  public setLookupData(lookupData: ChannelRecordDict): void {
    this.backgroundGroup.setLookupData(lookupData);
    for (const group of this.groups) group.setLookupData(lookupData);
  }

  /** Обновляет масштаб трека. */
  public setScale(scale: number): void {
    const viewport = this.viewport;
    viewport.scale = scale;

    const elementsHeight = this.backgroundGroup.getDataRect().height;
    viewport.height = elementsHeight / (scale * window.devicePixelRatio);

    if (viewport.max - viewport.min < viewport.height) {
      viewport.max = viewport.min + viewport.height;
    }
    if (viewport.y + viewport.height > viewport.max) {
      viewport.y = viewport.max - viewport.height;
    }
  }

  /** Обновляет общую высоту трека. */
  public setHeight(height: number): void {
    this.rect.height = height;
    const groupHeight = height - this.drawer.trackHeaderSettings.height;
    for (const group of this.groups) group.setHeight(groupHeight);
    this.backgroundGroup.setHeight(groupHeight);
    this.setScale(this.viewport.scale);
  }

  /** Обновляет высоту шапки трека. */
  public setHeaderHeight(height: number): void {
    for (const group of this.groups) group.setHeaderHeight(height);
    this.backgroundGroup.setHeaderHeight(height);
    this.maxGroupHeaderHeight = height;
  }

  /** Обновляет активную кривую трека. */
  public setActiveCurve(curve: CaratCurveModel | null): void {
    this.activeCurve = curve === this.activeCurve ? null : curve;
    const id = this.activeCurve?.id;
    this.groups.forEach(group => group.setActiveCurve(id));
    this.updateLabel();
  }

  /** Задаёт новую активную колонку по индексу. */
  public setActiveGroup(idx: number): void {
    if (idx < 0 && idx >= this.groups.length) return;
    this.groups.forEach(g => { g.active = false; });
    this.groups[idx].active = true;
    this.activeIndex = idx;
  }

  /** Задаёт новую ширину для колонки по индексу. */
  public setGroupWidth(idx: number, width: number): void {
    const group = this.groups[idx];
    if (!group) return;
    group.setWidth(width);
    if (this.constructionLabels && group === this.constructionLabels.labelGroup) {
      this.constructionLabels.updateMaxWidth();
    }
    this.updateGroupRects();
  }

  /** Задаёт новую подпись для колонки по индексу. */
  public setGroupLabel(idx: number, label: string): void {
    this.groups[idx]?.setLabel(label);
  }

  /** Задаёт новые настройки оси X для колонки по индексу. */
  public setGroupXAxisSettings(idx: number, newSettings: CaratColumnXAxis): void {
    const settings = this.groups[idx]?.xAxis;
    if (!settings) return;
    settings.grid = newSettings.grid;
    settings.numberOfMarks = newSettings.numberOfMarks;
  }

  /** Задаёт новые настройки оси Y для колонки по индексу. */
  public setGroupYAxisSettings(idx: number, newSettings: CaratColumnYAxis): void {
    const settings = this.groups[idx]?.yAxis;
    if (!settings) return;
    settings.show = newSettings.show;
    settings.grid = newSettings.grid;
    settings.absMarks = newSettings.absMarks;
    settings.depthMarks = newSettings.depthMarks;
  }

  /** Задаёт шаг по оси Y для колонки по индексу. */
  public setGroupYAxisStep(idx: number, step: number): void {
    const group = this.groups[idx];
    if (!group) return;
    group.yAxis.step = step;
    if (!this.constructionMode) {
      const groupWithYAxis = this.groups.find(group => group.yAxis?.show);
      this.viewport.scroll.step = groupWithYAxis?.yAxis.step ?? defaultSettings.yAxisStep;
    }
  }

  /* --- App Logic Actions --- */

  /** Перемещает колонку влево или вправо. */
  public moveGroup(idx: number, to: 'left' | 'right'): void {
    const k = to === 'left' ? -1 : 1;
    const relatedIndex = idx + k;
    const movedGroup = this.groups[idx];
    const relatedGroup = this.groups[relatedIndex];

    movedGroup.settings.index = relatedIndex;
    movedGroup.shift(k * relatedGroup.getDataRect().width);
    relatedGroup.settings.index = idx;
    relatedGroup.shift(-k * movedGroup.getDataRect().width);

    this.groups[idx] = relatedGroup;
    this.groups[relatedIndex] = movedGroup;
    if (idx === this.activeIndex) this.activeIndex = relatedIndex;
  }

  /* --- Event Handlers --- */

  /** Обрабатывает событие нажатия ПКМ. */
  public handleMouseDown(point: Point): void {
    point.x -= this.rect.left;
    point.y -= this.rect.top;

    const findFn = (group) => isRectInnerPoint(point, group.getDataRect())
    const newActiveIndex = this.groups.findIndex(findFn);
    if (newActiveIndex !== -1) this.setActiveGroup(newActiveIndex);

    for (const group of this.groups) {
      const nearCurve = group.getNearCurve(point, this.viewport);
      if (nearCurve) { this.setActiveCurve(nearCurve); return; }
    }
  }

  /* --- Technical Methods --- */

  /** Обновляет заголовка трека под текущее состояние. */
  private updateLabel(): void {
    const curve = this.activeCurve;
    if (curve) {
      const top = Math.floor(curve.top);
      const bottom = Math.ceil(curve.bottom);
      this.label = `${this.wellName} ${curve.type} (${top} - ${bottom})`;
    } else {
      this.label = this.wellName;
    }
  }

  /** Обновляет положение групп и ширину трека. */
  public updateGroupRects(): void {
    if (!this.groups.length) return;
    let x = 0;

    for (const group of this.groups) {
      const width = group.getDataRect().width;
      group.getDataRect().left = x;
      x += width;
    }
    this.rect.width = x;
    this.backgroundGroup.setWidth(x);
  }

  /* --- Rendering --- */

  /** Полный рендер всего трека. */
  public render(): void {
    if (this.rect.width <= 0) return;
    this.drawer.setCurrentTrack(this.rect, this.viewport, this.inclinometry, this.transformer);
    this.backgroundGroup.renderContent();

    for (const group of this.groups) {
      if (group.active || group.settings.width <= 0) continue;
      group.renderHeader();
      group.renderContent();
    }
    if (this.activeIndex !== -1) {
      const group = this.groups[this.activeIndex];
      if (group.settings.width > 0) {
        group.renderHeader();
        group.renderContent();
      }
    }
    if (this.constructionLabels) this.constructionLabels.render();
    this.drawer.drawTrackBody(this.label, this.active);
  }

  /** Частичный рендер трека: только элементы колонок. */
  public lazyRender(): void {
    if (this.rect.width <= 0) return;
    this.drawer.setCurrentTrack(this.rect, this.viewport, this.inclinometry, this.transformer);
    this.drawer.clearTrackElementRect(this.maxGroupHeaderHeight);
    this.backgroundGroup.renderContent();

    for (const group of this.groups) {
      if (!group.active && group.settings.width > 0) group.renderContent();
    }
    const group = this.groups[this.activeIndex];
    if (group && group.settings.width > 0) group.renderContent();
    if (this.constructionLabels) this.constructionLabels.render();
  }
}
