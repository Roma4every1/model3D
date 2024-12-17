import { RecordInfoCreator } from 'entities/channel';
import { siteChannelCriterion } from './constants';


export class SiteManager implements ActiveObjectManager<SiteModel> {
  /** Текущий активный участок. */
  public model: SiteModel | null = null;
  /** Идентификатор параметра месторождения. */
  public readonly parameterID: ParameterID | undefined;
  /** ID канала с участками. */
  public readonly channelID: ChannelID | undefined;
  /** ID канала с точками участка. */
  public readonly pointChannelID: ChannelID | undefined;
  /** Информация о структуре данных канала. */
  private readonly info: ChannelRecordInfo<keyof SiteModel> | undefined;

  constructor(channels: ChannelDict) {
    const siteChannel = Object.values(channels).find(c => c.name === 'sites');
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
    if (siteRow) this.model = this.createModel(siteRow, channels[this.pointChannelID]);
  }

  public onParameterUpdate(value: TableRowValue, channels: ChannelDict): boolean {
    const oldModel = this.model;
    const pointChannel = channels[this.pointChannelID];
    this.model = this.createModel(value, pointChannel);
    return this.model !== oldModel;
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
}
