import { useParameterStore, findParameters } from 'entities/parameter';
import { useChannelStore } from './channel.store';
import { fillChannel } from '../lib/utils';


/** Перезагрузить данные канала. */
export async function reloadChannel(id: ChannelID): Promise<void> {
  const state = useChannelStore.getState();
  const channel = state.storage[id];
  const parameterStorage = useParameterStore.getState().storage;
  await fillChannel(channel, findParameters(channel.config.parameters, parameterStorage));
  state.storage[id] = {...channel};
  useChannelStore.setState({...state}, true);
}

/** Перезагрузить данные каналов по ID запросов. */
export async function reloadChannelsByQueryIDs(ids: QueryID[]): Promise<void> {
  const state = useChannelStore.getState();
  const parameterStorage = useParameterStore.getState().storage;

  const actions: Promise<void>[] = [];
  for (const channel of Object.values(state.storage)) {
    const queryID = channel.data?.queryID;
    if (!queryID || !ids.includes(queryID)) continue;

    const newChannel = {...channel};
    const parameters = findParameters(newChannel.config.parameters, parameterStorage);
    actions.push(fillChannel(newChannel, parameters));
    state.storage[channel.id] = newChannel;
  }
  await Promise.all(actions);
  useChannelStore.setState({...state}, true);
}

/* --- --- */

/** Обновляет порядок сортировки и перезагружает канал. */
export function updateChannelSortOrder(id: ChannelID, order: SortOrder): Promise<void> {
  const state = useChannelStore.getState();
  const channel = state.storage[id];
  state.storage[id] = {...channel, query: {...channel.query, order}};
  useChannelStore.setState({...state}, true);
  return reloadChannel(id);
}

/** Обновляет ограничитель количества строк и перезагружает канал. */
export function updateChannelLimit(id: ChannelID, limit: ChannelLimit): Promise<void> {
  const state = useChannelStore.getState();
  const channel = state.storage[id];
  state.storage[id] = {...channel, query: {...channel.query, limit}};
  useChannelStore.setState({...state}, true);
  return reloadChannel(id);
}
