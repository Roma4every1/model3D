import type { IJsonModel } from 'flexlayout-react';
import type { ClientDataDTO } from 'entities/client';
import { leftAntiJoin } from 'shared/lib';
import { clientAPI } from 'entities/client';
import { createChannels, getDetailChannels } from 'entities/channel';
import { createLeftLayout } from 'widgets/left-panel';
import { DataResolver } from 'widgets/presentation';
import { LayoutController } from './layout-controller';

import {
  ParameterStringTemplate, useParameterStore,
  addClientParameters, addParameterListener, getParameterChannels,
} from 'entities/parameter';


interface DockSettingsDTO {
  presentationTree?: PresentationTree;
  dateChanging?: DateChangingDTO;
  parameterGroups?: ParameterGroup[];
}
interface DateChangingDTO {
  year: string;
  dateInterval: string;
  columnName?: string | null;
}


/** Класс, который создаёт состояние корневого клиента сесии. */
export class RootClientFactory {
  private readonly id: ClientID;
  private dto: ClientDataDTO<DockSettingsDTO>;
  private parameters: Parameter[];
  private channels: ChannelDict;

  constructor(id: ClientID) {
    this.id = id;
  }

  public async createState(): Promise<RootClient> {
    const { ok, data } = await clientAPI.getClientData(this.id, 'dock');
    if (!ok) return;

    this.dto = data;
    this.parameters = addClientParameters('root', data.parameters);
    this.channels = await this.createChannels();
    const { children, activeChildren } = data.children;

    return {
      id: this.id, type: 'dock', parent: null,
      channels: [], neededChannels: Object.keys(this.channels),
      parameters: this.parameters.map(p => p.id),
      children: children, activeChildID: activeChildren[0] ?? children[0]?.id,
      settings: this.createSettings(), layout: this.createLayout(),
    };
  }

  public getParameters(): Parameter[] {
    return this.parameters;
  }

  public getChannels(): ChannelDict {
    return this.channels;
  }

  public fillData(): Promise<boolean> {
    const resolver = new DataResolver(this.channels, useParameterStore.getState().storage);
    return resolver.resolve(this.channels, this.parameters);
  }

  /* --- Settings --- */

  private createSettings(): DockSettings {
    let { presentationTree, dateChanging, parameterGroups: groups } = this.dto.settings ?? {};
    if (!presentationTree) presentationTree = [];

    this.handlePresentationTree(presentationTree);
    expandActivePresentation(presentationTree, this.dto.children.activeChildren[0]);
    if (dateChanging) this.handleDateChangingPlugin(dateChanging);

    const settings: DockSettings = {presentationTree};
    if (Array.isArray(groups) && groups.length) settings.parameterGroups = groups;
    return settings;
  }

  /** Создаёт обработчики видимости для презентаций с заданной строкой видимости. */
  private handlePresentationTree(tree: PresentationTree): void {
    let i = 0;
    const resolve = (name: ParameterName) => this.resolveParameterName(name);

    const visit = (treeItems: PresentationTreeItem[]) => {
      for (const item of treeItems) {
        if (item.items) {
          item.id = (i++).toString();
          visit(item.items);
        } else {
          const pattern: string = item.visibilityString;
          if (pattern) {
            item.visibilityString = new ParameterStringTemplate(pattern, resolve);
            item.visible = Boolean(eval(item.visibilityString.build(this.parameters)));
          } else {
            item.visible = true;
          }
        }
      }
    };
    visit(tree);
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

  private async createChannels(): Promise<ChannelDict> {
    const resolve = (name: ParameterName) => this.resolveParameterName(name);
    const baseNames = getParameterChannels(this.parameters);
    const baseChannels = await createChannels([...baseNames], resolve);

    const allDetailNames = getDetailChannels(baseChannels);
    const detailNames = leftAntiJoin(allDetailNames, baseNames);
    const detailChannels = await createChannels([...detailNames], resolve);

    for (const name of baseNames) {
      const channel = baseChannels[name];
      if (channel) channel.query.limit = null;
    }
    return {...baseChannels, ...detailChannels};
  }

  /* --- Layout --- */

  private createLayout(): DockLayout {
    const layoutRaw: IJsonModel = this.dto.layout;
    const layoutController = new LayoutController(layoutRaw.layout);
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

/**
 * Находит в дереве презентацию и выделяет найденный узел.
 * Делает все вкладки в которых находится узел раскрытыми.
 */
export function expandActivePresentation(tree: PresentationTree, activeID: FormID): boolean {
  for (const item of tree) {
    if (item.items) {
      if (expandActivePresentation(item.items, activeID)) { item.expanded = true; return; }
    } else if (item.id === activeID) {
      item.selected = true;
      return true;
    }
  }
}
