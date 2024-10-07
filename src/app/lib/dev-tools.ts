import { fetcher } from 'shared/lib';
import { useGlobalStore } from 'shared/global';
import { useAppStore } from '../store/app.store';

import { useClientStore } from 'entities/client';
import { useChannelStore } from 'entities/channel';
import { useParameterStore } from 'entities/parameter';
import { useProgramStore } from 'entities/program';
import { useWindowStore } from 'entities/window';
import { useNotificationStore } from 'entities/notification';
import { useObjectsStore } from 'entities/objects';

import { useTableStore } from 'features/table';
import { useChartStore } from 'features/chart';
import { useMapStore } from 'features/map';
import { useMultiMapStore } from 'features/multi-map';
import { useCaratStore } from 'features/carat';
import { useProfileStore } from 'features/profile';
import { useFileViewStore } from 'features/file';


export class WMDevTools {
  public readonly api = fetcher;
  public readonly global = useGlobalStore;
  public readonly app = useAppStore;
  public readonly clients = useClientStore;
  public readonly channels = useChannelStore;
  public readonly parameters = useParameterStore;
  public readonly programs = useProgramStore;
  public readonly objects = useObjectsStore;

  /* --- Global Store --- */

  public get config(): AppConfig {
    return this.global.getState().config;
  }

  /* --- Client Store --- */

  public getClients(type?: ClientType): any {
    const all = Object.values(this.clients.getState());
    return type ? all.filter(c => c.type === type) : all;
  }

  public getRoot(): any {
    return this.clients.getState().root;
  }

  public getPresentations(): any {
    const state = this.clients.getState();
    return Object.values(state).filter(c => c.type === 'grid');
  }

  public getActivePresentation(): any {
    const state = this.clients.getState();
    return state[state.root.activeChildID];
  }

  public getForms(): any {
    const state = this.clients.getState();
    return Object.values(state).filter(c => c.id !== 'root' && c.type !== 'grid');
  }

  public getActiveForms(type?: ClientType): any {
    const state = this.clients.getState();
    const children = state[state.root.activeChildID].children;
    const all = children.map(c => state[c.id]);
    return type ? all.filter(c => c.type === type) : all;
  }

  /* --- Parameter Store --- */

  public getParameter(descriptor: ParameterID | ParameterName): any {
    const state = this.parameters.getState();
    if (typeof descriptor === 'number') return state.storage.get(descriptor) ?? null;

    for (const list of Object.values(state.clients)) {
      const parameter = list.find(p => p.name === descriptor);
      if (parameter) return parameter;
    }
    return null;
  }

  public getGlobalParameters(): any {
    return this.parameters.getState().clients.root;
  }

  public getLocalParameters(id?: ClientID): any {
    if (id === undefined) id = this.clients.getState().root.activeChildID;
    return this.parameters.getState().clients[id];
  }

  /* --- Channel Store --- */

  public getChannel(descriptor: ChannelID | ChannelName): any {
    const state = this.channels.getState();
    if (typeof descriptor === 'number') return state.storage[descriptor];

    const channels = Object.values(state.storage).filter(c => c.name === descriptor);
    if (channels.length === 0) return null;
    if (channels.length === 1) return channels[0];
    return channels;
  }

  public getChannelRows(descriptor: ChannelID | ChannelName, columns: boolean = false): any {
    const channel = this.getChannel(descriptor);
    if (Array.isArray(channel)) {
      const ids = channel.map(c => c.id).join(', ');
      console.log(`Choose an ID from ${ids} and repeat the call`);
    } else {
      if (!channel || !channel.data) return null;
      const rows = channel.data.rows;
      if (columns) rows.unshift(channel.data.columns.map(c => c.name));
      return rows;
    }
  }

  public getChannels(): any {
    return this.channels.getState().storage;
  }

  public getPresentationChannels(id?: ClientID): any {
    const clients = this.clients.getState();
    const ids = clients[id ?? clients.root.activeChildID].neededChannels;
    const storage = this.channels.getState().storage;
    return ids.map(id => storage[id]);
  }

  public getSharingChannels(): any {
    const result: Record<ChannelName, Channel[]> = {};
    const { storage, sharing } = this.channels.getState();

    for (const name in sharing) {
      if (sharing[name].size < 2) continue;
      result[name] = [...sharing[name]].map(id => storage[id]);
    }
    return result;
  }

  /* --- Objects Store --- */

  public getObjects(): any {
    return this.objects.getState();
  }

  public getObjectModels(): any {
    const { place, stratum, well, trace } = this.objects.getState();
    return {place: place.model, stratum: stratum.model, well: well.model, trace: trace.model};
  }

  /* --- Program Store --- */

  public getClientPrograms(id: ClientID, active?: boolean): any {
    const models = this.programs.getState().models[id] ?? [];
    return active ? models.filter(m => m.parameters) : models;
  }

  /* --- Typed Clients --- */

  public get tables(): any {
    return Object.values(useTableStore.getState());
  }

  public get charts(): any {
    return Object.values(useChartStore.getState());
  }

  public get maps(): any {
    return Object.values(useMapStore.getState());
  }

  public get multiMaps(): any {
    return Object.values(useMultiMapStore.getState());
  }

  public get carats(): any {
    return Object.values(useCaratStore.getState());
  }

  public get profiles(): any {
    return Object.values(useProfileStore.getState());
  }

  public get fileViews(): any {
    return Object.values(useFileViewStore.getState());
  }

  /* --- --- */

  public get windows(): any {
    return Object.values(useWindowStore.getState());
  }

  public get notifications(): any {
    return useNotificationStore.getState().notifications;
  }
}
