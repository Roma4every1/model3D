import type { ClientDataDTO, ParameterSetterDTO } from 'entities/client';
import type { ParameterStore, ParameterUpdateData, ParameterGroupDTO } from 'entities/parameter';
import { XElement } from 'shared/lib';
import { ProgramFactory } from 'entities/program';
import { useChannelStore } from 'entities/channel';
import { AttachedChannelFactory, clientAPI } from 'entities/client';
import { multiMapChannelCriterion } from 'features/multi-map';
import { LayoutFactory } from './layout';
import { PresentationWindowFactory } from './window-factory';
import { ClientChannelFactory } from './channel-factory';
import { DataResolver } from './data-resolver';
import { formChannelCriteria } from './form-dict';

import {
  useParameterStore, ParameterStringTemplate, addClientParameters,
  findParameters, applyVisibilityTemplates, calcParameterVisibility,
  updateParamsDeep, parseParameterValue, createParameterGroups,
} from 'entities/parameter';


interface PresentationSettingsDTO {
  linkedProperties?: ParameterSetterDTO[];
  parameterGroups?: ParameterGroupDTO[];
  multiMapChannel?: string;
  mapLayoutManager?: boolean;
}

/** Вспомогательный класс, используемый при инициализации новой презентации. */
export class PresentationFactory {
  private readonly id: ClientID;
  private readonly parameterStore: ParameterStore;

  private dtoOwn: ClientDataDTO<PresentationSettingsDTO>;
  private dtoChildren: Record<ClientID, ClientDataDTO>;
  private parameters: Parameter[];
  private channelFactory: ClientChannelFactory;
  private createdChannels: Channel[];
  private allChannels: ChannelDict;

  /** Установщики параметров текущей презентации. */
  private setters: ParameterSetter[];
  /** Установщики глобальных параметров. */
  private externalSetters: ParameterSetter[];

  constructor(id: ClientID) {
    this.id = id;
    this.parameterStore = useParameterStore.getState();
  }

  /* --- State --- */

  /** Создаёт состояние презентации. */
  public async createState(): Promise<PresentationState> {
    await this.fetchDTO();
    if (!this.dtoOwn) return;

    this.createParameters();
    await this.createChannels();
    const channels = this.createOwnAttachedChannels();
    const settings = this.createSettings();

    const { children, activeChildren } = this.dtoOwn.children;
    this.prepareChildren(children);

    const layoutFactory = new LayoutFactory(children, activeChildren[0]);
    const layout = layoutFactory.create(this.dtoOwn.layout);
    const { openedChildren, childrenTypes, activeChildID } = layoutFactory.getChildren();

    return {
      id: this.id, type: 'grid', parent: 'root', settings,
      parameters: this.parameters.map(p => p.id), channels, layout,
      children, openedChildren, activeChildID, childrenTypes,
      neededChannels: this.getOwnNeededChannels(channels),
      loading: {status: 'init'},
    };
  }

  public async fillData(channelDict?: ChannelDict): Promise<boolean> {
    const resolver = new DataResolver();
    const channels: Channel[] = channelDict ? Object.values(channelDict) : [];
    const result = await resolver.resolve(channels, this.parameters, this.setters);

    const storage = useParameterStore.getState().storage;
    for (const parameter of this.parameters) calcParameterVisibility(parameter, storage);
    return result;
  }

  public executeExternalSetters(): Promise<true | void> {
    if (this.externalSetters.length === 0) return Promise.resolve();
    const storage = useParameterStore.getState().storage;

    const cb = async (s: ParameterSetter): Promise<ParameterUpdateData> => {
      const payload = findParameters(s.executeParameters, storage);
      const rawValue = await clientAPI.executeLinkedProperty(this.id, payload, s.index);
      const parameter = storage.get(s.setParameter);
      return {id: s.setParameter, newValue: parseParameterValue(rawValue, parameter.type)};
    };
    return Promise.all(this.externalSetters.map(cb)).then(updateParamsDeep);
  }

  public getParameters(): Parameter[] {
    return this.parameters;
  }

  private prepareChildren(children: FormDataWM[]): void {
    const resolve = (name: ParameterName): ParameterID => this.resolveParameterName(name);
    for (const child of children) {
      if (!child.displayNameString) continue;
      const template = new ParameterStringTemplate(child.displayNameString, resolve);

      if (template.parameterIDs.size) {
        child.displayNameString = template;
      } else {
        child.displayName = template.source;
        child.displayNameString = null;
      }
    }
  }

  private createParameters(): void {
    const inits = this.dtoOwn.parameters;
    this.parameters = addClientParameters(this.id, inits);
    const resolve = (name: ParameterName) => this.resolveParameterName(name);
    applyVisibilityTemplates(this.parameters, inits, resolve);
  }

  private createSettings(): PresentationSettings {
    const dto = this.dtoOwn.settings;
    const { linkedProperties: setters, parameterGroups: groups } = dto;
    if (Array.isArray(setters)) this.resolveSetters(setters);

    const settings: PresentationSettings = {};
    if (dto.mapLayoutManager || dto.multiMapChannel) settings.mapLayoutManager = true;

    const extra = XElement.tryCreate(this.dtoOwn.extra);
    if (extra) {
      const windowFactory = new PresentationWindowFactory(this.id, this.dtoOwn.children.children);
      settings.windows = windowFactory.create(extra);
    }
    if (Array.isArray(groups) && groups.length) {
      const parameterGroups = createParameterGroups(this.parameters, groups);
      if (parameterGroups) settings.parameterGroups = parameterGroups;
    }
    return settings;
  }

  private resolveSetters(data: ParameterSetterDTO[]): void {
    this.setters = [];
    this.externalSetters = [];

    for (const { parameterToSet, parametersToExecute, index } of data) {
      const setParameter = this.resolveParameterName(parameterToSet);
      if (!setParameter) continue;
      const executeParameters: Set<ParameterID> = new Set();

      for (const name of parametersToExecute) {
        const id = this.resolveParameterName(name);
        if (id) executeParameters.add(id);
      }
      const isExternal = this.parameters.every(p => p.id !== setParameter);
      const setter = {client: this.id, setParameter, executeParameters, index};
      this.parameterStore.setters.push(setter);
      (isExternal ? this.externalSetters : this.setters).push(setter);
    }
  }

  private createOwnAttachedChannels(): AttachedChannel[] {
    const settings = this.dtoOwn.settings;
    if (!settings.mapLayoutManager && !settings.multiMapChannel) return [];

    const criteria: ClientChannelCriteria = {multiMap: multiMapChannelCriterion};
    const factory = new AttachedChannelFactory(this.allChannels, criteria);

    const resolve = (name: ChannelName) => this.channelFactory.resolveChannelName(name);
    const channels = factory.create(this.dtoOwn.channels, resolve);

    if (!channels.some(c => c.type === 'multiMap')) {
      delete settings.multiMapChannel;
      delete settings.mapLayoutManager;
    }
    return channels;
  }

  /* --- Children --- */

  /** Создаёт состояние форм презентации. */
  public createChildren(): ClientStates {
    const childStates: ClientStates = {};
    for (const { id, type } of this.dtoOwn.children.children) {
      const dto = this.dtoChildren[id];
      childStates[id] = this.createChild(id, type, dto);
    }
    return childStates;
  }

  private createChild(id: ClientID, type: ClientType, dto: ClientDataDTO): SessionClient {
    const client: SessionClient = {id, type, parent: this.id, channels: [], parameters: []};
    if (dto) {
      const factory = new AttachedChannelFactory(this.allChannels, formChannelCriteria[type]);
      const resolve = (name: ChannelName) => this.channelFactory.resolveChannelName(name);
      client.channels = factory.create(dto.channels, resolve);
      client.neededChannels = this.getChildNeededChannels(client.channels);
      client.settings = dto.settings;
      client.extra = XElement.tryCreate(dto.extra);
      client.loading = {status: 'init'};
    } else {
      client.neededChannels = [];
      client.loading = {status: 'error'};
    }
    return client;
  }

  /** Необходимы ID прикреплённых каналов и их справочники. */
  private getChildNeededChannels(attached: AttachedChannel[]): ChannelID[] {
    const result = new Set<ChannelID>();
    for (const { id } of attached) {
      for (const property of this.allChannels[id].config.properties) {
        for (const lookup of property.lookupChannels) result.add(lookup);
      }
      result.add(id);
    }
    return [...result];
  }

  /* --- Reports --- */

  /** Создаёт список программ презентации. */
  public createPrograms(): Promise<Program[]> {
    const resolve = (name: ParameterName): ParameterID => this.resolveParameterName(name);
    const factory = new ProgramFactory(this.id, this.parameterStore.storage, resolve);
    return factory.create();
  }

  /* --- Channels --- */

  /** Возвращает каналы, которые были созданы для презентации. */
  public getCreatedChannels(): Channel[] {
    return this.createdChannels;
  }

  /** Создаёт все необходимые каналы для презентации. */
  private async createChannels(): Promise<void> {
    const attachments: Set<ChannelName> = new Set();
    for (const attachment of this.dtoOwn.channels) attachments.add(attachment.name);

    for (const childID in this.dtoChildren) {
      for (const attachment of this.dtoChildren[childID].channels) attachments.add(attachment.name);
    }
    this.channelFactory = new ClientChannelFactory(n => this.resolveParameterName(n));
    this.createdChannels = await this.channelFactory.create(this.parameters, attachments);

    this.allChannels = {...useChannelStore.getState().storage};
    for (const channel of this.createdChannels) this.allChannels[channel.id] = channel;
  }

  private getOwnNeededChannels(attached: AttachedChannel[]): ChannelID[] {
    const result = new Set<ChannelID>();
    for (const { channelID } of this.parameters) {
      if (channelID) result.add(channelID);
    }
    for (const { id } of attached) {
      result.add(id);
    }
    return [...result];
  }

  /* --- Utils --- */

  private async fetchDTO(): Promise<void> {
    const { ok, data: dtoOwn } = await clientAPI.getClientData(this.id, 'grid');
    if (!ok) return;

    this.dtoOwn = dtoOwn;
    this.dtoChildren = {};

    const fetchChild = async ({id, type}: FormDataWM): Promise<void> => {
      const { ok, data: dtoChild } = await clientAPI.getClientData(id, type);
      if (ok) this.dtoChildren[id] = dtoChild;
    };
    await Promise.all(dtoOwn.children.children.map(fetchChild));
  }

  private resolveParameterName(name: ParameterName): ParameterID {
    const parameters = this.parameterStore.clients;
    const cb = (p: Parameter): boolean => p.name === name;
    const parameter = parameters[this.id].find(cb) ?? parameters.root.find(cb);
    return parameter?.id;
  }
}
