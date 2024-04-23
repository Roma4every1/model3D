import { fillChannel } from '../lib/utils';
import { setChannelSortOrder, setChannelLimit } from './channel.actions';
import { useChannelStore } from './channel.store';
import { useParameterStore } from 'entities/parameter';


/** Перезагрузить данные каналов. */
export async function reloadChannels(names: ChannelName[]): Promise<void> {
  const state = useChannelStore.getState();
  const parameters = useParameterStore.getState();

  const channels = names.map(name => state[name]);
  await Promise.all(channels.map((channel) => fillChannel(channel, parameters)));

  for (const channel of channels) state[channel.name] = {...channel};
  useChannelStore.setState({...state}, true);
}

/** Перезагрузить данные канала. */
export async function reloadChannel(name: ChannelName): Promise<void> {
  const channel = useChannelStore.getState()[name];
  const parameters = useParameterStore.getState();
  await fillChannel(channel, parameters);
  useChannelStore.setState({[name]: {...channel}});
}

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

/** Перезагрузить данные каналов по ID запросов. */
export function reloadChannelsByQueryIDs(ids: QueryID[]): Promise<void> {
  const state = useChannelStore.getState();
  const names: ChannelName[] = [];

  for (const id of ids) {
    for (const name in state) {
      const queryID = state[name].data?.queryID;
      if (queryID === id) { names.push(name); break; }
    }
  }
  return reloadChannels(names);
}
