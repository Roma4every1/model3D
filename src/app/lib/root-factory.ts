import type { IJsonModel } from 'flexlayout-react';
import type { ParameterGroupDTO } from 'entities/parameter';
import type { ClientDataDTO, ParameterSetterDTO } from 'entities/client';
import type { PresentationTreeDTO } from 'widgets/left-panel';
import { clientAPI } from 'entities/client';
import { PresentationTree, createLeftLayout } from 'widgets/left-panel';
import { ClientChannelFactory, DataResolver } from 'widgets/presentation';
import { LayoutController } from './layout-controller';
import { InstanceController } from './instance-controller';

import {
  useParameterStore, addClientParameters, addParameterListener,
  createParameterGroups, applyVisibilityTemplates, calcParameterVisibility,
} from 'entities/parameter';


interface DockSettingsDTO {
  presentationTree?: PresentationTreeDTO;
  linkedProperties?: ParameterSetterDTO[];
  parameterGroups?: ParameterGroupDTO[];
  dateChanging?: DateChangingDTO;
  tracesManager?: any;
  setsManager?: any;
  sitesManager?: any;
}
interface DateChangingDTO {
  year: string;
  dateInterval: string;
  columnName?: string | null;
}


/** Класс, который создаёт состояние корневого клиента сесии. */
export class RootClientFactory {
  private readonly id: ClientID;
  private readonly instanceController: InstanceController;
  private readonly setters: ParameterSetter[];

  private dto: ClientDataDTO<DockSettingsDTO>;
  private parameters: Parameter[];
  private channels: Channel[];
  private neededChannels: ChannelID[];

  constructor(id: ClientID, instanceController: InstanceController) {
    this.id = id;
    this.instanceController = instanceController;
    this.setters = useParameterStore.getState().setters;
  }

  public async createState(): Promise<RootClient> {
    const { ok, data } = await clientAPI.getClientData(this.id, 'dock');
    if (!ok) return;

    this.dto = data;
    await this.createParameters();
    await this.createChannels();

    const { children, activeChildren } = data.children;
    const wp = this.instanceController.windowParameter;
    const activeID = wp ?? activeChildren[0] ?? children[0]?.id;

    return {
      id: this.id, type: 'dock', parent: null,
      channels: [], neededChannels: this.neededChannels,
      parameters: this.parameters.map(p => p.id),
      children: children, activeChildID: activeID,
      settings: this.createSettings(activeID), layout: this.createLayout(),
    };
  }

  public getParameters(): Parameter[] {
    return this.parameters;
  }

  public getChannels(): Channel[] {
    return this.channels;
  }

  public getSettingsDTO(): DockSettingsDTO {
    return this.dto.settings;
  }

  public async fillData(): Promise<boolean> {
    const resolver = new DataResolver();
    const result = await resolver.resolve(this.channels, this.parameters, this.setters);
    const storage = useParameterStore.getState().storage;
    for (const parameter of this.parameters) calcParameterVisibility(parameter, storage);
    return result;
  }

  /* --- Parameters --- */

  private async createParameters(): Promise<void> {
    const inits = this.dto.parameters;
    this.parameters = addClientParameters('root', inits);

    if (!this.instanceController.main) {
      const res = this.instanceController.sendRequest('init', 'root');
      const values = await res.catch(() => null);

      values?.forEach(({name, value}) => {
        const parameter = this.parameters.find(p => p.name === name);
        parameter.setValue(value);
      });
    }
    const resolve = (name: ParameterName) => this.resolveParameterName(name);
    applyVisibilityTemplates(this.parameters, inits, resolve);
  }

  /* --- Settings --- */

  private createSettings(activeID: ClientID): DockSettings {
    const dto = this.dto.settings ?? {};
    const { presentationTree: treeDTO, dateChanging, parameterGroups: groups } = dto;

    const resolve = (name: ParameterName) => this.resolveParameterName(name);
    const presentationTree = new PresentationTree(treeDTO ?? [], activeID, resolve);
    presentationTree.updateVisibility(this.parameters);
    presentationTree.updateNodes();

    if (dateChanging) this.handleDateChangingPlugin(dateChanging);
    const setters = dto.linkedProperties;
    if (Array.isArray(setters) && setters.length) this.handleParameterSetters(setters);

    const settings: DockSettings = {presentationTree};
    if (Array.isArray(groups) && groups.length) {
      const parameterGroups = createParameterGroups(this.parameters, groups);
      if (parameterGroups) settings.parameterGroups = parameterGroups;
    }
    return settings;
  }

  private handleParameterSetters(setters: ParameterSetterDTO[]): void {
    for (const dto of setters) {
      const setParameter = this.resolveParameterName(dto.parameterToSet);
      if (!setParameter) continue;
      const executeParameters: Set<ParameterID> = new Set();

      for (const name of dto.parametersToExecute) {
        const id = this.resolveParameterName(name);
        if (id) executeParameters.add(id);
      }
      this.setters.push({client: this.id, setParameter, executeParameters, index: dto.index});
    }
  }

  private handleDateChangingPlugin(dto: DateChangingDTO): void {
    const yearParameter = this.parameters.find(p => p.name === dto.year);
    const idToUpdate = this.resolveParameterName(dto.dateInterval);
    if (!yearParameter || idToUpdate === undefined) return;

    let callback: OnParameterUpdate;
    const { id, type: parameterType } = yearParameter;

    function set(year: number, storage: ParameterMap): ParameterID {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      storage.get(idToUpdate).setValue({start, end});
      return idToUpdate;
    }

    if (parameterType === 'integer') {
      callback = (value: number | null, storage: ParameterMap): ParameterID => {
        if (value !== null) return set(value, storage);
      };
    } else if (parameterType === 'date') {
      callback = (value: Date | null, storage: ParameterMap): ParameterID => {
        if (value !== null) return set(value.getFullYear(), storage);
      };
    } else if (parameterType === 'tableRow' && dto.columnName) {
      const columnName = dto.columnName;
      callback = (value: Record<string, TypedCell> | null, storage: ParameterMap): ParameterID => {
        const year = value === null ? undefined : value[columnName]?.value;
        if (typeof year === 'number') return set(year, storage);
      };
    }
    if (callback) addParameterListener(id, callback);
  }

  /* --- Channels --- */

  private async createChannels(): Promise<void> {
    const resolve = (name: ParameterName) => this.resolveParameterName(name);
    const factory = new ClientChannelFactory(resolve);
    this.channels = await factory.create(this.parameters);
    this.neededChannels = factory.getAllNeededChannels();
  }

  /* --- Layout --- */

  private createLayout(): DockLayout {
    const layoutRaw: IJsonModel = this.dto.layout;
    const layoutController = new LayoutController(layoutRaw.layout, !this.instanceController.main);
    return {controller: layoutController, left: createLeftLayout(layoutRaw)};
  }

  /* --- Utils --- */

  private resolveParameterName(name: ParameterName): ParameterID {
    for (const parameter of this.parameters) {
      if (parameter.name === name) return parameter.id;
    }
    return undefined;
  }
}
