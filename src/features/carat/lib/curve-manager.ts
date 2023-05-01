import { CaratCurveModel, CaratCurveStyleDict } from './types';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { applyInfoIndexes } from './channels';
import { getPragmaticMax } from 'shared/lib';
import { defaultSettings } from './constants';


interface CurveSelector {
  regExp: RegExp,
  selected: boolean,
}


export class CurveManager {
  private static typeToSelector(t: CaratCurveSelector): CurveSelector {
    return {regExp: new RegExp(t.expression), selected: t.isSelected};
  }
  private static selectorToType(s: CurveSelector): CaratCurveSelector {
    return {expression: s.regExp.source, isSelected: s.selected};
  }

  private static async loadCurveChannelData(name: ChannelName, ids: any[]) {
    const parameter: Parameter = {id: 'currentCurveIds', type: 'stringArray', value: ids} as Parameter;
    const res = await channelsAPI.getChannelData(name, [parameter], {order: []} as any);
    return res.ok ? res.data.data : null;
  }

  /** Список кривых. */
  private curves: CaratCurveModel[];
  /** Словарь кривых. */
  private curveDict: Record<CaratCurveID, CaratCurveModel>;
  /** Типы из списка кривых **без повторений**. */
  private curveTypes: CaratCurveType[];

  /** Граничные значения шкал кривых. */
  public readonly measures: Record<CaratCurveType, CaratCurveMeasure>;
  /** Словарь свойств внешнего вида кривых. */
  public readonly styleDict: CaratCurveStyleDict;

  /** Подключённый канал со списком кривых. */
  public curveSetChannel: CaratAttachedChannel;
  /** Подключённый канал с данными кривых. */
  public curveDataChannel: CaratAttachedChannel;

  /** Типы кривых. */
  public readonly selectors: CurveSelector[];
  /** Начальная дата. */
  public start: Date | 'now';
  /** Конечная дата. */
  public end: Date | 'now';

  constructor(initSelection: CaratDataSelection, initMeasures: CaratCurveMeasure[]) {
    this.curves = [];
    this.curveTypes = [];
    this.styleDict = new Map();

    this.measures = {};
    initMeasures.forEach((measure) => { this.measures[measure.type] = measure; });

    this.selectors = initSelection.types.map(CurveManager.typeToSelector);
    this.start = initSelection.start === 'now' ? 'now' : new Date(initSelection.start);
    this.end = initSelection.end === 'now' ? 'now' : new Date(initSelection.end);
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
    const info = this.curveSetChannel.info as CaratCurveSetInfo;
    const cells = row.Cells;
    const dateString = cells[info.date.index];
    const curveType = cells[info.type.index];

    return {
      id: cells[info.id.index],
      type: curveType, date: dateString ? new Date(dateString) : null,
      top: 0, bottom: 0, min: 0, max: 0, axisMin: 0, axisMax: 0,
      defaultLoading: Boolean(cells[info.defaultLoading.index]),
      style: this.styleDict.get(curveType) ?? defaultSettings.curveStyle,
    };
  }

  public setCurveChannelData(data: ChannelData) {
    this.curveDict = {};
    const rows = data?.rows;
    if (!rows) { this.curves = []; return; }

    if (!this.curveSetChannel.applied) applyInfoIndexes(this.curveSetChannel, data.columns);
    const validatedRows = this.validateRows(rows);

    this.curves = validatedRows.map(this.createCurveModel, this);
    this.curves.forEach((curve) => { this.curveDict[curve.id] = curve; });
    this.curveTypes = [...new Set(this.curves.map(curve => curve.type))];
  }

  public setStyleData(lookupData: ChannelDict) {
    this.styleDict.clear();
    const curveColorChannel = lookupData[this.curveSetChannel.style.name];

    curveColorChannel?.data?.rows?.forEach((row) => {
      let [type, color] = row.Cells as [string, string];
      if (color.length > 7) color = color.substring(0, 7);
      this.styleDict.set(type, {color, thickness: 2});
    });
  }

  public getAllCurves(): CaratCurveModel[] {
    return this.curves;
  }

  public getVisibleCurves(): CaratCurveModel[] {
    return this.curves.filter((curve) => curve.defaultLoading);
  }

  public getFilteredCurves(): CaratCurveModel[] {
    const start = typeof this.start === 'string' ? new Date() : this.start;
    const end = typeof this.end === 'string' ? new Date() : this.end;

    return this.curves.filter((curve) => {
      const curveDate = curve.date;
      if (!curveDate || curveDate < start || curveDate > end) return false;

      const curveType = curve.type;
      for (const selector of this.selectors) {
        const matched = selector.regExp.test(curveType);
        if (matched) return selector.selected;
      }
      return false;
    });
  }

  public getCurveTypes(): CaratCurveType[] {
    return this.curveTypes;
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
    const idsToLoad: CaratCurveID[] = ids.filter(id => !this.curveDict[id].path);
    if (idsToLoad.length === 0) return true;
    const data = await CurveManager.loadCurveChannelData(this.curveDataChannel.name, idsToLoad);
    if (!data) return false;

    if (!this.curveDataChannel.applied) applyInfoIndexes(this.curveDataChannel, data.columns);
    const info = this.curveDataChannel.info as CaratCurveDataInfo;

    for (const { Cells: cells } of data.rows) {
      const model = this.curveDict[cells[info.id.index]];
      const pathSource = window.atob(cells[info.data.index]);

      model.path = new Path2D(pathSource);
      model.top = cells[info.top.index];
      model.bottom = cells[info.bottom.index];
      model.min = cells[info.min.index];
      model.max = cells[info.max.index];
      this.applyCurveAxisRange(model);
    }
    return true;
  }

  public getInitSelection(): CaratDataSelection {
    const types = this.selectors.map(CurveManager.selectorToType);
    const start = typeof this.start === 'string' ? this.start : this.start.toJSON();
    const end = typeof this.end === 'string' ? this.end : this.end.toJSON();
    return {types, start, end};
  }

  public getInitMeasures(): CaratCurveMeasure[] {
    return Object.values(this.measures);
  }
}
