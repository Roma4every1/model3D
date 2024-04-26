import type { ParameterUpdateEntries } from 'entities/parameter';
import { RecordInfoCreator } from 'entities/channel';
import { wellChannelCriterion } from './constants';


/** Состояние активной скважины. */
export class WellManager implements IWellManager {
  /** Текущая активная скважина. */
  public model: WellModel | null = null;
  /** Название канала со скважинами. */
  public readonly channelName: ChannelName | undefined;
  /** Идентификатор параметра скважины. */
  public readonly parameterID: ParameterID | undefined;
  /** Информация о структуре данных канала. */
  private readonly info: ChannelRecordInfo<keyof WellModel> | undefined;

  constructor (parameters: Parameter[], channels: ChannelDict) {
    const parameter = parameters.find(p => p.id === 'wellCurrent' || p.id === 'currentWell');
    if (!parameter || parameter.type !== 'tableRow') return;
    this.parameterID = parameter.id;

    const channelName = parameter.channelName;
    if (!channelName) return;
    this.channelName = channelName;

    const channel = channels[channelName];
    if (!channel) return;
    this.info = new RecordInfoCreator(channels).create(channel, wellChannelCriterion);
  }

  public activated(): boolean {
    return this.parameterID !== undefined && this.channelName !== undefined;
  }

  public initializeModel(parameters: Parameter[]): void {
    const wellParameter = parameters.find(p => p.id === this.parameterID);
    const wellRow = wellParameter.getValue() as ParameterValueMap['tableRow'];
    if (wellRow) this.model = this.createModel(wellRow);
  }

  public onParameterUpdate(entries: ParameterUpdateEntries): boolean {
    const entry = entries.find(e => e.id === this.parameterID);
    if (!entry) return false;
    const oldModel = this.model;
    this.model = this.createModel(entry.value);
    return this.model === oldModel;
  }

  /** По значение `TableRow` параметра создаёт модель скважины. */
  private createModel(value: ParameterValueMap['tableRow']): WellModel | null {
    if (!value || !this.info) return null;
    const id = Number(value[this.info.id.columnName]?.value);
    if (isNaN(id)) return null;
    const name = value[this.info.name.columnName]?.value;
    return {id, name};
  }
}
