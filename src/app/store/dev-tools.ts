import { fetcher } from 'shared/lib';
import { useRootStore } from './root-form.store';

import { useClientStore } from 'entities/client';
import { useChannelStore } from 'entities/channel';
import { useParameterStore } from 'entities/parameter';
import { useReportStore } from 'entities/report';
import { useWindowStore } from 'entities/window';
import { useNotificationStore } from 'entities/notification';
import { useObjectsStore } from 'entities/objects';
import { FetchStates, useFetchStateStore } from 'entities/fetch-state';

import { useTableStore } from 'features/table';
import { useChartStore } from 'features/chart';
import { useMapStore } from 'features/map';
import { CaratState, useCaratStore } from 'features/carat';
import { useProfileStore } from 'features/profile';
import { useFileViewStore } from 'features/file';
import { usePresentationStore } from 'widgets/presentation';


export class WMDevTools {
  public readonly api: any;

  constructor() {
    this.api = fetcher;
  }

  public rootState(): RootFormState {
    return useRootStore.getState();
  }

  public parameter(id: ParameterID): Parameter | null {
    for (const list of Object.values(useParameterStore.getState())) {
      const parameter = list.find(p => p.id === id);
      if (parameter) return parameter;
    }
    return null;
  }

  public parameters(id?: ClientID): ParamDict | Parameter[] {
    const state = useParameterStore.getState();
    return id === undefined ? state : state[id];
  }

  public channels(): ChannelDict {
    return useChannelStore.getState();
  }

  public channelRows(name: ChannelName, columns: boolean = false): any[][] | null {
    const channel = useChannelStore.getState()[name];
    if (!channel || !channel.data) return null;
    const rows = channel.data.rows;
    if (columns) rows.unshift(channel.data.columns.map(c => c.name));
    return rows;
  }

  public objects(): ObjectsState {
    return useObjectsStore.getState();
  }

  public presentations(): PresentationState[] {
    return Object.values(usePresentationStore.getState());
  }

  public clients(): SessionClient[] {
    return Object.values(useClientStore.getState());
  }

  public reports(): Reports {
    return useReportStore.getState();
  }

  public tables(): TableState[] {
    return Object.values(useTableStore.getState());
  }

  public chartStates(): ChartState[] {
    return Object.values(useChartStore.getState());
  }

  public mapStates(): MapState[] {
    return Object.values(useMapStore.getState());
  }

  public caratStates(): CaratState[] {
    return Object.values(useCaratStore.getState());
  }

  public profileStates(): ProfileState[] {
    return Object.values(useProfileStore.getState());
  }

  public fileViewStates(): FileViewState[] {
    return Object.values(useFileViewStore.getState());
  }

  /* --- --- */

  public fetchStates(): FetchStates {
    return useFetchStateStore.getState();
  }

  public windowStates(): WindowState[] {
    return Object.values(useWindowStore.getState());
  }

  public notificationStates(): Notifications {
    return useNotificationStore.getState().notifications;
  }
}
