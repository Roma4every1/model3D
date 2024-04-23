import { useFileListStore } from './file-list.store';


export function createFileListState(payload: FormStatePayload): void {
  const { state: formState, channels } = payload;

  for (const attachedChannel of formState.channels) {
    const properties = channels[attachedChannel.name].info.properties;
    const property = properties.find(p => p.file);
    if (!property) continue;

    const nameFrom = property.file.nameFrom;
    const nameProperty = properties.find(p => p.name === nameFrom);
    if (!nameProperty) continue;

    attachedChannel.columnInfo = {
      fileName: {name: nameProperty.fromColumn, index: -1}, // name
      descriptor: {name: property.fromColumn, index: -1},   // data or path
    };
    formState.channels = [attachedChannel];
    break;
  }
  useFileListStore.setState({[formState.id]: {}});
}
