import { RecordInfoCreator } from 'entities/channel';
import { selectionChannelCriterion } from './constants';


export class SelectionManager implements ActiveObjectManager {
  /** Состояние модели. */
  public state: SelectionState;
  /** Идентификатор параметра выборки. */
  public readonly parameterID: ParameterID | undefined;
  /** ID канала с выборками. */
  public readonly channelID: ChannelID | undefined;
  /** ID канала с элементами выборок. */
  public readonly itemChannelID: ChannelID | undefined;
  /** Информация о структуре данных канала. */
  public readonly info: ChannelRecordInfo<keyof SelectionModel> | undefined;

  constructor(channelName: ChannelName, channels: ChannelDict) {
    this.state = {model: null, initModel: null, editing: false};
    if (!channelName) return;
    const channel = Object.values(channels).find(c => c.name === channelName);
    if (!channel) return;
    this.channelID = channel.id;

    this.parameterID = channel.config.activeRowParameter;
    if (this.parameterID === undefined) return;

    this.info = new RecordInfoCreator(channels).create(channel, selectionChannelCriterion);
    if (!this.info) return;
    this.itemChannelID = this.info.items.details.id;

    const wellInfo = this.info.items.details.info.id.lookups.name.info;
    if (!wellInfo.place) wellInfo.place = {propertyName: 'MEST', columnName: 'MEST'};
  }

  public activated(): boolean {
    return this.info !== undefined;
  }

  public initializeModel(parameters: Parameter[], channels: ChannelDict): void {
    const parameter = parameters.find(p => p.id === this.parameterID);
    const row = parameter.getValue() as TableRowValue;
    if (row) this.state.model = this.createModel(row, channels[this.itemChannelID]);
  }

  public onParameterUpdate(value: TableRowValue, channels: ChannelDict): boolean {
    const oldModel = this.state.model;
    this.state.model = this.createModel(value, channels[this.itemChannelID]);
    return this.state.model !== oldModel;
  }

  private createModel(value: TableRowValue, itemChannel: Channel): SelectionModel | null {
    if (!value || !this.info) return null;
    const id = value[this.info.id.propertyName]?.value;
    const name = value[this.info.name.propertyName]?.value;

    const items: SelectionItem[] = [];
    const itemData = itemChannel.data;
    if (!itemData || itemData.rows.length === 0) return {id, name, items};

    const itemInfo = this.info.items.details.info;
    const idIndex = itemData.columns.findIndex(c => c.name === itemInfo.id.columnName);
    const nameIndex = itemData.columns.findIndex(c => c.name === itemInfo.name.columnName);
    const placeIndex = itemData.columns.findIndex(c => c.name === itemInfo.place.columnName);

    for (const row of itemData.rows) {
      items.push({id: row[idIndex], name: row[nameIndex], place: row[placeIndex]});
    }
    return {id, name, items};
  }

  public applyModelToChannelRow(channel: Channel, row: ChannelRow): void {
    const nameColumn = this.info.name.columnName;
    const nameIndex = channel.data.columns.findIndex(c => c.name === nameColumn);
    row[nameIndex] = this.state.model.name;
  }

  public getItemRows(template: ChannelRow, columns: ChannelColumn[]): ChannelRow[] {
    const info = this.info.items.details.info;
    const findIndex = (name: ColumnName) => columns.findIndex(c => c.name === name);

    const idIndex = findIndex(info.id.columnName);
    const nameIndex = findIndex(info.name.columnName);
    const placeIndex = findIndex(info.place.columnName);

    return this.state.model.items.map((item: SelectionItem): ChannelRow => {
      const cells = [...template];
      cells[idIndex] = item.id;
      cells[nameIndex] = item.name;
      cells[placeIndex] = item.place;
      return cells;
    });
  }
}
