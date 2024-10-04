import { hasIntersection } from 'shared/lib';
import { useChannelStore } from './channel.store';


export function addChannels(channels: Channel[]): void {
  const state = useChannelStore.getState();
  const { storage, sharing } = state;

  for (const channel of channels) {
    storage[channel.id] = channel;
    let set = sharing[channel.name];
    if (!set) { set = new Set(); sharing[channel.name] = set; }
    set.add(channel.id);
  }
  useChannelStore.setState({...state}, true);
}

export function setChannels(channels: Channel[] | ChannelDict): void {
  const state = useChannelStore.getState();
  if (Array.isArray(channels)) {
    for (const channel of channels) state.storage[channel.id] = {...channel};
  } else {
    for (const id in channels) state.storage[id] = {...channels[id]};
  }
  useChannelStore.setState({...state}, true);
}

/** Задаёт активную запись канала. */
export function setChannelActiveRow(id: ChannelID, row: ChannelRow): void {
  const state = useChannelStore.getState()
  const channel = state.storage[id];
  const channelData = channel?.data;
  if (!channelData) return;
  state.storage[id] = {...channel, data: {...channelData, activeRow: row}};
  useChannelStore.setState({...state}, true);
}

/** Сбрасывает флаг актуальности для всех каналов, которые зависят от изменённых. */
export function resetDependentChannels(changes: Set<ParameterID>): void {
  const storage = useChannelStore.getState().storage;
  for (const name in storage) {
    const channel = storage[name];
    const parameters = channel.config.parameters;
    if (hasIntersection(changes, parameters)) channel.actual = false;
  }
}

export function clearChannelStore(): void {
  const idGenerator = useChannelStore.getState().idGenerator;
  idGenerator.reset();
  useChannelStore.setState({idGenerator, storage: {}, sharing: {}});
}
