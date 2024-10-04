import type { CaratCurveModel } from './types';
import type { CaratCurveMeasure, CaratDataSelection, CaratCurveSelector } from './dto.types';
import { parseDate, stringifyLocalDate, fixColorHEX, calcAxisMin, calcAxisMax } from 'shared/lib';
import { defaultSettings } from './constants';


interface CurveTreeGroup {
  date: Date,
  text: string,
  checked: boolean,
  expanded: boolean,
  children: {value: CaratCurveModel, checked: boolean}[],
}


export class CurveManager {
  /** Список кривых. */
  private curves: CaratCurveModel[];
  /** Словарь кривых. */
  private curveDict: Record<CaratCurveID, CaratCurveModel>;
  /** Типы из списка кривых **без повторений**. */
  private curveTypes: CaratCurveType[];
  /** Дерево выборки кривых (группы по датам). */
  private curveTree: CurveTreeGroup[];
  /** Выборка типов. */
  private typeSelection: any[];

  /** Граничные значения шкал кривых. */
  public readonly measures: Record<CaratCurveType, CaratCurveMeasure>;
  /** Словарь свойств внешнего вида кривых. */
  public styleDict: Map<CaratCurveType, LineStyle>;
  /** Подключённый канал со списком кривых. */
  public curveSetChannel: AttachedChannel;

  /** Типы кривых. */
  public readonly popularTypes: CaratCurveSelector[];
  /** Начальная дата. */
  public start: Date;
  /** Конечная дата. */
  public end: Date;

  constructor(initSelection: CaratDataSelection, initMeasures: CaratCurveMeasure[]) {
    this.curves = [];
    this.curveDict = {};
    this.curveTypes = [];
    this.curveTree = [];
    this.typeSelection = [];
    this.styleDict = new Map();

    this.measures = {};
    initMeasures.forEach(measure => { this.measures[measure.type] = measure; });

    const popularTypes = initSelection?.types ?? [];
    const start = initSelection?.start ?? 'now';
    const end = initSelection?.end ?? 'now';
    this.popularTypes = popularTypes;
    this.start = start === 'now' ? new Date() : new Date(start);
    this.end = end === 'now' ? new Date() : new Date(end);
  }

  public copy(): CurveManager {
    const copy = new CurveManager(this.getInitSelection(), this.getInitMeasures());
    copy.curveSetChannel = this.curveSetChannel;
    copy.styleDict = this.styleDict;
    return copy;
  }

  public setChannel(curveSet: AttachedChannel): void {
    this.curveSetChannel = curveSet;
  }

  private createCurveModel(record: ChannelRecord, cache: CurveDataCache): CaratCurveModel {
    const info = this.curveSetChannel.info;
    const id = record[info.id.columnName];
    const curveType = record[info.type.columnName];
    const cacheData: CaratCurveData = cache[id] ?? ({} as any);

    let top = cacheData.top ?? null;
    if (top === null && info.top?.columnName) top = record[info.top.columnName];
    let bottom = cacheData.bottom ?? null;
    if (bottom === null && info.bottom?.columnName) bottom = record[info.bottom.columnName];

    return {
      id, type: curveType,
      date: info.date ? parseDate(record[info.date.columnName]) : null,
      description: record[info.description?.columnName] ?? '',
      top, bottom,
      min: cacheData.min ?? 0, max: cacheData.max ?? 0,
      axisMin: 0, axisMax: 0,
      path: cacheData.path, points: cacheData.points,
      defaultLoading: Boolean(record[info.defaultLoading.columnName]),
      style: this.styleDict.get(curveType) ?? defaultSettings.curveStyle,
      active: false,
    };
  }

  private isInRange(curve: CaratCurveModel): boolean {
    const curveDate = curve.date;
    return curveDate && curveDate >= this.start && curveDate <= this.end;
  }

  private isInTypeSelection(curve: CaratCurveModel): boolean {
    for (const selection of this.typeSelection) {
      if (curve.type === selection.type) return selection.checked;
    }
    return true;
  }

  public testCurve(curve: CaratCurveModel): boolean {
    return this.isInRange(curve) && this.isInTypeSelection(curve);
  }

  private resetTree(): void {
    if (!this.curveSetChannel.info.date) {
      const children = this.curves.map(curve => ({value: curve, checked: curve.defaultLoading}));
      const checked = children.some(child => child.checked);
      this.curveTree = [{date: null, text: '', checked, children, expanded: false}];
      return;
    }

    const map: Map<string, CaratCurveModel[]> = new Map();
    for (const curve of this.curves) {
      const date = stringifyLocalDate(curve.date);
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(curve);
    }

    this.curveTree = [];
    const values = [...map.values()].sort((a, b) => a[0].date.getTime() - b[0].date.getTime());

    for (const list of values) {
      const children = list.map((curve) => ({value: curve, checked: curve.defaultLoading}));
      const date = list[0].date;
      const checked = children.some(child => child.checked);
      this.curveTree.push({date, text: date.toLocaleDateString(), children, checked, expanded: false});
    }
  }

  private resetTypeSelection(): void {
    const checkedTypes = this.curves.filter((c) => c.defaultLoading).map((c) => c.type);
    this.typeSelection = this.curveTypes.map((curveType) => {
      return {type: curveType, checked: checkedTypes.includes(curveType)};
    });
  }

  private resetDates(): void {
    const minDate = this.curveTree.at(0)?.date;
    const maxDate = this.curveTree.at(-1)?.date;
    if (minDate) this.start = minDate;
    if (maxDate) this.end = maxDate;
  }

  private updateTree(): void {
    for (const curveTreeGroup of this.curveTree) {
      for (const item of curveTreeGroup.children) {
        item.checked = this.testCurve(item.value);
      }
      curveTreeGroup.checked = curveTreeGroup.children.some(item => item.checked);
    }
  }

  public setCurveChannelData(records: ChannelRecord[], cache: CurveDataCache): void {
    this.curveDict = {};

    if (records.length === 0) {
      this.curves = [];
      this.curveTypes = [];
    } else {
      this.curves = records.map(record => this.createCurveModel(record, cache));
      this.curveTypes = [...new Set(this.curves.map(curve => curve.type))];

      for (const curve of this.curves) {
        this.applyCurveAxisRange(curve);
        this.curveDict[curve.id] = curve;
      }
    }

    this.resetTree();
    this.resetTypeSelection();
    this.resetDates();
  }

  public setCurvePointData(ids: CaratCurveID[], cache: CurveDataCache): void {
    for (const id of ids) {
      const pointData = cache[id];
      const curve = this.curves.find(c => c.id === id);

      curve.path = pointData.path;
      curve.points = pointData.points;
      curve.top = pointData.top;
      curve.bottom = pointData.bottom;
      curve.min = pointData.min;
      curve.max = pointData.max;
      this.applyCurveAxisRange(curve);
    }
  }

  public setActiveCurve(id?: CaratCurveID): CaratCurveModel {
    this.curves.forEach((curve) => { curve.active = false; });
    const activeCurve = this.curveDict[id];
    if (activeCurve) activeCurve.active = true;
    return activeCurve;
  }

  public setStyleData(lookupData: ChannelRecordDict): void {
    this.styleDict.clear();
    const colorLookup = this.curveSetChannel.info.type.lookups.color;
    if (!colorLookup) return;
    const { id, info } = colorLookup;

    lookupData[id]?.forEach((record) => {
      const type = record[info.type.columnName];
      const color = record[info.color.columnName];
      this.styleDict.set(type, {color: fixColorHEX(color), thickness: 2});
    });
  }

  public getVisibleCurves(): CaratCurveModel[] {
    const result: CaratCurveModel[] = [];
    for (const group of this.curveTree) {
      if (!group.checked) continue;
      for (const item of group.children) {
        if (item.checked) result.push(item.value);
      }
    }
    return result;
  }

  public getCurveTypes(): CaratCurveType[] {
    return this.curveTypes;
  }

  public getTypeSelection(): any[] {
    return this.typeSelection;
  }

  public getCurveTree(): CurveTreeGroup[] {
    return this.curveTree;
  }

  public setRange(start: Date, end: Date): void {
    this.start = start;
    this.end = end;
    this.updateTree();
  }

  public setTypeSelection(types: any[]): void {
    this.typeSelection = types;
    this.updateTree();
  }

  public setMeasure(curveType: CaratCurveType, min: number | null, max: number | null): void {
    if (min === null && max === null) {
      delete this.measures[curveType];
    } else {
      const measure = this.measures[curveType];
      if (measure) {
        measure.min = min;
        measure.max = max;
      } else {
        this.measures[curveType] = {type: curveType, min, max};
      }
    }
    this.curves.filter(c => c.type === curveType).forEach(this.applyCurveAxisRange, this);
  }

  private applyCurveAxisRange(curve: CaratCurveModel): void {
    const measure = this.measures[curve.type];
    curve.axisMin = measure?.min ?? calcAxisMin(curve.min);
    curve.axisMax = measure?.max ?? calcAxisMax(curve.max);
  }

  public getInitSelection(): CaratDataSelection {
    const start = stringifyLocalDate(this.start);
    const end = stringifyLocalDate(this.end);
    return {types: this.popularTypes, start, end};
  }

  public getInitMeasures(): CaratCurveMeasure[] {
    return Object.values(this.measures);
  }
}
