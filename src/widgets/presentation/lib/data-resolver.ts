import { hasIntersection, setIntersection } from 'shared/lib';
import { fillChannel } from 'entities/channel';
import { findParameters, rowToParameterValue } from 'entities/parameter';
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
  private channels: ChannelDict;
  /** Параметры, у которых нужно инициализировать значение. */
  private parameters: Parameter[];
  /** Ассоциативный массив для установщиков параметров. */
  private setters: Map<symbol, ParameterSetter>;

  constructor(channelStorage: ChannelDict, parameterStorage: ParameterMap) {
    this.channelStorage = channelStorage;
    this.parameterStorage = parameterStorage;
    this.targets = new Set();
    this.dependencies = new Map();
  }

  public resolve(c: ChannelDict, p: Parameter[], s?: ParameterSetter[]): Promise<boolean> {
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
    for (const name in this.channels) {
      this.targets.add(name);
      const ids = this.channels[name].config.parameters;
      this.dependencies.set(name, setIntersection(targetParameters, ids));
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
    const channel = this.channels[name];
    const fillParameters = findParameters(channel.config.parameters, this.parameterStorage);
    return fillChannel(channel, fillParameters);
  }

  private resolveParameter(id: ParameterID): void {
    const parameter = this.parameterStorage.get(id);
    const channel = this.channelStorage[parameter.channelName];
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
