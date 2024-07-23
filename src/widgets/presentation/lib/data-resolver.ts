import { hasIntersection, setIntersection } from 'shared/lib';
import { useChannelStore, fillChannel } from 'entities/channel';
import { useParameterStore, findParameters, rowToParameterValue } from 'entities/parameter';
import { clientAPI } from 'entities/client';


/** Искусственный ID установщика параметра. */
type SetterID = symbol;
/** Дескриптор данных для наполнения. */
type Target = ChannelName | ParameterID | SetterID;


/**
 * Класс, который наполняет набор взаимозависимых данных.
 * @example
 * const resolver = new DataResolver(cStorage, pStorage);
 * await resolver.resolve(channels, parameters, setters);
 */
export class DataResolver {
  /** Хранилище всех доступных каналов. */
  private readonly channelStorage: ChannelDict;
  /** Хранилище всех доступных параметров. */
  private readonly parameterStorage: ParameterMap;
  /** Незавершённые цели. */
  private readonly targets: Set<Target>;
  /** Зависимости между целями. */
  private readonly dependencies: Map<Target, Set<Target>>;

  /** Каналы, которые нужно наполнить. */
  private channels: Channel[];
  /** Параметры, у которых нужно инициализировать значение. */
  private parameters: Parameter[];
  /** Ассоциативный массив для установщиков параметров. */
  private setters: Map<symbol, ParameterSetter>;

  constructor() {
    this.channelStorage = useChannelStore.getState().storage;
    this.parameterStorage = useParameterStore.getState().storage;
    this.targets = new Set();
    this.dependencies = new Map();
  }

  public resolve(c: Channel[], p: Parameter[], s?: ParameterSetter[]): Promise<boolean> {
    this.parameters = p;
    this.channels = c;
    this.setters = new Map();
    s?.forEach(setter => this.setters.set(Symbol(), setter));
    this.findDependencies();
    return this.resolveTargets();
  }

  private findDependencies(): void {
    const targetParameters = new Set<ParameterID>();
    for (const parameter of this.parameters) {
      const value = parameter.getValue();
      const { id, type, nullable, channelName } = parameter;

      if (value === null && !nullable && channelName && type === 'tableRow') {
        targetParameters.add(id);
        this.targets.add(id);
        this.dependencies.set(id, new Set([channelName]));
      }
    }
    for (const [id, setter] of this.setters) {
      targetParameters.add(setter.setParameter);
      this.targets.add(id);
      this.dependencies.set(id, setIntersection(targetParameters, setter.executeParameters));
    }
    for (const channel of this.channels) {
      this.targets.add(channel.name);
      const parameters = channel.config.parameters;
      this.dependencies.set(channel.name, setIntersection(targetParameters, parameters));
    }
  }

  private async resolveTargets(): Promise<boolean> {
    while (true) {
      const sizeBefore = this.targets.size;
      await this.resolveStep();
      const sizeAfter = this.targets.size;

      if (sizeAfter === 0) return true;
      if (sizeBefore === sizeAfter) return false;
    }
  }

  private async resolveStep(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const target of this.targets) {
      const deps = this.dependencies.get(target);
      if (hasIntersection(deps, this.targets)) continue;

      switch (typeof target) {
        case 'string': { promises.push(this.resolveChannel(target)); break; }
        case 'symbol': { promises.push(this.resolveSetter(target)); break; }
        default: { this.resolveParameter(target); }
      }
      this.targets.delete(target);
    }
    await Promise.all(promises);
  }

  private resolveChannel(name: ChannelName): Promise<void> {
    const channel = this.channels.find(c => c.name === name);
    const fillParameters = findParameters(channel.config.parameters, this.parameterStorage);
    return fillChannel(channel, fillParameters);
  }

  private resolveParameter(id: ParameterID): void {
    const parameter = this.parameterStorage.get(id);
    const channel = this.channelStorage[parameter.channelID];
    const row = channel.data?.rows?.at(0);
    if (row) parameter.setValue(rowToParameterValue(row, channel));
  }

  private async resolveSetter(id: SetterID): Promise<void> {
    const { client, setParameter, executeParameters, index } = this.setters.get(id);
    const executeValues = findParameters(executeParameters, this.parameterStorage);
    const valueString = await clientAPI.executeLinkedProperty(client, executeValues, index);
    const parameter = this.parameterStorage.get(setParameter);
    parameter.setValueString(valueString);
  }
}
