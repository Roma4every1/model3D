import { CaratCurveModel } from './types';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { applyInfoIndexes } from './channels';
import { getPragmaticMax } from 'shared/lib';


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

  private static validateRows(rows: ChannelRow[], info: CaratCurveSetInfo): ChannelRow[] {
    const idIndex = info.id.index;
    return rows.filter((row) => {
      const id = row.Cells[idIndex];
      return id !== null && id !== undefined;
    });
  }
  private static rowToCurveModel(row: ChannelRow, info: CaratCurveSetInfo): CaratCurveModel {
    const cells = row.Cells;
    const dateString = cells[info.date.index];

    return {
      id: cells[info.id.index],
      type: cells[info.type.index], date: dateString ? new Date(dateString) : null,
      top: 0, bottom: 0, min: 0, max: 0, axisMin: 0, axisMax: 0,
      defaultLoading: Boolean(cells[info.defaultLoading.index]),
    };
  }

  private static async loadCurveChannelData(name: ChannelName, ids: any[]) {
    const parameter: Parameter = {id: 'currentCurveIds', type: 'stringArray', value: ids} as Parameter;
    const res = await channelsAPI.getChannelData(name, [parameter], {order: []} as any);
    return res.ok ? res.data.data : null;
  }

  /** Типы кривых. */
  public readonly selectors: CurveSelector[];
  /** Граничные значения шкал кривых. */
  public readonly measures: Record<CaratCurveType, CaratCurveMeasure>;
  /** Начальная дата. */
  public start: Date | 'now';
  /** Конечная дата. */
  public end: Date | 'now';

  /** Список кривых. */
  private curves: CaratCurveModel[];
  /** Словарь кривых. */
  private curveDict: Record<CaratCurveID, CaratCurveModel>;

  /** Подключённый канал со списком кривых. */
  public curveSetChannel: CaratAttachedChannel;
  /** Подключённый канал с данными кривых. */
  public curveDataChannel: CaratAttachedChannel;

  constructor(initSelection: CaratDataSelection, initMeasures: CaratCurveMeasure[]) {
    this.curves = [];
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

  public setCurveChannelData(data: ChannelData) {
    this.curveDict = {};
    const rows = data?.rows;
    if (!rows) { this.curves = []; return; }

    if (!this.curveSetChannel.applied) applyInfoIndexes(this.curveSetChannel, data.columns);
    const info = this.curveSetChannel.info as CaratCurveSetInfo;
    const validatedRows = CurveManager.validateRows(rows, info);

    this.curves = validatedRows.map((row) => CurveManager.rowToCurveModel(row, info));
    this.curves.forEach((curve) => { this.curveDict[curve.id] = curve; });
  }

  public getAllCurves(): CaratCurveModel[] {
    return this.curves;
  }

  public getDefaultCurves(): CaratCurveModel[] {
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

  public setMeasure(curveType: CaratCurveType, min: number, max: number) {
    const measure = this.measures[curveType];
    if (measure) {
      measure.min = min;
      measure.max = max;
    } else {
      this.measures[curveType] = {type: curveType, min, max};
    }
    this.curves.filter(c => c.type === curveType).forEach(this.applyCurveAxisRange, this);
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
