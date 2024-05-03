import type { ParameterUpdateEntries } from 'entities/parameter';
import { RecordInfoCreator } from 'entities/channel';
import { stratumChannelCriterion } from './constants';


export class StratumManager implements IStratumManager {
  /** Текущее активное месторождение. */
  public model: StratumModel | null = null;
  /** Название канала с месторождениями. */
  public readonly channelName: ChannelName | undefined;
  /** Идентификатор параметра месторождения. */
  public readonly parameterID: ParameterID | undefined;
  /** Информация о структуре данных канала. */
  private readonly info: ChannelRecordInfo<keyof StratumModel> | undefined;

  constructor (parameters: Parameter[], channels: ChannelDict) {
    const parameter = parameters.find(p => p.id === 'currentPlast');
    if (!parameter || parameter.type !== 'tableRow') return;
    this.parameterID = parameter.id;

    const channelName = parameter.channelName;
    if (!channelName) return;
    this.channelName = channelName;

    const channel = channels[channelName];
    if (!channel) return;
    this.info = new RecordInfoCreator(channels).create(channel, stratumChannelCriterion);
  }

  public activated(): boolean {
    return this.parameterID !== undefined && this.channelName !== undefined;
  }

  public initializeModel(parameters: Parameter[]): void {
    const stratumParameter = parameters.find(p => p.id === this.parameterID);
    const stratumRow = stratumParameter.getValue() as ParameterValueMap['tableRow'];
    if (stratumRow) this.model = this.createModel(stratumRow);
  }

  public onParameterUpdate(entries: ParameterUpdateEntries): boolean {
    const entry = entries.find(e => e.id === this.parameterID);
    if (!entry) return false;
    const oldModel = this.model;
    this.model = this.createModel(entry.value);
    return this.model !== oldModel;
  }

  /** По значение `TableRow` параметра создаёт модель пласта. */
  private createModel(value: ParameterValueMap['tableRow']): StratumModel | null {
    if (!value || !this.info) return null;
    const id = Number(value[this.info.id.columnName]?.value);
    if (isNaN(id)) return null;
    const name = value[this.info.name.columnName]?.value;
    return {id, name};
  }
}
