import type { ChannelStore } from 'entities/channel';
import { addToSet } from 'shared/lib';
import { getParameterChannelNames } from 'entities/parameter';
import { useChannelStore, createChannel } from 'entities/channel';


/** Фабрика каналов клиента сессии. */
export class ClientChannelFactory {
  /** Хранилище каналов. */
  private readonly store: ChannelStore;
  /** Функция, которая находит ID параметра. */
  private readonly pResolve: PNameResolve;

  private existing: Set<ChannelName>;
  private needed: Set<ChannelName>;
  private created: Channel[];
  private resolved: Record<ChannelName, ChannelID>;

  constructor(pResolve: PNameResolve) {
    this.store = useChannelStore.getState();
    this.pResolve = pResolve;
  }

  public async create(parameters: Parameter[], attached?: Set<ChannelName>): Promise<Channel[]> {
    this.existing = new Set(Object.keys(this.store.sharing));
    this.needed = new Set();
    this.created = [];

    await this.handleParameters(parameters);
    await this.handleAttached(attached);
    await this.handleDetails();
    await this.handleLookups();

    this.resolved = {};
    for (const name of this.needed) this.resolveChannelName(name);

    for (const p of parameters) {
      if (p.channelName) p.channelID = this.resolveChannelName(p.channelName);
    }
    return this.created;
  }

  public getAllNeededChannels(): ChannelID[] {
    const result: ChannelID[] = [];
    for (const name of this.needed) result.push(this.resolved[name]);
    return result;
  }

  /* --- --- */

  private async handleParameters(parameters: Parameter[]): Promise<void> {
    const names = getParameterChannelNames(parameters);
    const createdChannels = await this.addChannels(names);

    for (const channel of createdChannels) {
      // наполнение канала для параметра должно зависеть от серверной конфигурации,
      // клиент не должен переопределять ограничение записей
      channel.query.limit = null;
    }
  }

  private async handleAttached(attached: Set<ChannelName>): Promise<void> {
    if (!attached || attached.size === 0) return;
    await this.addChannels(attached);
  }

  private async handleDetails(): Promise<void> {
    const names: Set<ChannelName> = new Set();
    for (const channel of this.created) {
      const properties = channel.config.properties;
      if (!properties) continue;

      for (const property of properties) {
        const detailChannel = property.detailChannelName;
        if (detailChannel) names.add(detailChannel);
      }
    }
    await this.addChannels(names);
  }

  private async handleLookups(): Promise<void> {
    const allNames: Set<ChannelName> = new Set();
    for (const channel of this.created) {
      for (const property of channel.config.properties) {
        const lookups = property.lookupChannelNames;
        if (lookups && lookups.length) addToSet(allNames, lookups);
      }
    }
    await this.addChannels(allNames);
  }

  /** @return созданные каналы */
  private async addChannels(names: Set<ChannelName>): Promise<Channel[]> {
    const actions: Promise<Channel>[] = [];
    for (const name of names) {
      if (!this.existing.has(name)) {
        const id = this.store.idGenerator.get();
        actions.push(createChannel(id, name));
      }
      this.needed.add(name);
    }

    if (actions.length === 0) return [];
    const channels = (await Promise.all(actions)).filter(Boolean);

    for (const channel of channels) {
      this.created.push(channel);
      this.existing.add(channel.name);
    }
    return channels;
  }

  /* --- --- */

  public resolveChannelName(name: ChannelName): ChannelID {
    let id = this.resolved[name];
    if (id !== undefined) return id;

    if (this.store.sharing[name]) {
      id = this.resolveExistingChannel(name);
    } else {
      id = this.resolveNewChannel(name);
    }
    if (id !== undefined) this.resolved[name] = id;
    return id;
  }

  private resolveNewChannel(name: ChannelName): ChannelID {
    const channel = this.created.find(c => c.name === name);
    if (!channel) return undefined; // канал, который не требуется клиенту
    this.fillChannelConfig(channel.config);
    return channel.id;
  }

  private resolveExistingChannel(name: ChannelName): ChannelID {
    const share = this.store.sharing[name];
    const storage = this.store.storage;

    const firstChannel: Channel = storage[share.values().next().value];
    const config = this.cloneChannelConfig(firstChannel.config);

    const id = this.store.idGenerator.get();
    this.created.push({id, name, config, query: {}, data: null, actual: false});
    return id;
  }

  private cloneChannelConfig(config: ChannelConfig): ChannelConfig {
    const clone: ChannelConfig = {
      displayName: config.displayName,
      properties: structuredClone(config.properties),
      lookupColumns: structuredClone(config.lookupColumns),
      parameterNames: config.parameterNames,
      activeRowParameterName: config.activeRowParameterName,
    };
    this.fillChannelConfig(clone);
    return clone;
  }

  private fillChannelConfig(config: ChannelConfig): void {
    for (const property of config.properties) {
      const { lookupChannelNames, detailChannelName } = property;
      property.lookupChannels = lookupChannelNames.map(name => this.resolveChannelName(name));
      if (detailChannelName) property.detailChannel = this.resolveChannelName(detailChannelName);
    }
    const activeName = config.activeRowParameterName;
    config.activeRowParameter = activeName ? this.pResolve(activeName) : undefined;
    config.parameters = config.parameterNames.map(this.pResolve).filter(Boolean);
  }
}
