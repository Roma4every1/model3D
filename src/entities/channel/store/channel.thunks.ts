import { useParameterStore, findParameters } from 'entities/parameter';
import { useChannelStore } from './channel.store';
import { fillChannel } from '../lib/utils';
import { setChannelSortOrder, setChannelLimit } from './channel.actions';


/** Перезагрузить данные канала. */
export async function reloadChannel(name: ChannelName): Promise<void> {
  const channel = useChannelStore.getState()[name];
  const parameterStorage = useParameterStore.getState().storage;
  await fillChannel(channel, findParameters(channel.config.parameters, parameterStorage));
  useChannelStore.setState({[name]: {...channel}});
}

/** Перезагрузить данные каналов по ID запросов. */
export async function reloadChannelsByQueryIDs(ids: QueryID[]): Promise<void> {
  const state = useChannelStore.getState();
  const parameterStorage = useParameterStore.getState().storage;

  const promises: Promise<void>[] = [];
  for (const channel of Object.values(state)) {
    const queryID = channel.data?.queryID;
    if (!queryID || !ids.includes(queryID)) continue;

    const newChannel = {...channel};
    const parameters = findParameters(newChannel.config.parameters, parameterStorage);
    promises.push(fillChannel(newChannel, parameters));
    state[channel.name] = newChannel;
  }
  await Promise.all(promises);
  useChannelStore.setState({...state}, true);
}

/* --- --- */

/** Обновляет порядок сортировки и перезагружает канал. */
export function updateChannelSortOrder(name: ChannelName, order: SortOrder): Promise<void> {
  setChannelSortOrder(name, order);
  return reloadChannel(name);
}

/** Обновляет ограничитель количества строк и перезагружает канал. */
export function updateChannelLimit(name: ChannelName, limit: ChannelLimit): Promise<void> {
  setChannelLimit(name, limit);
  return reloadChannel(name);
}
