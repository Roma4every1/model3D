/** Создаёт состояния формы просмотра файлов. */
export function toFileViewState(payload: FormStatePayload): FileViewState {
  const { state: formState, channels } = payload;
  let useResources: boolean;

  for (const attachedChannel of formState.channels) {
    const properties = channels[attachedChannel.name].info.properties;
    const property = properties.find(p => p.file);
    if (!property) continue;

    useResources = property.file.fromResources;
    const nameFrom = property.file.nameFrom;
    const nameProperty = properties.find(p => p.name === nameFrom);
    if (nameProperty === undefined) continue;

    attachedChannel.columnInfo = {
      fileName: {name: nameProperty.fromColumn, index: -1}, // name
      descriptor: {name: property.fromColumn, index: -1},   // data or path
    };
    formState.channels = [attachedChannel];
    break;
  }
  return {model: null, memo: [], useResources};
}
