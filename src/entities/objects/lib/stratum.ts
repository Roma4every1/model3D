import { RecordInfoCreator } from 'entities/channel';
import { stratumChannelCriterion } from './constants';


export class StratumManager implements IStratumManager {
  /** Текущее активное месторождение. */
  public model: StratumModel | null = null;
  /** Название канала с месторождениями. */
  public readonly channelID: ChannelID | undefined;
  /** Идентификатор параметра месторождения. */
  public readonly parameterID: ParameterID | undefined;
  /** Информация о структуре данных канала. */
  private readonly info: ChannelRecordInfo<keyof StratumModel> | undefined;

  constructor (parameters: Parameter[], channels: ChannelDict) {
    const parameter = parameters.find(p => p.name === 'currentPlast');
    if (!parameter || parameter.type !== 'tableRow') return;
    this.parameterID = parameter.id;

    const channelID = parameter.channelID;
    if (!channelID) return;
    this.channelID = channelID;

    const channel = channels[channelID];
    if (!channel) return;
    this.info = new RecordInfoCreator(channels).create(channel, stratumChannelCriterion);
  }

  public activated(): boolean {
    return this.parameterID !== undefined && this.channelID !== undefined;
  }

  public initializeModel(parameters: Parameter[]): void {
    const stratumParameter = parameters.find(p => p.id === this.parameterID);
    const stratumRow = stratumParameter.getValue() as ParameterValueMap['tableRow'];
    if (stratumRow) this.model = this.createModel(stratumRow);
  }

  public onParameterUpdate(value: ParameterValueMap['tableRow']): boolean {
    const oldModel = this.model;
    this.model = this.createModel(value);
    return this.model !== oldModel;
  }

  /** По значение `TableRow` параметра создаёт модель пласта. */
  private createModel(value: ParameterValueMap['tableRow']): StratumModel | null {
    if (!value || !this.info) return null;
    const id = Number(value[this.info.id.propertyName]?.value);
    if (isNaN(id)) return null;
    const name = value[this.info.name.propertyName]?.value;
    return {id, name};
  }
}
