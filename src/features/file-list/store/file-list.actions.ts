import { useFileListStore } from './file-list.store';


export function createFileListState(payload: FormStatePayload): void {
  const { state: formState, channels } = payload;

  for (const attachedChannel of formState.channels) {
    const properties = channels[attachedChannel.name].config.properties;
    const property = properties.find(p => p.file);
    if (!property) continue;

    const nameFrom = property.file.nameFrom;
    const nameProperty = properties.find(p => p.name === nameFrom);
    if (!nameProperty) continue;

    attachedChannel.info = {
      fileName: {propertyName: nameProperty.name, columnName: nameProperty.fromColumn},
      descriptor: {propertyName: property.name, columnName: property.fromColumn}, // data or path
    };
    formState.channels = [attachedChannel];
    break;
  }
  useFileListStore.setState({[formState.id]: {}});
}
