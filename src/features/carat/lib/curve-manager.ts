import { CaratCurveModel, CaratCurveStyleDict } from './types';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { getPragmaticMax } from 'shared/lib';
import { fixHEX } from './utils';
import { applyInfoIndexes } from './channels';
import { defaultSettings } from './constants';


interface CurvePopularType {
  regExp: RegExp,
  selected: boolean,
}
interface CurveTreeGroup {
  value: string,
  checked: boolean,
  expanded: boolean,
  children: {value: CaratCurveModel, checked: boolean}[],
}


export class CurveManager {
  private static typeToSelector(t: CaratCurveSelector): CurvePopularType {
    return {regExp: new RegExp(t.expression), selected: t.isSelected};
  }
  private static selectorToType(s: CurvePopularType): CaratCurveSelector {
    return {expression: s.regExp.source, isSelected: s.selected};
  }

  private static async loadCurveChannelData(name: ChannelName, ids: any[]) {
    const parameter: Parameter = {id: 'currentCurveIds', type: 'stringArray', value: ids} as Parameter;
    const res = await channelsAPI.getChannelData(name, [parameter], {order: []} as any);
    return res.ok ? res.data.data : null;
  }

  private static parseCurvePath(source: string): ClientPoint[] {
    const items = source.split('L');
    items[0] = items[0].substring(1);
    return items.map((item) => {
      const [x, y] = item.split(',');
      return {x: parseFloat(x), y: parseFloat(y)};
    });
  }

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
  /** Выдавать кривые либо с загрузкой по умолчанию, либо по фильтрам. */
  public defaultMode: boolean;
  /** Последние установленные данные канала. */
  private lastData: ChannelData | null;

  /** Граничные значения шкал кривых. */
  public readonly measures: Record<CaratCurveType, CaratCurveMeasure>;
  /** Словарь свойств внешнего вида кривых. */
  public readonly styleDict: CaratCurveStyleDict;

  /** Подключённый канал со списком кривых. */
  public curveSetChannel: CaratAttachedChannel;
  /** Подключённый канал с данными кривых. */
  public curveDataChannel: CaratAttachedChannel;

  /** Типы кривых. */
  public readonly popularTypes: CurvePopularType[];
  /** Начальная дата. */
  public start: Date;
  /** Конечная дата. */
  public end: Date;

  constructor(initSelection: CaratDataSelection, initMeasures: CaratCurveMeasure[]) {
    this.defaultMode = true;
    this.lastData = null;
    this.curves = [];
    this.curveDict = {};
    this.curveTypes = [];
    this.curveTree = [];
    this.typeSelection = [];
    this.styleDict = new Map();

    this.measures = {};
    initMeasures.forEach((measure) => { this.measures[measure.type] = measure; });

    const popularTypes = initSelection?.types ?? [];
    const start = initSelection?.start ?? 'now';
    const end = initSelection?.end ?? 'now';
    this.popularTypes = popularTypes.map(CurveManager.typeToSelector);
    this.start = start === 'now' ? new Date() : new Date(start);
    this.end = end === 'now' ? new Date() : new Date(end);
  }

  public setChannels(curveSet: CaratAttachedChannel, curveData: CaratAttachedChannel) {
    this.curveSetChannel = curveSet;
    this.curveDataChannel = curveData;
  }

  private validateRows(rows: ChannelRow[]): ChannelRow[] {
    const idIndex = this.curveSetChannel.info.id.index;
    return rows.filter((row) => {
      const id = row.Cells[idIndex];
      return id !== null && id !== undefined;
    });
  }

  private createCurveModel(row: ChannelRow): CaratCurveModel {
    const cells = row.Cells;
    const info = this.curveSetChannel.info as CaratCurveSetInfo;

    const dateString = cells[info.date.index];
    const curveType = cells[info.type.index];
    const top = cells[info.top.index], bottom = cells[info.bottom.index];
    const style = this.styleDict.get(curveType) ?? defaultSettings.curveStyle;

    return {
      id: cells[info.id.index],
      type: curveType, date: dateString ? new Date(dateString) : null,
      top, bottom, min: 0, max: 0, axisMin: 0, axisMax: 0,
      defaultLoading: Boolean(cells[info.defaultLoading.index]),
      path: new Path2D(), points: null,
      style, active: false,
    };
  }

  private isPopularType(curveType: CaratCurveType): boolean {
    for (const selector of this.popularTypes) {
      const matched = selector.regExp.test(curveType);
      if (matched) return selector.selected;
    }
    return false;
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

  private resetTree() {
    const map: Map<number, CaratCurveModel[]> = new Map();
    for (const curve of this.curves) {
      const time = curve.date.getTime();
      if (!map.has(time)) map.set(time, []);
      map.get(time).push(curve);
    }
    this.curveTree = [];
    for (const list of map.values()) {
      const children = list.map((curve) => ({value: curve, checked: this.isPopularType(curve.type)}));
      const value = list[0].date.toLocaleDateString();
      const checked = children.some(child => child.checked);
      this.curveTree.push({value, children, checked, expanded: false});
    }
  }

  private resetTypeSelection() {
    this.typeSelection = this.curveTypes.map((curveType) => {
      return {type: curveType, checked: this.isPopularType(curveType)};
    });
  }

  private updateTree() {
    for (const curveTreeGroup of this.curveTree) {
      for (const item of curveTreeGroup.children) {
        item.checked = this.testCurve(item.value);
      }
      curveTreeGroup.checked = curveTreeGroup.children.some(item => item.checked);
    }
  }

  public setCurveChannelData(data: ChannelData) {
    if (data === this.lastData) return;
    this.lastData = data;
    this.curveDict = {};
    const rows = data?.rows;

    if (!rows) {
      this.curves = [];
      this.curveTypes = [];
    } else {
      if (!this.curveSetChannel.applied) applyInfoIndexes(this.curveSetChannel, data.columns);
      const validatedRows = this.validateRows(rows);
      this.curves = validatedRows.map(this.createCurveModel, this);
      this.curves.forEach((curve) => { this.curveDict[curve.id] = curve; });
      this.curveTypes = [...new Set(this.curves.map(curve => curve.type))];
    }

    this.resetTree();
    this.resetTypeSelection();
  }

  public setActiveCurve(id?: CaratCurveID) {
    this.curves.forEach((curve) => { curve.active = false; });
    const activeCurve = this.curveDict[id];
    if (activeCurve) activeCurve.active = true;
  }

  public setStyleData(lookupData: ChannelDict) {
    this.styleDict.clear();
    const curveColorChannel = lookupData[this.curveSetChannel.curveColorLookup];

    curveColorChannel?.data?.rows?.forEach((row) => {
      let [type, color] = row.Cells as [string, string];
      this.styleDict.set(type, {color: fixHEX(color), thickness: 2});
    });
  }

  public getVisibleCurves(): CaratCurveModel[] {
    if (this.defaultMode) {
      return this.curves.filter((curve) => curve.defaultLoading);
    } else {
      return this.getFilteredCurves();
    }
  }

  public getFilteredCurves(): CaratCurveModel[] {
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

  public getCurveTree(): any[] {
    return this.curveTree;
  }

  public setRange(start: Date, end: Date) {
    this.start = start;
    this.end = end;
    this.updateTree();
  }

  public setTypeSelection(types: any[]) {
    this.typeSelection = types;
    this.updateTree();
  }

  public setMeasure(curveType: CaratCurveType, min: number | null, max: number | null) {
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

  private applyCurveAxisRange(model: CaratCurveModel) {
    const measure = this.measures[model.type];
    model.axisMin = measure?.min ?? 0;
    model.axisMax = measure?.max ?? getPragmaticMax(model.max);
  }

  public async loadCurveData(ids: CaratCurveID[]): Promise<boolean> {
    const idsToLoad: CaratCurveID[] = ids.filter(id => !this.curveDict[id].points);
    if (idsToLoad.length === 0) return true;

    const lastData = this.lastData;
    const data = await CurveManager.loadCurveChannelData(this.curveDataChannel.name, idsToLoad);
    if (!data || lastData !== this.lastData) return false;

    if (!this.curveDataChannel.applied) applyInfoIndexes(this.curveDataChannel, data.columns);
    const info = this.curveDataChannel.info as CaratCurveDataInfo;

    for (const { Cells: cells } of data.rows) {
      const model = this.curveDict[cells[info.id.index]];
      const pathSource = window.atob(cells[info.data.index]);

      model.path = new Path2D(pathSource);
      model.points = CurveManager.parseCurvePath(pathSource);

      model.top = cells[info.top.index];
      model.bottom = cells[info.bottom.index];
      model.min = cells[info.min.index];
      model.max = cells[info.max.index];
      this.applyCurveAxisRange(model);
    }
    return true;
  }

  public getInitSelection(): CaratDataSelection {
    const types = this.popularTypes.map(CurveManager.selectorToType);
    const start = this.start.toJSON().substring(0, 10);
    const end = this.end.toJSON().substring(0, 10);
    return {types, start, end};
  }

  public getInitMeasures(): CaratCurveMeasure[] {
    return Object.values(this.measures);
  }
}
