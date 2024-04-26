import type { ParameterUpdateEntries } from 'entities/parameter';
import { RecordInfoCreator } from 'entities/channel';
import { placeChannelCriterion } from './constants';


export class PlaceManager implements IPlaceManager {
  /** Текущее активное месторождение. */
  public model: PlaceModel | null = null;
  /** Название канала с месторождениями. */
  public readonly channelName: ChannelName | undefined;
  /** Идентификатор параметра месторождения. */
  public readonly parameterID: ParameterID | undefined;
  /** Информация о структуре данных канала. */
  private readonly info: ChannelRecordInfo<keyof PlaceModel> | undefined;

  constructor (parameters: Parameter[], channels: ChannelDict) {
    const parameter = parameters.find(p => p.id === 'currentMest');
    if (!parameter || parameter.type !== 'tableRow') return;
    this.parameterID = parameter.id;

    const channelName = parameter.channelName;
    if (!channelName) return;
    this.channelName = channelName;

    const channel = channels[channelName];
    if (!channel) return;
    this.info = new RecordInfoCreator(channels).create(channel, placeChannelCriterion);
  }

  public activated(): boolean {
    return this.parameterID !== undefined && this.channelName !== undefined;
  }

  public initializeModel(parameters: Parameter[]): void {
    const parameter = parameters.find(p => p.id === this.parameterID);
    const placeRow = parameter.getValue() as ParameterValueMap['tableRow'];
    if (placeRow) this.model = this.createModel(placeRow);
  }

  public onParameterUpdate(entries: ParameterUpdateEntries): boolean {
    const entry = entries.find(e => e.id === this.parameterID);
    if (!entry) return false;
    const oldModel = this.model;
    this.model = this.createModel(entry.value);
    return this.model === oldModel;
  }

  /** По значение `TableRow` параметра создаёт модель месторождения. */
  private createModel(value: ParameterValueMap['tableRow']): PlaceModel | null {
    if (!value || !this.info) return null;
    const id = Number(value[this.info.id.columnName]?.value);
    if (isNaN(id)) return null;
    const name = value[this.info.name.columnName]?.value;
    return {id, name};
  }
}
