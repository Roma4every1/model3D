import { useChannelStore } from './channel.store';


/** Добавляет несколько каналов в хранилище. */
export function setChannels(channels: ChannelDict): void {
  useChannelStore.setState(channels);
}

/** Добавляет или перезаписывает данные о порядке строк. */
export function setChannelSortOrder(name: ChannelName, order: SortOrder | undefined): void {
  const channel = useChannelStore.getState()[name];
  useChannelStore.setState({[name]: {...channel, query: {...channel.query, order}}});
}

/** Перезаписывает ограничитель количества строк. */
export function setChannelLimit(name: ChannelName, limit: ChannelLimit | undefined): void {
  const channel = useChannelStore.getState()[name];
  const query: ChannelQuerySettings = {...channel.query, limit};
  useChannelStore.setState({[name]: {...channel, query}});
}

/** Задаёт активную запись канала. */
export function setChannelActiveRow(name: ChannelName, row: ChannelRow): void {
  const channel = useChannelStore.getState()[name];
  const channelData = channel?.data;
  if (!channelData) return;
  useChannelStore.setState({[name]: {...channel, data: {...channelData, activeRow: row}}});
}
