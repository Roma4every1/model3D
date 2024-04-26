/** Создаёт состояния формы просмотра файлов. */
export function toFileViewState(payload: FormStatePayload): FileViewState {
  const { state: formState, channels } = payload;
  let useResources: boolean;

  for (const attachedChannel of formState.channels) {
    const properties = channels[attachedChannel.name].config.properties;
    const property = properties.find(p => p.file);
    if (!property) continue;

    useResources = property.file.fromResources;
    const nameFrom = property.file.nameFrom;
    const nameProperty = properties.find(p => p.name === nameFrom);
    if (nameProperty === undefined) continue;

    attachedChannel.info = {
      fileName: {propertyName: nameProperty.name, columnName: nameProperty.fromColumn},
      descriptor: {propertyName: property.name, columnName: property.fromColumn}, // data or path
    };
    formState.channels = [attachedChannel];
    break;
  }
  return {model: null, memo: [], useResources, loadingFlag: {current: 0}};
}
