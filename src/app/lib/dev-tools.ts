import { fetcher } from 'shared/lib';
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
  public readonly appStore = useAppStore;
  public readonly clientStore = useClientStore;
  public readonly channelStore = useChannelStore;
  public readonly parameterStore = useParameterStore;
  public readonly programStore = useProgramStore;
  public readonly objectsStore = useObjectsStore;

  public rootState() {
    return this.clientStore.getState().root;
  }

  public parameters() {
    return this.parameterStore.getState();
  }

  public parameter(arg: ParameterID | ParameterName) {
    const state = this.parameterStore.getState();
    if (typeof arg === 'number') return state.storage.get(arg) ?? null;

    for (const list of Object.values(state.clients)) {
      const parameter = list.find(p => p.name === arg);
      if (parameter) return parameter;
    }
    return null;
  }

  public clientParameters(id?: ClientID) {
    const state = this.parameterStore.getState().clients;
    return id === undefined ? state : state[id];
  }

  public channels() {
    return this.channelStore.getState();
  }

  public channelRows(name: ChannelName, columns: boolean = false) {
    const channel = this.channelStore.getState()[name];
    if (!channel || !channel.data) return null;
    const rows = channel.data.rows;
    if (columns) rows.unshift(channel.data.columns.map(c => c.name));
    return rows;
  }

  public objects() {
    return this.objectsStore.getState();
  }

  public objectModels() {
    const { place, stratum, well, trace } = this.objectsStore.getState();
    return {place: place.model, stratum: stratum.model, well: well.model, trace: trace.model};
  }

  public presentations() {
    const clients = Object.values(this.clientStore.getState());
    return clients.filter(c => c.type === 'grid');
  }

  public clients() {
    return Object.values(this.clientStore.getState());
  }

  public programs(id?: ClientID, active?: boolean) {
    const allModels = this.programStore.getState().models;
    if (!id) return allModels;
    const models = allModels[id] ?? [];
    return active ? models.filter(m => m.parameters) : models;
  }

  public tables() {
    return Object.values(useTableStore.getState());
  }

  public chartStates() {
    return Object.values(useChartStore.getState());
  }

  public mapStates() {
    return Object.values(useMapStore.getState());
  }

  public multiMapStates() {
    return Object.values(useMultiMapStore.getState());
  }

  public caratStates() {
    return Object.values(useCaratStore.getState());
  }

  public profileStates() {
    return Object.values(useProfileStore.getState());
  }

  public fileViewStates() {
    return Object.values(useFileViewStore.getState());
  }

  /* --- --- */

  public windowStates() {
    return Object.values(useWindowStore.getState());
  }

  public notificationStates() {
    return useNotificationStore.getState().notifications;
  }
}
