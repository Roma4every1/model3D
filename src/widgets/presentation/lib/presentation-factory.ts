import type { ClientDataDTO } from 'entities/client';
import type { ProgramDTO } from 'entities/program';
import type { ParameterStore } from 'entities/parameter';
import { Model } from 'flexlayout-react';
import { programAPI, programCompareFn } from 'entities/program';
import { useChannelStore } from 'entities/channel';
import { AttachedChannelFactory, clientAPI, getChildrenTypes } from 'entities/client';
import { multiMapChannelCriterion } from 'features/multi-map';
import { LayoutFactory } from './layout';
import { ClientChannelFactory } from './channel-factory';
import { DataResolver } from './data-resolver';
import { formChannelCriteria } from './form-dict';

import {
  useParameterStore, ParameterStringTemplate,
  addClientParameters, findParameters,
} from 'entities/parameter';


type PresentationSettingsDTO = Omit<PresentationSettings, 'linkedProperties'> & {
  linkedProperties: ParameterSetterDTO[];
}
interface ParameterSetterDTO {
  parameterToSet: string;
  parametersToExecute: string[];
  index: number;
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
  private neededChannels: ChannelID[];
  private setters: ParameterSetter[];

  constructor(id: ClientID) {
    this.id = id;
    this.parameterStore = useParameterStore.getState();
  }

  /* --- State --- */

  /** Создаёт состояние презентации. */
  public async createState(): Promise<PresentationState> {
    await this.fetchDTO();
    if (!this.dtoOwn) return;

    this.parameters = addClientParameters(this.id, this.dtoOwn.parameters);
    await this.createChannels();
    const settings = this.createSettings();

    const { children, activeChildren, openedChildren } = this.dtoOwn.children;
    this.prepareChildren(children);

    return {
      id: this.id, type: 'grid', parent: 'root', settings,
      parameters: this.parameters.map(p => p.id),
      channels: this.createOwnAttachedChannels(),
      layout: this.createLayout(),
      children: children,
      activeChildID: activeChildren[0],
      openedChildren: openedChildren,
      childrenTypes: getChildrenTypes(children, openedChildren),
      neededChannels: this.neededChannels,
      loading: {status: 'init'},
    };
  }

  public fillData(): Promise<boolean> {
    const resolver = new DataResolver();
    return resolver.resolve(this.createdChannels, this.parameters, this.setters);
  }

  public getParameters(): Parameter[] {
    return this.parameters;
  }

  private prepareChildren(children: FormDataWM[]): void {
    const resolve = (name: ParameterName) => this.resolveParameterName(name);
    for (const child of children) {
      const pattern: string = child.displayNameString;
      if (pattern) child.displayNameString = new ParameterStringTemplate(pattern, resolve);
    }
  }

  private createLayout(): Model {
    const { children, activeChildren } = this.dtoOwn.children;
    const layoutFactory = new LayoutFactory(children, activeChildren[0]);
    return layoutFactory.create(this.dtoOwn.layout);
  }

  private createSettings(): PresentationSettings {
    const { multiMapChannel, parameterGroups, linkedProperties } = this.dtoOwn.settings;
    const settings: PresentationSettings = {multiMapChannel, parameterGroups};

    this.setters = [];
    if (!linkedProperties) return settings;

    for (const dto of linkedProperties) {
      const parameter = this.parameters.find(p => p.name === dto.parameterToSet);
      if (!parameter) continue;

      const setParameter = parameter.id;
      const executeParameters: Set<ParameterID> = new Set();

      for (const name of dto.parametersToExecute) {
        const id = this.resolveParameterName(name);
        if (id) executeParameters.add(id);
      }
      const setter = {client: this.id, setParameter, executeParameters, index: dto.index};
      this.setters.push(setter);
      this.parameterStore.setters.push(setter);
    }
    return settings;
  }

  private createOwnAttachedChannels(): AttachedChannel[] {
    const settings = this.dtoOwn.settings;
    if (!settings.multiMapChannel) return [];

    const criteria: ClientChannelCriteria = {multiMap: multiMapChannelCriterion};
    const factory = new AttachedChannelFactory(this.allChannels, criteria);

    const resolve = (name: ChannelName) => this.channelFactory.resolveChannelName(name);
    const channels = factory.create(this.dtoOwn.channels, resolve);

    if (!channels.some(c => c.type === 'multiMap')) delete settings.multiMapChannel;
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
      client.settings = dto.settings;
      client.loading = {status: 'init'};
    } else {
      client.loading = {status: 'error'};
    }
    return client;
  }

  /* --- Reports --- */

  /** Создаёт список программ презентации. */
  public async createPrograms(): Promise<Program[]> {
    const { ok, data } = await programAPI.getProgramList(this.id);
    if (!ok) return [];

    const create = (dto: ProgramDTO, i: number) => this.createProgram(dto, i);
    const models = await Promise.all(data.map(create));
    return models.sort(programCompareFn);
  }

  private async createProgram(dto: ProgramDTO, orderIndex: number): Promise<Program> {
    const availabilityParameters: ParameterID[] = [];
    if (dto.paramsForCheckVisibility) {
      for (const name of dto.paramsForCheckVisibility) {
        const id = this.resolveParameterName(name);
        if (id) availabilityParameters.push(id);
      }
    }

    const program: Program = {
      id: dto.id, type: dto.type, owner: this.id, orderIndex, displayName: dto.displayName,
      availabilityParameters, available: true, runnable: false,
    };
    if (availabilityParameters.length) {
      const parameters = findParameters(availabilityParameters, this.parameterStore.storage);
      program.available = await programAPI.getProgramAvailability(dto.id, parameters)
    }
    return program;
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
    this.neededChannels = this.channelFactory.getAllNeededChannels();
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
    let parameters = this.parameterStore.clients[this.id];
    let parameter = parameters.find(p => p.name === name);
    if (parameter) return parameter.id;

    parameters = this.parameterStore.clients.root;
    parameter = parameters.find(p => p.name === name);
    return parameter?.id;
  }
}
