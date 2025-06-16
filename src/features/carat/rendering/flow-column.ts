import type { CaratBarPropertySettings, CaratColumnInit, CaratTextPropertySettings } from '../lib/dto.types';
import type { CaratFlowModel, CaratGroupState } from '../lib/types';
import { round, parseDate } from 'shared/lib';
import { formatFlowDate } from '../lib/utils';
import { CaratDrawer } from './drawer';


/** Колонка каротажной диаграммы c потокометрией. */
export class CaratFlowColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Подключённый канал со списком кривых. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;

  private readonly barStyle: CaratBarPropertySettings | undefined;
  private readonly barProperty: ChannelProperty | undefined;
  private readonly textStyle: CaratTextPropertySettings | undefined;

  /** Группы по дате. */
  private groups: CaratGroupState[];
  /** Координаты по X разделительных линий зон. */
  private dividingLines: number[];

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: AttachedChannel, init: CaratColumnInit) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.visible = true;
    this.groups = [{rect, elements: []}];
    this.dividingLines = [];

    const properties = init.properties[channel.name] ?? {};
    for (const property of this.channel.attachedProperties) {
      const settings = properties[property.name];
      if (!settings) continue;

      if (!this.barProperty && settings.bar && settings.showBar) {
        this.barProperty = property;
        this.barStyle = settings.bar;
      }
      if (settings.text && settings.showText) {
        this.textStyle = settings.text;
      }
    }
  }

  public copy(): CaratFlowColumn {
    const copy: any = {...this};
    copy.rect = {...this.rect};
    copy.groups = [{rect: this.groups[0].rect, elements: []}];
    copy.dividingLines = [];
    Object.setPrototypeOf(copy, CaratFlowColumn.prototype);
    return copy as CaratFlowColumn;
  }

  private createFlowModel(record: ChannelRecord, max: number): CaratFlowModel | null {
    const info = this.channel.info;
    const top = record[info.top.columnName];
    const bottom = record[info.bottom.columnName];
    const date = parseDate(record[info.date.columnName]);
    const percent = record[info.percent.columnName];
    if (top === null || bottom === null || date === null || percent === null) return null;

    const text = round(percent, 1).toString();
    return {date, top, bottom, text, value: Number(percent / max)};
  }

  public getRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const flowGroup of this.groups) {
      for (const { top, bottom } of flowGroup.elements) {
        if (top < min) min = top;
        if (bottom > max) max = bottom;
      }
    }
    return [min, max];
  }

  public getLookups(): ChannelID[] {
    return [];
  }

  public getGroups(): CaratGroupState[] {
    return this.groups;
  }

  public getGroupWidth(): number {
    return this.groups[0].rect.width;
  }

  public getTotalWidth(): number {
    return this.groups[0].rect.width * this.groups.length;
  }

  public setGroupWidth(width: number): void {
    for (let i = 0; i < this.groups.length; ++i) {
      const left = i * width;
      const rect = this.groups[i].rect;
      rect.left = left; rect.width = width;
      if (i > 0) this.dividingLines[i - 1] = left;
    }
    this.rect.width = this.getTotalWidth();
  }

  public setHeight(height: number): void {
    for (const flowGroup of this.groups) {
      flowGroup.rect.height = height;
    }
  }

  public setChannelData(): void {
    // данные обновляются в методе setFlowData
  }

  public setLookupData(): void {
    // все настройки внешнего вида — константы сессии
  }

  public setFlowData(records: ChannelRecord[]): void {
    if (!records) records = [];
    let maxValue = -Infinity;
    const flowDict: Record<string, CaratFlowModel[]> = {};
    const barColumnName = this.barProperty.fromColumn;

    for (const record of records) {
      const value = record[barColumnName];
      if (value !== null && value > maxValue) maxValue = value;
    }
    for (const record of records) {
      const model = this.createFlowModel(record, maxValue);
      if (!model) continue;
      const key = formatFlowDate(model.date);
      let items = flowDict[key];
      if (!items) { items = []; flowDict[key] = items; }
      items.push(model);
    }

    const flowGroups = Object.values(flowDict).filter(group => group.length);
    if (flowGroups.length === 0) {
      this.groups = [{rect: this.groups[0].rect, elements: []}];
      return;
    }
    const { top, width, height } = this.groups[0].rect;
    this.groups = [];
    this.dividingLines = [];

    for (let i = 0; i < flowGroups.length; ++i) {
      const rect: Rectangle = {top, left: i * width, width, height};
      this.groups.push({rect, elements: flowGroups[i]});
      if (i > 0) this.dividingLines.push(rect.left);
    }
    this.rect.width = this.getTotalWidth();
  }

  public render(): void {
    if (this.dividingLines.length) {
      this.drawer.drawZoneDividingLines(this.dividingLines);
    }
    for (const flowGroup of this.groups) {
      this.drawer.setCurrentColumn(flowGroup.rect, this.textStyle);
      this.drawer.drawBars(flowGroup.elements as CaratFlowModel[], this.barStyle);
      this.drawer.restore();
    }
  }
}
