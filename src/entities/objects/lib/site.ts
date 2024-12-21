import { RecordInfoCreator } from 'entities/channel';
import { siteChannelCriterion } from './constants';


export class SiteManager implements ActiveObjectManager {
  /** Состояние модели. */
  public state: SiteState;
  /** Идентификатор параметра участка. */
  public readonly parameterID: ParameterID | undefined;
  /** ID канала с участками. */
  public readonly channelID: ChannelID | undefined;
  /** ID канала с точками участка. */
  public readonly pointChannelID: ChannelID | undefined;
  /** Информация о структуре данных канала. */
  public readonly info: ChannelRecordInfo<keyof SiteModel> | undefined;

  constructor(channelName: ChannelName, channels: ChannelDict) {
    this.state = {model: null, initModel: null, editMode: null};
    if (!channelName) return;
    const siteChannel = Object.values(channels).find(c => c.name === channelName);
    if (!siteChannel) return;
    this.channelID = siteChannel.id;

    this.parameterID = siteChannel.config.activeRowParameter;
    if (this.parameterID === undefined) return;

    this.info = new RecordInfoCreator(channels).create(siteChannel, siteChannelCriterion);
    if (this.info) this.pointChannelID = this.info.points.details.id;
  }

  public activated(): boolean {
    return this.info !== undefined;
  }

  public initializeModel(parameters: Parameter[], channels: ChannelDict): void {
    const parameter = parameters.find(p => p.id === this.parameterID);
    const siteRow = parameter.getValue() as TableRowValue;
    if (siteRow) this.state.model = this.createModel(siteRow, channels[this.pointChannelID]);
  }

  public onParameterUpdate(value: TableRowValue, channels: ChannelDict): boolean {
    const oldModel = this.state.model;
    this.state.model = this.createModel(value, channels[this.pointChannelID]);
    return this.state.model !== oldModel;
  }

  private createModel(value: TableRowValue, pointChannel: Channel): SiteModel | null {
    if (!value || !this.info) return null;
    const id = value[this.info.id.propertyName]?.value;
    const name = value[this.info.name.propertyName]?.value;

    const points: Point[] = [];
    const pointData = pointChannel.data;
    if (!pointData || pointData.rows.length === 0) return {id, name, points};

    const pointInfo = this.info.points.details.info;
    const xIndex = pointData.columns.findIndex(c => c.name === pointInfo.x.columnName);
    const yIndex = pointData.columns.findIndex(c => c.name === pointInfo.y.columnName);

    for (const row of pointData.rows) {
      points.push({x: row[xIndex], y: row[yIndex]});
    }
    return {id, name, points};
  }

  public applyModelToChannelRow(channel: Channel, row: ChannelRow): void {
    const nameColumn = this.info.name.columnName;
    const nameIndex = channel.data.columns.findIndex(c => c.name === nameColumn);
    row[nameIndex] = this.state.model.name;
  }

  public getPointRows(template: ChannelRow, columns: ChannelColumn[]): ChannelRow[] {
    const info = this.info.points.details.info;
    const findIndex = (name: ColumnName) => columns.findIndex(c => c.name === name);

    const xIndex = findIndex(info.x.columnName);
    const yIndex = findIndex(info.y.columnName);
    const orderIndex = findIndex(info.order.columnName);

    return this.state.model.points.map((point, i): ChannelRow => {
      const cells = [...template];
      cells[xIndex] = point.x;
      cells[yIndex] = point.y;
      cells[orderIndex] = i;
      return cells;
    });
  }

  public pointChanged(): boolean {
    const oldPoints = this.state.model.points;
    const newPoints = this.state.initModel?.points ?? [];
    if (oldPoints.length !== newPoints.length) return true;

    for (let i = 0; i < oldPoints.length; ++i) {
      const oldPoint = oldPoints[i], newPoint = newPoints[i];
      if (oldPoint.x !== newPoint.x || oldPoint.y !== newPoint.y) return true;
    }
    return false;
  }
}
