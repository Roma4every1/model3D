import { useParameterStore, findParameters } from 'entities/parameter';
import { useChannelStore } from './channel.store';


export async function updateChannels(channels: ChannelDict): Promise<void> {
  const state = useChannelStore.getState();
  const parameterStorage = useParameterStore.getState().storage;

  await Promise.all(Object.values(channels).map((channel: Channel): Promise<boolean> => {
    const parameters = findParameters(channel.config.parameters, parameterStorage);
    return state.dataManager.update(channel, parameters);
  }));
}

/** Перезагрузить данные канала. */
export async function reloadChannel(id: ChannelID): Promise<void> {
  const state = useChannelStore.getState();
  const channel = state.storage[id];
  channel.actual = false;

  const parameterStorage = useParameterStore.getState().storage;
  const parameters = findParameters(channel.config.parameters, parameterStorage);

  useChannelStore.setState({...state}, true);
  const updated = await state.dataManager.update(channel, parameters, true);
  if (updated) useChannelStore.setState({...state}, true);
}

/** Перезагрузить данные каналов. */
export async function reloadChannels(...ids: ChannelID[]): Promise<void> {
  const state = useChannelStore.getState();
  const parameterStorage = useParameterStore.getState().storage;

  const updates = ids.map((id: ChannelID): Promise<boolean> => {
    const channel = state.storage[id];
    channel.actual = false;
    const parameters = findParameters(channel.config.parameters, parameterStorage);
    return state.dataManager.update(channel, parameters, true);
  });
  useChannelStore.setState({...state}, true);
  await Promise.all(updates);
  useChannelStore.setState({...state}, true);
}

/** Перезагрузить данные каналов по ID запросов. */
export async function reloadChannelsByQueryIDs(ids: QueryID[]): Promise<void> {
  const state = useChannelStore.getState();
  const parameterStorage = useParameterStore.getState().storage;

  const updates: Promise<boolean>[] = [];
  for (const channel of Object.values(state.storage)) {
    const queryID = channel.data?.queryID;
    if (!queryID || !ids.includes(queryID)) continue;
    channel.actual = false;
    const parameters = findParameters(channel.config.parameters, parameterStorage);
    updates.push(state.dataManager.update(channel, parameters, true));
  }
  useChannelStore.setState({...state}, true);
  await Promise.all(updates);
  useChannelStore.setState({...state}, true);
}

/* --- --- */

/** Обновляет порядок сортировки и перезагружает канал. */
export function updateChannelSortOrder(id: ChannelID, order: SortOrder): Promise<void> {
  const state = useChannelStore.getState();
  const channel = state.storage[id];
  state.storage[id] = {...channel, query: {...channel.query, order}};
  return reloadChannel(id);
}

/** Обновляет ограничитель количества строк и перезагружает канал. */
export function updateChannelLimit(id: ChannelID, limit: ChannelLimit): Promise<void> {
  const state = useChannelStore.getState();
  const channel = state.storage[id];
  state.storage[id] = {...channel, query: {...channel.query, limit}};
  return reloadChannel(id);
}
