import { cellsToRecords, RecordInfoCreator } from 'entities/channel';
import { traceChannelCriterion } from './constants';


export class TraceManager implements ITraceManager {
  /** Текущая активная трасса. */
  public model: TraceModel | null = null;
  /** Модель трассы до внесения изменений. */
  public oldModel: TraceModel | null = null;
  /** Создаётся ли трасса. */
  public creating: boolean;
  /** Является ли активная трасса редактируемой. */
  public editing: boolean;

  /** Название канала с трассами. */
  public readonly channelID: ChannelID | undefined;
  /** Название канала с узлами трасс. */
  public readonly nodeChannelID: ChannelID | undefined;
  /** Идентификатор параметра с трассами. */
  public readonly parameterID: ParameterID | undefined;

  private readonly wellChannelID: ChannelID;
  private readonly info: ChannelRecordInfo<keyof TraceModel>;

  constructor(channels: ChannelDict, wellChannelID: ChannelID) {
    const traceChannel = Object.values(channels).find(c => c.name === 'traces');
    if (!traceChannel) return;
    this.channelID = traceChannel.id;
    this.wellChannelID = wellChannelID;

    this.parameterID = traceChannel.config.activeRowParameter;
    if (!this.parameterID) return;

    this.info = new RecordInfoCreator(channels).create(traceChannel, traceChannelCriterion);
    if (!this.info) return;

    const nodeDetails = this.info.nodes.details.info;
    if (!nodeDetails.traceID) {
      const columnName = 'WELLS_LIST_ID';
      nodeDetails.traceID = {propertyName: columnName, columnName};
    }

    const nodePropertyName = this.info.nodes.propertyName;
    const nodeProperty = traceChannel.config.properties.find(p => p.name === nodePropertyName);
    this.nodeChannelID = channels[nodeProperty.detailChannel].id;
  }

  public clone(): TraceManager {
    const clone = {...this};
    Object.setPrototypeOf(clone, TraceManager.prototype);
    return clone;
  }

  public activated(): boolean {
    return this.info !== undefined;
  }

  public initializeModel(parameters: Parameter[], channels: ChannelDict): void {
    const wellChannel = channels[this.wellChannelID];
    const nodeChannel = channels[this.nodeChannelID];
    const traceParameter = parameters.find(p => p.id === this.parameterID);
    const traceRow = traceParameter.getValue() as ParameterValueMap['tableRow'];
    if (traceRow) this.model = this.createModel(traceRow, nodeChannel, wellChannel);
  }

  public onParameterUpdate(value: ParameterValueMap['tableRow'], channels: ChannelDict): boolean {
    const oldModel = this.model;
    const wellChannel = channels[this.wellChannelID];
    const nodeChannel = channels[this.nodeChannelID];
    this.model = this.createModel(value, nodeChannel, wellChannel);
    return this.model !== oldModel;
  }

  private createModel(value: ParameterValueMap['tableRow'], nodeChannel: Channel, wellChannel: Channel): TraceModel {
    if (!value || !this.info) return null;
    const traceID = value[this.info.id.propertyName]?.value;
    const nodes: TraceNode[] = [];

    const nodeRecords = cellsToRecords(nodeChannel.data);
    const wellRows = wellChannel.data?.rows;

    const wellIDIndex = wellChannel.config.lookupColumns.id.columnIndex;
    const wellNameIndex = wellChannel.config.lookupColumns.value.columnIndex;

    const nodeInfo: ChannelRecordInfo<TraceNodeChannelFields> = this.info.nodes.details.info;
    const traceIDColumn = nodeInfo.traceID.columnName;
    const idColumn = nodeInfo.id.columnName;
    const xColumn = nodeInfo.x.columnName;
    const yColumn = nodeInfo.y.columnName;

    for (const record of nodeRecords) {
      if (record[traceIDColumn] !== traceID) continue;
      const nodeID = Number(record[idColumn]);
      const wellRow = wellRows?.find(row => row[wellIDIndex] === nodeID);
      const name = wellRow ? wellRow[wellNameIndex] : null;
      nodes.push({id: nodeID, name: name, x: record[xColumn], y: record[yColumn]});
    }
    const name = value[traceChannelCriterion.properties.name.name as string]?.value;
    return {id: traceID, name, nodes};
  }

  public applyModelToChannelRow(traceChannel: Channel, row: ChannelRow): void {
    const nameColumn = this.info.name.columnName;
    const nameIndex = traceChannel.data.columns.findIndex(c => c.name === nameColumn);
    if (nameIndex !== -1) row[nameIndex] = this.model.name;
  }

  /** Преобразует узлы трассы в массив записей канала. */
  public getNodeChannelRows(columns: ChannelColumn[]): ChannelRow[] {
    const info: ChannelRecordInfo<TraceNodeChannelFields> = this.info.nodes.details.info;
    const findIndex = (name: ColumnName) => columns.findIndex(c => c.name === name);

    const traceIndex = findIndex(info.traceID.columnName);
    const idIndex = findIndex(info.id.columnName);
    const xIndex = findIndex(info.x.columnName);
    const yIndex = findIndex(info.y.columnName);
    const orderIndex = findIndex(info.order.columnName);

    return this.model.nodes.map((node, i): ChannelRow => {
      const cells = new Array(columns.length).fill(null);
      cells[traceIndex] = this.model.id;
      cells[idIndex] = node.id;
      cells[xIndex] = node.x;
      cells[yIndex] = node.y;
      cells[orderIndex] = i;
      return cells;
    });
  }

  public nodesChanged(): boolean {
    const oldNodes = this.oldModel?.nodes ?? [];
    const newNodes = this.model.nodes;
    if (oldNodes.length !== newNodes.length) return true;

    for (let i = 0; i < oldNodes.length; i++) {
      const oldNode = oldNodes[i];
      const newNode = newNodes[i];
      if (oldNode.id !== newNode.id) return true;
      if (oldNode.x !== newNode.x || oldNode.y !== newNode.y) return true;
    }
    return false;
  }
}
