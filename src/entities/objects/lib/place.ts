import { RecordInfoCreator } from 'entities/channel';
import { placeChannelCriterion } from './constants';


export class PlaceManager implements IPlaceManager {
  /** Текущее активное месторождение. */
  public model: PlaceModel | null = null;
  /** Название канала с месторождениями. */
  public readonly channelID: ChannelID | undefined;
  /** Идентификатор параметра месторождения. */
  public readonly parameterID: ParameterID | undefined;
  /** Информация о структуре данных канала. */
  private readonly info: ChannelRecordInfo<keyof PlaceModel> | undefined;

  constructor (parameters: Parameter[], channels: ChannelDict) {
    const parameter = parameters.find(p => p.name === 'currentPlace' || p.name === 'currentMest');
    if (!parameter || parameter.type !== 'tableRow') return;
    this.parameterID = parameter.id;

    const channelID = parameter.channelID;
    if (!channelID) return;
    this.channelID = channelID;

    const channel = channels[channelID];
    if (!channel) return;
    this.info = new RecordInfoCreator(channels).create(channel, placeChannelCriterion);
  }

  public activated(): boolean {
    return this.parameterID !== undefined && this.channelID !== undefined;
  }

  public initializeModel(parameters: Parameter[]): void {
    const parameter = parameters.find(p => p.id === this.parameterID);
    const placeRow = parameter.getValue() as ParameterValueMap['tableRow'];
    if (placeRow) this.model = this.createModel(placeRow);
  }

  public onParameterUpdate(value: ParameterValueMap['tableRow']): boolean {
    const oldModel = this.model;
    this.model = this.createModel(value);
    return this.model !== oldModel;
  }

  /** По значение `TableRow` параметра создаёт модель месторождения. */
  private createModel(value: ParameterValueMap['tableRow']): PlaceModel | null {
    if (!value || !this.info) return null;
    const id = Number(value[this.info.id.propertyName]?.value);
    if (Number.isNaN(id)) return null;
    const name = value[this.info.name.propertyName]?.value;
    const code = value[this.info.code?.propertyName]?.value;
    return {id, name, code};
  }
}
