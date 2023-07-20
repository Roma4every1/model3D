import { CaratCurveModel, CaratCurveStyleDict } from './types';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { getPragmaticMax } from 'shared/lib';
import { fixHEX } from './utils';
import { applyInfoIndexes } from './channels';
import { defaultSettings } from './constants';


interface CurveTreeGroup {
  date: Date,
  text: string,
  checked: boolean,
  expanded: boolean,
  children: {value: CaratCurveModel, checked: boolean}[],
}


export class CurveManager {
  private static async loadCurveChannelData(name: ChannelName, ids: any[]): Promise<ChannelData> {
    const parameter: Parameter = {id: 'currentCurveIds', type: 'stringArray', value: ids} as Parameter;
    const res = await channelsAPI.getChannelData(name, [parameter], {order: []} as any);
    return res.ok ? res.data.data : null;
  }

  private static parseCurvePath(source: string): Point[] {
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
  /** Последние установленные данные канала. */
  private lastData: ChannelData | null;

  /** Граничные значения шкал кривых. */
  public readonly measures: Record<CaratCurveType, CaratCurveMeasure>;
  /** Словарь свойств внешнего вида кривых. */
  public styleDict: CaratCurveStyleDict;

  /** Подключённый канал со списком кривых. */
  public curveSetChannel: CaratAttachedChannel;
  /** Подключённый канал с данными кривых. */
  public curveDataChannel: CaratAttachedChannel;

  /** Типы кривых. */
  public readonly popularTypes: CaratCurveSelector[];
  /** Начальная дата. */
  public start: Date;
  /** Конечная дата. */
  public end: Date;

  constructor(initSelection: CaratDataSelection, initMeasures: CaratCurveMeasure[]) {
    this.lastData = null;
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
    copy.curveDataChannel = this.curveDataChannel;
    copy.styleDict = this.styleDict;
    return copy;
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
    const description = cells[info.description.index] ?? '';
    const top = cells[info.top.index], bottom = cells[info.bottom.index];
    const style = this.styleDict.get(curveType) ?? defaultSettings.curveStyle;

    return {
      id: cells[info.id.index], type: curveType, description,
      date: dateString ? new Date(dateString) : null,
      top, bottom, min: 0, max: 0, axisMin: 0, axisMax: 0,
      defaultLoading: Boolean(cells[info.defaultLoading.index]),
      path: new Path2D(), points: null,
      style, active: false,
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

  private resetTree() {
    const map: Map<string, CaratCurveModel[]> = new Map();
    for (const curve of this.curves) {
      const date = curve.date.toJSON().slice(0, 10);
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

  private resetTypeSelection() {
    const checkedTypes = this.curves.filter((c) => c.defaultLoading).map((c) => c.type);
    this.typeSelection = this.curveTypes.map((curveType) => {
      return {type: curveType, checked: checkedTypes.includes(curveType)};
    });
  }

  private resetDates() {
    const minDate = this.curveTree.at(0)?.date;
    const maxDate = this.curveTree.at(-1)?.date;
    if (minDate) this.start = minDate;
    if (maxDate) this.end = maxDate;
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
      if (!this.curveSetChannel.applied) {
        this.curveSetChannel.info.description = {name: 'MNEMONIC_DESCR', index: -1};
        applyInfoIndexes(this.curveSetChannel, data.columns);
      }
      const validatedRows = this.validateRows(rows);
      this.curves = validatedRows.map(this.createCurveModel, this);
      this.curves.forEach((curve) => { this.curveDict[curve.id] = curve; });
      this.curveTypes = [...new Set(this.curves.map(curve => curve.type))];
    }

    this.resetTree();
    this.resetTypeSelection();
    this.resetDates();
  }

  public setActiveCurve(id?: CaratCurveID) {
    this.curves.forEach((curve) => { curve.active = false; });
    const activeCurve = this.curveDict[id];
    if (activeCurve) activeCurve.active = true;
  }

  public setStyleData(lookupData: ChannelDataDict) {
    this.styleDict.clear();
    const curveColorChannel = lookupData[this.curveSetChannel.curveColorLookup];

    curveColorChannel?.rows?.forEach((row) => {
      let [type, color] = row.Cells as [string, string];
      this.styleDict.set(type, {color: fixHEX(color), thickness: 2});
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
    const start = this.start.toJSON().substring(0, 10);
    const end = this.end.toJSON().substring(0, 10);
    return {types: this.popularTypes, start, end};
  }

  public getInitMeasures(): CaratCurveMeasure[] {
    return Object.values(this.measures);
  }
}
