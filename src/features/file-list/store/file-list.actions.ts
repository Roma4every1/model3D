import { useFileListStore } from './file-list.store';


export function createFileListState(payload: FormStatePayload): void {
  const { state, channels } = payload;
  let fileProperty: ChannelProperty;

  for (const attachedChannel of state.channels) {
    const properties = channels[attachedChannel.id].config.properties;
    fileProperty = properties.find(p => p.file?.nameFrom);
    if (fileProperty) { state.channels = [attachedChannel]; break; }
  }
  if (!fileProperty) state.channels = [];
  useFileListStore.setState({[state.id]: {}});
}
